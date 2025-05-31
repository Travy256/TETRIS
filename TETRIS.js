document.addEventListener('DOMContentLoaded', () => {

    const width = 10;
    const height = 20;

    const grid = document.querySelector('.grid');

    // Create the grid
    for (let i = 0; i < (width * height); i++) {
      const square = document.createElement('div');
      grid.appendChild(square);
    }
  
    // Add logic for Tetris blocks, movement, and collision detection
    // Example: Create a block
    const lTetromino = [
      [1, width + 1, width * 2 + 1, 2],
      [width, width + 1, width + 2, width * 2 + 2],
      [1, width + 1, width * 2 + 1, width * 2],
      [width, width * 2, width * 2 + 1, width * 2 + 2],
    ];
  
    // Add more logic for movement, rotation, and scoring
  });