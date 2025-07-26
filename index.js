document.addEventListener('DOMContentLoaded', () => {

    const squares = [];

    const width = 10;
    const height = 20;

    const grid = document.querySelector('.grid');

    let gameOver = false;

    let score = 0; // Initialize the score
    const scoreDisplay = document.getElementById('score');

    let currentPosition = 4; // Starting position of the tetromino
    let currentRotation = 0;

    const previewGrid = document.querySelector('.preview-grid');
    const previewSquares = [];

    let soundEnabled = localRead("sound") ?? true;

    const infoIcon = document.getElementById('info-icon');

    const soundOnIcon = document.getElementById('sound-on-icon');
    const soundOffIcon = document.getElementById('sound-off-icon');

    // Create the preview grid (4x4)
    for (let i = 0; i < 16; i++) {
        const square = document.createElement('div');
        previewGrid.appendChild(square);
        previewSquares.push(square);
    }

    // Create the grid
    for (let i = 0; i < width * height; i++) {
        const square = document.createElement('div');
        grid.appendChild(square);
        squares.push(square);
    }

    // Add a solid bottom row (invisible boundary)
    for (let i = 0; i < width; i++) {
        const square = document.createElement('div');
        square.classList.add('taken'); // Mark as taken to act as the bottom boundary
        squares.push(square); // Add to the squares array but NOT to the visible grid
    }

    // Define Tetrominoes
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2],
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1],
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
    ];

    const tetrominoes = [lTetromino, tTetromino, zTetromino, oTetromino, iTetromino];

    // Select a random tetromino
    let random = Math.floor(Math.random() * tetrominoes.length);

    // Draw the tetromino
    function draw() {
        tetrominoes[random][currentRotation].forEach(index => {
            const squareIndex = currentPosition + index;
            if (squareIndex >= 0 && squareIndex < squares.length) { // Ensure index is within bounds
                squares[squareIndex].classList.add('tetromino');
                squares[squareIndex].classList.add(`tetromino-${random}`); // Add unique class
            }
        });
    }

    // Undraw the tetromino
    function undraw() {
        tetrominoes[random][currentRotation].forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino'); // Remove the generic tetromino class
            squares[currentPosition + index].classList.remove(`tetromino-${random}`); // Remove the specific tetromino class
        });
    }

    async function freeze() {

        if (tetrominoes[random][currentRotation].some(index => squares[currentPosition + index + width]?.classList.contains('taken'))) {

            tetrominoes[random][currentRotation].forEach(index => squares[currentPosition + index].classList.add('taken'));

            // Check for full rows
            checkForFullRows();

            // Start a new tetromino
            currentRotation = 0; // Reset rotation
            currentPosition = 4; // Reset position

            random = Math.floor(Math.random() * tetrominoes.length);

            // Check for Game Over
            if (tetrominoes[random][currentRotation].some(index => squares[currentPosition + index].classList.contains('taken'))) {
                if (!gameOver) { // Only trigger game-over logic once
                    gameOver = true; // Set the game-over flag
                    clearInterval(timerId); // Stop the game loop

                    // Play game over sound
                    await playSound('sounds/gameover.wav');

                    checkHighScore(score);

                }
            } else {
                draw();
                drawGhost();
            }

        }

    }

    // Make the tetromino fall
    function moveDown() {

        undraw();
        undrawGhost();

        currentPosition += width;

        draw();
        drawGhost();

        freeze();

    }

    function moveLeft() {

        playSound('sounds/move.wav');

        undraw();
        undrawGhost();

        const isAtLeftEdge = tetrominoes[random][currentRotation].some(index => (currentPosition + index) % width === 0);

        if (!isAtLeftEdge) currentPosition -= 1;

        if (tetrominoes[random][currentRotation].some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }

        draw();
        drawGhost();

    }

    function moveRight() {

        playSound('sounds/move.wav');

        undraw();
        undrawGhost();

        const isAtRightEdge = tetrominoes[random][currentRotation].some(index => (currentPosition + index) % width === width - 1);

        if (!isAtRightEdge) currentPosition += 1;

        if (tetrominoes[random][currentRotation].some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }

        draw();
        drawGhost();

    }

    function rotate() {

        playSound('sounds/rotate.wav');

        undraw();
        undrawGhost();

        const nextRotation = (currentRotation + 1) % tetrominoes[random].length;
        const nextShape = tetrominoes[random][nextRotation];

        function isValid(pos) {
            return nextShape.every(index => {
                const newPos = pos + index;
                if (newPos < 0 || newPos >= width * height) return false;
                // Prevent wrapping: ensure the block stays in the correct row
                const fromCol = (pos % width);
                const toCol = ((pos + index) % width + width) % width; // always positive
                if (Math.abs(toCol - fromCol) > 4) return false; // 4 is max tetromino width
                if (toCol < 0 || toCol >= width) return false;
                if (squares[newPos]?.classList.contains('taken')) return false;
                return true;
            });
        }

        // Try normal rotation and wall kicks up to 2 columns left/right
        for (let offset of [0, 1, -1, 2, -2]) {
            if (isValid(currentPosition + offset)) {
                currentPosition += offset;
                currentRotation = nextRotation;
                break;
            }
        }

        draw();
        drawGhost();

    }

    function checkForFullRows() {

        for (let i = 0; i < height; i++) {

            const rowStart = i * width;
            const row = squares.slice(rowStart, rowStart + width);

            // Check if all squares in the row are taken
            if (row.every(square => square.classList.contains('taken'))) {

                // Remove the row
                row.forEach(square => {
                    square.className = '';
                    square.style.backgroundColor = ''; // Reset background color
                });

                // Add a new empty row at the top
                const removedSquares = squares.splice(rowStart, width);
                squares.unshift(...removedSquares);
                removedSquares.forEach(square => grid.prepend(square));

                // Update the score
                score += 10;
                scoreDisplay.textContent = score;

                // Play clear row sound
                playSound('sounds/clear.wav');

            }

        }

    }

    // Function to calculate the ghost position
    function calculateGhostPosition() {
        let ghostPosition = currentPosition;

        // Move the ghost down until it collides with a taken square or the bottom
        while (
            !tetrominoes[random][currentRotation].some(index => {
                const squareIndex = ghostPosition + index + width;
                return squareIndex >= squares.length || squares[squareIndex]?.classList.contains('taken');
            })
        ) {
            ghostPosition += width;
        }

        return ghostPosition;
    }

    // Function to draw the ghost block
    function drawGhost() {
        const ghostPosition = calculateGhostPosition();

        tetrominoes[random][currentRotation].forEach(index => {
            const squareIndex = ghostPosition + index;
            if (squareIndex >= 0 && squareIndex < squares.length) { // Ensure index is within bounds
                squares[squareIndex].classList.add('ghost');
            }
        });
    }

    // Function to undraw the ghost block
    function undrawGhost() {
        squares.forEach(square => square.classList.remove('ghost'));
    }

    function hardDrop() {
        // Calculate the ghost position
        const ghostPosition = calculateGhostPosition();

        // Move the tetromino to the ghost position
        undraw();
        currentPosition = ghostPosition;
        draw();

        // Freeze the tetromino in place
        freeze();

        playSound('sounds/drop.wav');
    }

    infoIcon.addEventListener('click', () => {

        let instructionsImg = document.getElementById('instructions');
        let gameContainer = document.getElementById('game-container');

        let instructionsVisible = instructionsImg.style.display === 'block';

        if (instructionsVisible) {
            instructionsImg.style.display = 'none';
            gameContainer.style.display = 'flex';
        } else {
            instructionsImg.style.display = 'block';
            gameContainer.style.display = 'none';
        }

    });

    async function playSound(src) {
        if (!soundEnabled) return;
        return new Promise((resolve, reject) => {
            const sound = new Audio(src);
            sound.onended = resolve;
            sound.onerror = reject;
            sound.play();
        });
    }

    function updateSoundSetting(value) {

        soundEnabled = value;

        localWrite("sound", soundEnabled);

        soundOnIcon.style.display = soundEnabled ? 'block' : 'none';
        soundOffIcon.style.display = soundEnabled ? 'none' : 'block';

    }

    function getHighScores() {
        return localRead('highScores') || [];
    }

    function saveHighScores(scores) {
        return localWrite('highScores', scores);
    }

    function updateHighScoresDisplay() {
        const highScores = getHighScores();
        const highScoresList = document.getElementById('high-scores');
        highScoresList.innerHTML = '';
        highScores.slice(0, 10).forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.name}: ${entry.score}`;
            highScoresList.appendChild(li);
        });
    }

    // Call this once on page load
    updateHighScoresDisplay();

    // Call this in your freeze() function, after game over is detected:
    function checkHighScore(score) {
        let highScores = getHighScores();
        // Add the new score if it's in the top 10 or if there are less than 10 scores
        if (highScores.length < 10 || score > highScores[highScores.length - 1].score) {
            const name = prompt('New High Score! Enter your name:');
            if (name) {
                highScores.push({ name, score });
                // Sort descending and keep top 10
                highScores = highScores.sort((a, b) => b.score - a.score).slice(0, 10);
                saveHighScores(highScores);
                updateHighScoresDisplay();
            }
        }
    }

    soundOnIcon.addEventListener('click', () => {
        updateSoundSetting(false);
    });

    soundOffIcon.addEventListener('click', () => {
        updateSoundSetting(true);
    });

    // Assign functions to keycodes
    function control(e) {
        if (!gameOver) {
            if (e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 40) {
                moveDown();
            } else if (e.keyCode === 13) {
                hardDrop();
            }
        }
    }

    document.addEventListener('keydown', control);

    const timerId = setInterval(moveDown, 1000);

    updateSoundSetting(soundEnabled);

    // Start the game!
    draw();

});