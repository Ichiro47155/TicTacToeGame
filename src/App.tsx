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

function GameModeSelection({ onSelectMode }: { onSelectMode: (mode: 'human' | 'ai') => void }) {
  return (
    <div className="game-mode-selection">
      <h2>Do you want to play against a human or the computer?</h2>
      <button onClick={() => onSelectMode('human')}>Play against a friend</button>
      <button onClick={() => onSelectMode('ai')}>Play against AI</button>
    </div>
  );
}

function Game() {
  const [gameMode, setGameMode] = useState<'human' | 'ai' | null>(null);
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState<Array<string | null>>(Array(9).fill(null));

  useEffect(() => {
    if (gameMode === 'ai' && !xIsNext && !calculateWinner(squares)) {
      const bestMove = findBestMove(squares);
      if (bestMove !== null) {
        setTimeout(() => {
          handleSquareClick(bestMove);
        }, 500);
      }
    }
  }, [xIsNext, squares, gameMode]);


  function findBestMove(currentSquares: Array<string | null>): number | null {
    // 1. Check for a winning move for 'O'
    for (let i = 0; i < 9; i++) {
      if (currentSquares[i] === null) {
        const nextSquares = currentSquares.slice();
        nextSquares[i] = 'O';
        if (calculateWinner(nextSquares) === 'O') {
          return i;
        }
      }
    }

    // 2. Check to block 'X' from winning
    for (let i = 0; i < 9; i++) {
      if (currentSquares[i] === null) {
        const nextSquares = currentSquares.slice();
        nextSquares[i] = 'X';
        if (calculateWinner(nextSquares) === 'X') {
          return i;
        }
      }
    }

    // 3. Take the center if available
    if (currentSquares[4] === null) {
      return 4;
    }

    // 4. Take any of the corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => currentSquares[i] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // 5. Take any of the sides
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => currentSquares[i] === null);
    if (availableSides.length > 0) {
      return availableSides[Math.floor(Math.random() * availableSides.length)];
    }

    return null; // Should not be reached if there are empty squares
  }


  function handleSquareClick(i: number) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  function restartGame() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  function handleGameModeSelect(mode: 'human' | 'ai') {
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
      <div className="game-board">
      {gameMode ? (
          <>
            <div className="status">{status}</div>
            <Board squares={squares} onSquareClick={handleSquareClick} />
            <div className='restartButton'><button className='restartButton' onClick={restartGame}>Restart</button></div>
            <button onClick={() => setGameMode(null)}>Change Mode</button>
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
    const [a, b , c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default Game;