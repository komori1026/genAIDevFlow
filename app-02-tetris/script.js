document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const context = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-piece');
    const nextContext = nextCanvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const startButton = document.getElementById('start-button');

    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 24;
    const NEXT_BLOCK_SIZE = 24;

    context.canvas.width = COLS * BLOCK_SIZE;
    context.canvas.height = ROWS * BLOCK_SIZE;
    context.scale(BLOCK_SIZE, BLOCK_SIZE);

    nextContext.canvas.width = 4 * NEXT_BLOCK_SIZE;
    nextContext.canvas.height = 4 * NEXT_BLOCK_SIZE;
    nextContext.scale(NEXT_BLOCK_SIZE, NEXT_BLOCK_SIZE);

    const COLORS = [
        null, '#e74c3c', '#f1c40f', '#3498db', '#9b59b6', '#2ecc71', '#e67e22', '#1abc9c'
    ];

    const TETROMINOS = {
        'I': [[1, 1, 1, 1]],
        'J': [[2, 0, 0], [2, 2, 2]],
        'L': [[0, 0, 3], [3, 3, 3]],
        'O': [[4, 4], [4, 4]],
        'S': [[0, 5, 5], [5, 5, 0]],
        'T': [[0, 6, 0], [6, 6, 6]],
        'Z': [[7, 7, 0], [0, 7, 7]]
    };

    let board = createBoard();
    let player;
    let nextTetromino;
    let score = 0;
    let level = 1;
    let linesCleared = 0;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let animationFrameId;

    function createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function createPiece(type) {
        const matrix = TETROMINOS[type];
        return {
            pos: { x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2), y: 0 },
            matrix: matrix,
            type: type
        };
    }

    function getRandomPiece() {
        const types = 'IJLOSTZ';
        const randType = types[Math.floor(Math.random() * types.length)];
        return createPiece(randType);
    }
    
    function playerReset() {
        player = nextTetromino || getRandomPiece();
        nextTetromino = getRandomPiece();
        if (collide(board, player)) {
            gameOver();
        }
        drawNextPiece();
    }

    function gameOver() {
        cancelAnimationFrame(animationFrameId);
        context.fillStyle = 'rgba(0, 0, 0, 0.75)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = '2px Arial';
        context.textAlign = 'center';
        context.fillText('GAME OVER', COLS / 2, ROWS / 2);
        startButton.textContent = "RESTART";
        startButton.disabled = false;
    }

    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawMatrix(board, { x: 0, y: 0 });
        drawMatrix(player.matrix, player.pos);
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = COLORS[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function drawNextPiece() {
        nextContext.fillStyle = '#000';
        nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        const { matrix } = nextTetromino;
        const color = COLORS[TETROMINOS[nextTetromino.type][0][0] || TETROMINOS[nextTetromino.type][1][0]];
        nextContext.fillStyle = color;
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    nextContext.fillRect(x + 0.5, y + 0.5, 1, 1);
                }
            });
        });
    }

    function merge(board, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    function collide(board, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function rotate(matrix) {
        const result = [];
        for (let y = 0; y < matrix[0].length; y++) {
            result.push([]);
            for (let x = matrix.length - 1; x >= 0; x--) {
                result[y].push(matrix[x][y]);
            }
        }
        return result;
    }
    
    function playerRotate() {
        const originalPos = player.pos.x;
        let offset = 1;
        player.matrix = rotate(player.matrix);
        while (collide(board, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                player.matrix = rotate(rotate(rotate(player.matrix))); // Rotate back
                player.pos.x = originalPos;
                return;
            }
        }
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(board, player)) {
            player.pos.x -= dir;
        }
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(board, player)) {
            player.pos.y--;
            merge(board, player);
            playerReset();
            sweepLines();
            updateScore();
        }
        dropCounter = 0;
    }
    
    function playerHardDrop() {
        while (!collide(board, player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(board, player);
        playerReset();
        sweepLines();
        updateScore();
        dropCounter = 0;
    }

    function sweepLines() {
        let cleared = 0;
        outer: for (let y = board.length - 1; y > 0; --y) {
            for (let x = 0; x < board[y].length; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y;
            cleared++;
        }
        
        if (cleared > 0) {
            score += [0, 40, 100, 300, 1200][cleared] * level;
            linesCleared += cleared;
            level = Math.floor(linesCleared / 10) + 1;
            dropInterval = 1000 - (level - 1) * 50;
        }
    }

    function updateScore() {
        scoreElement.innerText = score;
        levelElement.innerText = level;
    }

    function gameLoop(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    function startGame() {
        board = createBoard();
        score = 0;
        level = 1;
        linesCleared = 0;
        dropInterval = 1000;
        playerReset();
        updateScore();
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        gameLoop();
        startButton.textContent = "START";
        startButton.disabled = true;
    }

    document.addEventListener('keydown', event => {
        if (!animationFrameId) return;
        if (event.code === 'ArrowLeft') {
            playerMove(-1);
        } else if (event.code === 'ArrowRight') {
            playerMove(1);
        } else if (event.code === 'ArrowDown') {
            playerDrop();
        } else if (event.code === 'ArrowUp') {
            playerRotate();
        } else if (event.code === 'Space') {
            playerHardDrop();
        }
    });
    
    startButton.addEventListener('click', startGame);
});