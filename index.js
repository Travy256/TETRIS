document.addEventListener('DOMContentLoaded', () => {

    const squares = [];

    const width = 10;
    const height = 20;

    const grid = document.querySelector('.grid');

    let score = 0; // Initialize the score
    const scoreDisplay = document.getElementById('score');

    let currentPosition = 4; // Starting position of the tetromino
    let currentRotation = 0;

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

    function freeze() {

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

                clearInterval(timerId);

                // Play game over sound
                playSound('sounds/gameover.wav');

                alert('Game Over');

            }

            draw();
            drawGhost();

        }

    }

    // Make the tetromino fall
    function moveDown() {
        console.log('moveDown');

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
        drawGhost();

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
    
        // Play a sound for the hard drop (optional)
        playSound('sounds/harddrop.wav');
    }

    async function playSound(src) {
        return new Promise((resolve, reject) => {
            const sound = new Audio(src);
            sound.onended = resolve;
            sound.onerror = reject;
            sound.play();
        });
    }

    // Assign functions to keycodes
    function control(e) {
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

    document.addEventListener('keydown', control);

    const timerId = setInterval(moveDown, 1000);

    // Start the game
    draw();

});