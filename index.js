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
    let current = tetrominoes[random][currentRotation];

    // Draw the tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].classList.add(`tetromino-${random}`); // Add unique class
        });
    }

    // Undraw the tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino'); // Remove the generic tetromino class
            squares[currentPosition + index].classList.remove(`tetromino-${random}`); // Remove the specific tetromino class
        });
    }

    // Make the tetromino fall
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    function freeze() {

        if (current.some(index => squares[currentPosition + index + width]?.classList.contains('taken'))) {

            current.forEach(index => squares[currentPosition + index].classList.add('taken'));

            // Check for full rows
            checkForFullRows();

            // Start a new tetromino
            random = Math.floor(Math.random() * tetrominoes.length);
            current = tetrominoes[random][currentRotation];
            currentPosition = 4;

            // Check for Game Over
            if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {

                clearInterval(timerId);

                // Play game over sound
                playSound('sounds/gameover.wav');

                alert('Game Over');

            }

            draw();

        }

    }

    function moveLeft() {

        undraw();

        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

        if (!isAtLeftEdge) currentPosition -= 1;

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }

        draw();

        // Play move sound
        playSound('sounds/move.wav');

    }

    function moveRight() {

        undraw();

        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);

        if (!isAtRightEdge) currentPosition += 1;

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }

        draw();

        // Play move sound
        playSound('sounds/move.wav');

    }

    function rotate() {

        undraw();

        currentRotation = (currentRotation + 1) % current.length;
        current = tetrominoes[random][currentRotation];

        draw();

        // Play rotate sound
        playSound('sounds/rotate.wav');

    }

    function checkForFullRows() {

        for (let i = 0; i < height; i++) {

            const rowStart = i * width;
            const row = squares.slice(rowStart, rowStart + width);

            // Check if all squares in the row are taken
            if (row.every(square => square.classList.contains('taken'))) {

                // Remove the row
                row.forEach(square => {
                    square.classList.remove('taken', 'tetromino', ...Array.from(square.classList)); // Remove all classes
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
        }

    }

    document.addEventListener('keydown', control);

    // Start the game
    draw();

    const timerId = setInterval(moveDown, 1000);

});