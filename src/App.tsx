import { useState, useEffect } from 'react';

function Square({ value, onSquareClick }: { value: string | null, onSquareClick: () => void }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ squares, onSquareClick }: { squares: Array<string | null>, onSquareClick: (i: number) => void }) {
  return (
    <>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => onSquareClick(0)} />
        <Square value={squares[1]} onSquareClick={() => onSquareClick(1)} />
        <Square value={squares[2]} onSquareClick={() => onSquareClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => onSquareClick(3)} />
        <Square value={squares[4]} onSquareClick={() => onSquareClick(4)} />
        <Square value={squares[5]} onSquareClick={() => onSquareClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => onSquareClick(6)} />
        <Square value={squares[7]} onSquareClick={() => onSquareClick(7)} />
        <Square value={squares[8]} onSquareClick={() => onSquareClick(8)} />
      </div>
    </>
  );
}

function GameModeSelection({ onSelectMode }: { onSelectMode: (mode: 'human' | 'ai' | 'ai_vs_ai') => void }) {
  return (
    <div className="game-mode-selection">
      <h2>Select Game Mode</h2>
      <button onClick={() => onSelectMode('human')}>Human vs Human</button>
      <button onClick={() => onSelectMode('ai')}>Play vs Unbeatable AI</button>
      <button onClick={() => onSelectMode('ai_vs_ai')}>AI vs AI Spectate</button>
    </div>
  );
}

function ThemeToggle({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) {
  return (
    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? (
        <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      )}
    </button>
  );
}

function Game() {
  const [gameMode, setGameMode] = useState<'human' | 'ai' | 'ai_vs_ai' | null>(null);
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState<Array<string | null>>(Array(9).fill(null));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (calculateWinner(squares) || squares.every(s => s !== null)) {
      return;
    }

    if ((gameMode === 'ai' && !xIsNext) || gameMode === 'ai_vs_ai') {
      const currentPlayer = xIsNext ? 'X' : 'O';
      const bestMove = findBestMove(squares, currentPlayer);
      if (bestMove !== null) {
        const timeout = setTimeout(() => {
          const nextSquares = squares.slice();
          nextSquares[bestMove] = currentPlayer;
          setSquares(nextSquares);
          setXIsNext(!xIsNext);
        }, 600);
        return () => clearTimeout(timeout);
      }
    }
  }, [xIsNext, squares, gameMode]);

  function findBestMove(currentSquares: Array<string | null>, player: 'X' | 'O'): number | null {
    let bestScore = -Infinity;
    let move = null;
    const opponent = player === 'X' ? 'O' : 'X';

    for (let i = 0; i < 9; i++) {
      if (currentSquares[i] === null) {
        currentSquares[i] = player;
        let score = minimax(currentSquares, 0, false, player, opponent);
        currentSquares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  function minimax(board: Array<string | null>, depth: number, isMaximizing: boolean, player: string, opponent: string): number {
    const winner = calculateWinner(board);
    if (winner === player) return 10 - depth;
    if (winner === opponent) return depth - 10;
    if (board.every(s => s !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = player;
          let score = minimax(board, depth + 1, false, player, opponent);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = opponent;
          let score = minimax(board, depth + 1, true, player, opponent);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  function handleSquareClick(i: number) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }

    // Prevent human from playing during AI modes or AI turns
    if (gameMode === 'ai' && !xIsNext) return;
    if (gameMode === 'ai_vs_ai') return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  function restartGame() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  function handleGameModeSelect(mode: 'human' | 'ai' | 'ai_vs_ai') {
    setGameMode(mode);
    restartGame();
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (squares.every(square => square !== null)) {
    status = "Draw";
  } else {
    status = (xIsNext ? "X" : "O") + "'s turn";
  }

  return (
    <div className="game">
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <div className="game-board">
        {gameMode ? (
          <>
            <div className="status">{status}</div>
            <Board squares={squares} onSquareClick={handleSquareClick} />
            <div className="button-container">
              <button className='restartButton' onClick={restartGame}>Restart</button>
              <button className="change-mode-button" onClick={() => setGameMode(null)}>Change Mode</button>
            </div>
          </>
        ) : (
          <GameModeSelection onSelectMode={handleGameModeSelect} />
        )}
      </div>
    </div>
  );
}

function calculateWinner(squares: Array<string | null>): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default Game;