import { useState, useEffect, useCallback } from 'react';

type PlayerConfig = 'human_vs_human' | 'human_vs_ai' | 'ai_vs_ai';
type GameVariant = 'normal' | 'ultimate' | 'ultimate_random';

function Square({ value, onSquareClick, disabled, className }: { value: string | null, onSquareClick: () => void, disabled?: boolean, className?: string }) {
  return (
    <button className={`square ${className || ''}`} onClick={onSquareClick} disabled={disabled}>
      {value}
    </button>
  );
}

function Board({ squares, onSquareClick, gridSize, disabled }: { squares: Array<string | null>, onSquareClick: (i: number) => void, gridSize: number, disabled?: boolean }) {
  return (
    <div className="board-container" style={{ '--grid-size': gridSize } as any}>
      {squares.map((square, i) => (
        <Square key={i} value={square} onSquareClick={() => onSquareClick(i)} disabled={disabled || square !== null} />
      ))}
    </div>
  );
}

function GameSelection({
  setPlayers,
  variant, setVariant,
  gridSize, setGridSize,
  onStart
}: {
  setPlayers: (p: PlayerConfig) => void,
  variant: GameVariant, setVariant: (v: GameVariant) => void,
  gridSize: number, setGridSize: (s: number) => void,
  onStart: () => void
}) {
  const [step, setStep] = useState(1);

  return (
    <div className="game-mode-selection">
      <h2>Configure Your Game</h2>

      {step === 1 && (
        <div className="selection-step">
          <h3>Step 1: Choose Players</h3>
          <button onClick={() => { setPlayers('human_vs_human'); setStep(2); }}>Human vs Human</button>
          <button onClick={() => { setPlayers('human_vs_ai'); setStep(2); }}>vs Unbeatable AI</button>
          <button onClick={() => { setPlayers('ai_vs_ai'); setStep(2); }}>AI vs AI Spectate</button>
        </div>
      )}

      {step === 2 && (
        <div className="selection-step">
          <h3>Step 2: Choose Variant</h3>
          <button onClick={() => { setVariant('normal'); setStep(3); }}>Normal Tic-Tac-Toe</button>
          <button onClick={() => { setVariant('ultimate'); setStep(3); }}>Ultimate (Restricted)</button>
          <button onClick={() => { setVariant('ultimate_random'); setStep(3); }}>Ultimate (Any Board)</button>
          <button className="back-btn" onClick={() => setStep(1)}>Back</button>
        </div>
      )}

      {step === 3 && (
        <div className="selection-step">
          <h3>Step 3: Grid Size ({gridSize}x{gridSize})</h3>
          <div className="selection-group">
            <input
              type="number"
              min="3"
              max={variant === 'normal' ? 20 : 10}
              value={gridSize}
              onChange={(e) => setGridSize(Math.min(variant === 'normal' ? 20 : 10, Math.max(3, parseInt(e.target.value) || 3)))}
            />
          </div>
          <button className="start-btn" onClick={onStart}>Start Game</button>
          <button className="back-btn" onClick={() => setStep(2)}>Back</button>
        </div>
      )}
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerConfig, setPlayerConfig] = useState<PlayerConfig>('human_vs_ai');
  const [variant, setVariant] = useState<GameVariant>('normal');
  const [gridSize, setGridSize] = useState(3);

  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState<Array<string | null>>(Array(9).fill(null));

  // Ultimate State
  const [ultimateBoards, setUltimateBoards] = useState<Array<Array<string | null>>>(Array(9).fill(0).map(() => Array(9).fill(null)));
  const [ultimateWinners, setUltimateWinners] = useState<Array<string | null>>(Array(9).fill(null));
  const [activeBoard, setActiveBoard] = useState<number | null>(null);
  const [aiSpeed, setAiSpeed] = useState<number>(600);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const winCondition = gridSize <= 4 ? gridSize : 5;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const calculateWinner = useCallback((board: Array<string | null>, size: number, condition: number): string | null => {
    // Rows & Cols
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - condition; c++) {
        let winR = true, winC = true;
        const firstR = board[r * size + c];
        const firstC = board[c * size + r];
        if (firstR) {
          for (let i = 1; i < condition; i++) if (board[r * size + c + i] !== firstR) { winR = false; break; }
          if (winR) return firstR;
        }
        if (firstC) {
          for (let i = 1; i < condition; i++) if (board[(c + i) * size + r] !== firstC) { winC = false; break; }
          if (winC) return firstC;
        }
      }
    }
    // Diagonals
    for (let r = 0; r <= size - condition; r++) {
      for (let c = 0; c <= size - condition; c++) {
        let win1 = true, win2 = true;
        const first1 = board[r * size + c];
        const first2 = board[r * size + (c + condition - 1)];
        if (first1) {
          for (let i = 1; i < condition; i++) if (board[(r + i) * size + (c + i)] !== first1) { win1 = false; break; }
          if (win1) return first1;
        }
        if (first2) {
          for (let i = 1; i < condition; i++) if (board[(r + i) * size + (c + condition - 1 - i)] !== first2) { win2 = false; break; }
          if (win2) return first2;
        }
      }
    }
    return null;
  }, []);

  const evaluateBoard = (board: Array<string | null>, player: string, opponent: string): number => {
    let score = 0;
    const size = gridSize;
    const condition = winCondition;

    const checkLine = (line: Array<string | null>) => {
      let pCount = 0, oCount = 0;
      line.forEach(cell => { if (cell === player) pCount++; if (cell === opponent) oCount++; });
      if (pCount > 0 && oCount > 0) return 0;
      if (pCount > 0) return Math.pow(10, pCount + 0.5);
      if (oCount > 0) return -Math.pow(10, oCount + 0.6); // Slightly more defensive penalty
      return 0;
    };

    // Rows, Cols, Diagonals logic...
    // (Existing line checking remains the same, but let's add position weighing)

    // Position weights: Preference for center and corners
    const mid = Math.floor(size / 2);
    for (let i = 0; i < board.length; i++) {
      if (board[i] === player) {
        const r = Math.floor(i / size);
        const c = i % size;
        if (r === mid && c === mid) score += 5; // Center
        else if ((r === 0 || r === size - 1) && (c === 0 || c === size - 1)) score += 2; // Corners
      }
    }

    // Rows
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - condition; c++) {
        score += checkLine(board.slice(r * size + c, r * size + c + condition));
      }
    }
    // Cols
    for (let c = 0; c < size; c++) {
      for (let r = 0; r <= size - condition; r++) {
        const line = [];
        for (let i = 0; i < condition; i++) line.push(board[(r + i) * size + c]);
        score += checkLine(line);
      }
    }
    // Diagonals
    for (let r = 0; r <= size - condition; r++) {
      for (let c = 0; c <= size - condition; c++) {
        const line1 = [];
        const line2 = [];
        for (let i = 0; i < condition; i++) {
          line1.push(board[(r + i) * size + (c + i)]);
          line2.push(board[(r + (condition - 1 - i)) * size + (c + i)]);
        }
        score += checkLine(line1);
        score += checkLine(line2);
      }
    }

    return score;
  };

  const alphaBeta = (board: Array<string | null>, depth: number, alpha: number, beta: number, isMaximizing: boolean, player: string, opponent: string): number => {
    const winner = calculateWinner(board, gridSize, winCondition);
    if (winner === player) return 1000000 / depth;
    if (winner === opponent) return -1000000 / depth;
    const maxDepth = gridSize > 12 ? 1 : (gridSize > 6 ? 2 : 5);
    if (depth >= maxDepth || board.every(s => s !== null)) return evaluateBoard(board, player, opponent);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) if (board[i] === null) {
        board[i] = player;
        let score = alphaBeta(board, depth + 1, alpha, beta, false, player, opponent);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) if (board[i] === null) {
        board[i] = opponent;
        let score = alphaBeta(board, depth + 1, alpha, beta, true, player, opponent);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }
      return bestScore;
    }
  };

  const findBestMove = (board: Array<string | null>, player: Player): number | null => {
    let bestScore = -Infinity;
    let moves: number[] = [];
    const opponent = player === 'X' ? 'O' : 'X';
    const available = board.map((s, i) => s === null ? i : null).filter(i => i !== null) as number[];

    available.sort((a, b) => {
      const dist = (i: number) => Math.abs(Math.floor(i / gridSize) - gridSize / 2) + Math.abs((i % gridSize) - gridSize / 2);
      return dist(a) - dist(b);
    });

    let searchMoves = available;
    // For large grids, prune moves that are too far from existing pieces to save CPU
    if (gridSize > 5) {
      const neighbors = available.filter(i => {
        const r = Math.floor(i / gridSize);
        const c = i % gridSize;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
              if (board[nr * gridSize + nc] !== null) return true;
            }
          }
        }
        return false;
      });
      if (neighbors.length > 0) searchMoves = neighbors;
      else searchMoves = available.slice(0, Math.min(1, available.length)); // First move
    }

    for (const i of searchMoves) {
      board[i] = player;
      let score = alphaBeta(board, 0, -Infinity, Infinity, false, player, opponent);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        moves = [i];
      } else if (score === bestScore) {
        moves.push(i);
      }
    }

    // Pick randomly from best moves to add variety
    return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
  };

  useEffect(() => {
    if (!isPlaying || variant.startsWith('ultimate')) return;
    const winner = calculateWinner(squares, gridSize, winCondition);
    if (winner || squares.every(s => s !== null)) return;

    if ((playerConfig === 'human_vs_ai' && !xIsNext) || playerConfig === 'ai_vs_ai') {
      const currentPlayer = xIsNext ? 'X' : 'O';
      // Pre-calculate move immediately for responsiveness
      const bestMove = findBestMove([...squares], currentPlayer);

      if (bestMove !== null) {
        const timeout = setTimeout(() => handleSquareClick(bestMove, true), aiSpeed);
        return () => clearTimeout(timeout);
      }
    }
  }, [xIsNext, squares, isPlaying, variant, gridSize, aiSpeed]);

  const handleSquareClick = (i: number, isAI = false) => {
    if (squares[i] || calculateWinner(squares, gridSize, winCondition)) return;
    if (!isAI && ((playerConfig === 'human_vs_ai' && !xIsNext) || playerConfig === 'ai_vs_ai')) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  const handleUltimateClick = (boardIdx: number, squareIdx: number, isAI = false) => {
    if (ultimateWinners[boardIdx] || ultimateBoards[boardIdx][squareIdx]) return;
    if (variant === 'ultimate' && activeBoard !== null && activeBoard !== boardIdx) return;
    if (!isAI && ((playerConfig === 'human_vs_ai' && !xIsNext) || playerConfig === 'ai_vs_ai')) return;

    const newBoards = ultimateBoards.map((b, idx) => idx === boardIdx ? [...b] : b);
    const currentPlayer = xIsNext ? 'X' : 'O';
    newBoards[boardIdx][squareIdx] = currentPlayer;

    const subWinner = calculateWinner(newBoards[boardIdx], gridSize, winCondition);
    const newWinners = [...ultimateWinners];
    if (subWinner) newWinners[boardIdx] = subWinner;
    else if (newBoards[boardIdx].every(s => s !== null)) newWinners[boardIdx] = 'Draw';

    setUltimateBoards(newBoards);
    setUltimateWinners(newWinners);
    setXIsNext(!xIsNext);

    if (variant === 'ultimate') {
      // Map the square index (0-gridSize^2-1) to the 3x3 main board index (0-8)
      // This is only sensible if gridSize is 3. If gridSize > 3, we map it to squareIdx % 9.
      const nextBoardIdx = squareIdx % 9;
      setActiveBoard(newWinners[nextBoardIdx] ? null : nextBoardIdx);
    } else {
      setActiveBoard(null);
    }
  };

  // Ultimate AI Logic: Strategic sub-board play with pre-calculation
  useEffect(() => {
    if (!isPlaying || !variant.startsWith('ultimate')) return;
    const winner = calculateWinner(ultimateWinners, 3, 3);
    if (winner || ultimateWinners.every(w => w !== null)) return;

    if ((playerConfig === 'human_vs_ai' && !xIsNext) || playerConfig === 'ai_vs_ai') {
      const currentPlayer = xIsNext ? 'X' : 'O';
      const opponentPlayer = xIsNext ? 'O' : 'X';

      const possibleBoards = (variant === 'ultimate' && activeBoard !== null)
        ? [activeBoard]
        : ultimateWinners.map((w, idx) => w === null ? idx : null).filter(idx => idx !== null) as number[];

      // Strategy for Ultimate:
      let bestMove: { bIdx: number, sIdx: number } | null = null;
      let candidates: { bIdx: number, sIdx: number }[] = [];

      // 1. Can I win a sub-board now?
      for (const bIdx of possibleBoards) {
        const availableSquares = ultimateBoards[bIdx].map((s, idx) => s === null ? idx : null).filter(idx => idx !== null) as number[];
        for (const sIdx of availableSquares) {
          const nextSubBoard = ultimateBoards[bIdx].slice();
          nextSubBoard[sIdx] = currentPlayer;
          if (calculateWinner(nextSubBoard, gridSize, winCondition) === currentPlayer) candidates.push({ bIdx, sIdx });
        }
      }

      if (candidates.length === 0) {
        // 2. Block opponent from winning a sub-board
        for (const bIdx of possibleBoards) {
          const availableSquares = ultimateBoards[bIdx].map((s, idx) => s === null ? idx : null).filter(idx => idx !== null) as number[];
          for (const sIdx of availableSquares) {
            const nextSubBoard = ultimateBoards[bIdx].slice();
            nextSubBoard[sIdx] = opponentPlayer;
            if (calculateWinner(nextSubBoard, gridSize, winCondition) === opponentPlayer) candidates.push({ bIdx, sIdx });
          }
        }
      }

      if (candidates.length === 0) {
        // 3. Strategic Move: Favor center/corners and avoid sending opponent to won/full sub-boards
        const allOptions: { bIdx: number, sIdx: number, score: number }[] = [];
        for (const bIdx of possibleBoards) {
          const availableSquares = ultimateBoards[bIdx].map((s, idx) => s === null ? idx : null).filter(idx => idx !== null) as number[];
          availableSquares.forEach(sIdx => {
            let score = 0;
            const size = gridSize;
            const mid = Math.floor(size / 2);
            const r = Math.floor(sIdx / size);
            const c = sIdx % size;

            if (r === mid && c === mid) score += 10;
            if ((r === 0 || r === size - 1) && (c === 0 || c === size - 1)) score += 5;

            // Avoid sending player to a "won" sub-board if possible
            if (ultimateWinners[sIdx % 9]) score -= 20;

            allOptions.push({ bIdx, sIdx, score });
          });
        }

        if (allOptions.length > 0) {
          const maxScore = Math.max(...allOptions.map(o => o.score));
          const topMoves = allOptions.filter(o => o.score === maxScore);
          bestMove = topMoves[Math.floor(Math.random() * topMoves.length)];
        }
      } else {
        bestMove = candidates[Math.floor(Math.random() * candidates.length)];
      }

      if (bestMove) {
        const timeout = setTimeout(() => {
          handleUltimateClick(bestMove!.bIdx, bestMove!.sIdx, true);
        }, aiSpeed);
        return () => clearTimeout(timeout);
      }
    }
  }, [xIsNext, ultimateBoards, ultimateWinners, activeBoard, isPlaying, variant, gridSize, winCondition, calculateWinner, aiSpeed]);

  const restartGame = () => {
    setSquares(Array(gridSize * gridSize).fill(null));
    const subSize = gridSize * gridSize;
    setUltimateBoards(Array(9).fill(0).map(() => Array(subSize).fill(null)));
    setUltimateWinners(Array(9).fill(null));
    setActiveBoard(null);
    setXIsNext(true);
  };

  const onStart = () => {
    setIsPlaying(true);
    restartGame();
  };

  const winner = variant.startsWith('ultimate') ? calculateWinner(ultimateWinners, 3, 3) : calculateWinner(squares, gridSize, winCondition);
  let status = winner ? (winner === 'Draw' ? "Draw!" : "Winner: " + winner) : (squares.every(s => s !== null) ? "Draw" : (xIsNext ? "X" : "O") + "'s turn");

  return (
    <div className="game">
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />



      <div className="status">{isPlaying ? status : ""}</div>
      <div className="game-wrapper">
        {isPlaying ? (
          variant.startsWith('ultimate') ? (
            <div className="ultimate-board">
              {ultimateBoards.map((board, bIdx) => (
                <div key={bIdx} className={`sub-board ${activeBoard === bIdx || (activeBoard === null && !ultimateWinners[bIdx]) ? 'active' : ''} ${ultimateWinners[bIdx] ? 'won-' + ultimateWinners[bIdx] : ''}`} data-winner={ultimateWinners[bIdx]}>
                  <Board squares={board} onSquareClick={(sIdx) => handleUltimateClick(bIdx, sIdx)} gridSize={gridSize} disabled={!!ultimateWinners[bIdx]} />
                </div>
              ))}
            </div>
          ) : (
            <Board squares={squares} onSquareClick={handleSquareClick} gridSize={gridSize} />
          )
        ) : (
          <GameSelection
            setPlayers={setPlayerConfig}
            variant={variant} setVariant={setVariant}
            gridSize={gridSize} setGridSize={setGridSize}
            onStart={onStart}
          />
        )}
      </div>

      {isPlaying && (
        <div className="game-controls bottom">
          <div className="speed-controls">
            <span>AI Speed:</span>
            <button className={aiSpeed === 1000 ? 'active' : ''} onClick={() => setAiSpeed(1000)}>Slow</button>
            <button className={aiSpeed === 600 ? 'active' : ''} onClick={() => setAiSpeed(600)}>Normal</button>
            <button className={aiSpeed === 200 ? 'active' : ''} onClick={() => setAiSpeed(200)}>Fast</button>
          </div>
          <div className="button-group">
            <button className="action-btn" onClick={restartGame}>Restart Game</button>
            <button className="action-btn exit" onClick={() => setIsPlaying(false)}>Exit to Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;