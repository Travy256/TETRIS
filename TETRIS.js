document.addEventListener('DOMContentLoaded', () => {

    const width = 10;
    const height = 20;

    const grid = document.querySelector('.grid');
    const squares = [];
    
    let currentPosition = 4; // Starting position of the tetromino
    let currentRotation = 0;
  
    // Create the grid
    for (let i = 0; i < width * height; i++) {
      const square = document.createElement('div');
      grid.appendChild(square);
      squares.push(square);
    }
  
    // Define Tetrominoes
    const lTetromino = [
      [1, width + 1, width * 2 + 1, 2],
      [width, width + 1, width + 2, width * 2 + 2],
      [1, width + 1, width * 2 + 1, width * 2],
      [width, width * 2, width * 2 + 1, width * 2 + 2],
    ];
  
    const tetrominoes = [lTetromino]; // Add more tetrominoes here
  
    // Select a random tetromino
    let random = Math.floor(Math.random() * tetrominoes.length);
    let current = tetrominoes[random][currentRotation];
  
    // Draw the tetromino
    function draw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.add('tetromino');
      });
    }
  
    // Undraw the tetromino
    function undraw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.remove('tetromino');
      });
    }
  
    // Make the tetromino fall
    function moveDown() {
      undraw();
      currentPosition += width;
      draw();
      freeze();
    }
  
    // Freeze the tetromino when it reaches the bottom or another tetromino
    function freeze() {
      if (current.some(index => squares[currentPosition + index + width]?.classList.contains('taken'))) {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'));
        // Start a new tetromino falling
        random = Math.floor(Math.random() * tetrominoes.length);
        current = tetrominoes[random][currentRotation];
        currentPosition = 4;
        draw();
      }
    }
  
    // Move the tetromino left, unless it's at the edge or blocked
    function moveLeft() {
      undraw();
      const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
      if (!isAtLeftEdge) currentPosition -= 1;
      if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition += 1;
      }
      draw();
    }
  
    // Move the tetromino right, unless it's at the edge or blocked
    function moveRight() {
      undraw();
      const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
      if (!isAtRightEdge) currentPosition += 1;
      if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition -= 1;
      }
      draw();
    }
  
    // Rotate the tetromino
    function rotate() {
      undraw();
      currentRotation = (currentRotation + 1) % current.length;
      current = tetrominoes[random][currentRotation];
      draw();
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