import { useState, useEffect, useCallback } from 'react';

type PlayerConfig = 'human_vs_human' | 'human_vs_ai' | 'ai_vs_ai';
type GameVariant = 'normal' | 'ultimate' | 'ultimate_random';

// --- Icons ---

const GearIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </svg>
);

// --- Components ---

function Square({ value, onSquareClick, disabled, className }: { value: string | null, onSquareClick: () => void, disabled?: boolean, className?: string }) {
  return (
    <button
      className={`square ${className || ''}`}
      onClick={onSquareClick}
      disabled={disabled}
      data-player={value || ''}
      style={value ? ({ '--player-color': value === 'X' ? 'var(--player-x-color)' : 'var(--player-o-color)' } as any) : {}}
    >
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
  colorX, setColorX,
  colorO, setColorO,
  playerConfig,
  onStart
}: {
  setPlayers: (p: PlayerConfig) => void,
  variant: GameVariant, setVariant: (v: GameVariant) => void,
  gridSize: number, setGridSize: (s: number) => void,
  colorX: string, setColorX: (c: string) => void,
  colorO: string, setColorO: (c: string) => void,
  playerConfig: PlayerConfig,
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
              value={gridSize}
              onChange={(e) => setGridSize(Math.max(3, parseInt(e.target.value) || 3))}
            />
          </div>
          <button className="start-btn" onClick={() => {
            if (playerConfig === 'ai_vs_ai') onStart();
            else setStep(4);
          }}>Next</button>
          <button className="back-btn" onClick={() => setStep(2)}>Back</button>
        </div>
      )}

      {step === 4 && (
        <div className="selection-step">
          <h3>Step 4: Customize Colors</h3>
          <div className="color-selectors">
            {(playerConfig === 'human_vs_human' || playerConfig === 'human_vs_ai') && (
              <div className="color-input-group">
                <label>Player X Color:</label>
                <input type="color" value={colorX} onChange={(e) => setColorX(e.target.value)} />
              </div>
            )}
            {playerConfig === 'human_vs_human' && (
              <div className="color-input-group">
                <label>Player O Color:</label>
                <input type="color" value={colorO} onChange={(e) => setColorO(e.target.value)} />
              </div>
            )}
            {playerConfig === 'human_vs_ai' && (
              <div className="color-input-group disabled">
                <label>AI O Color:</label>
                <div className="color-preview" style={{ backgroundColor: colorO }}></div>
              </div>
            )}
          </div>
          <button className="start-btn" onClick={onStart}>Start Game</button>
          <button className="back-btn" onClick={() => setStep(3)}>Back</button>
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

function SettingsModal({ 
  isOpen, 
  onClose, 
  aiSpeed, 
  setAiSpeed, 
  onRestart, 
  onExit,
  autoRestart,
  setAutoRestart,
  playerConfig
}: { 
  isOpen: boolean, 
  onClose: () => void,
  aiSpeed: number,
  setAiSpeed: (s: number) => void,
  onRestart: () => void,
  onExit: () => void,
  autoRestart: boolean,
  setAutoRestart: (b: boolean) => void,
  playerConfig: PlayerConfig
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Settings</h3>
          <button className="close-btn" onClick={onClose}><CloseIcon /></button>
        </div>
        
        <div className="modal-body">
          <div className="setting-group">
            <label>AI Speed</label>
            <div className="segmented-control">
              <button className={aiSpeed === 1000 ? 'active' : ''} onClick={() => setAiSpeed(1000)}>Slow</button>
              <button className={aiSpeed === 600 ? 'active' : ''} onClick={() => setAiSpeed(600)}>Normal</button>
              <button className={aiSpeed === 200 ? 'active' : ''} onClick={() => setAiSpeed(200)}>Fast</button>
            </div>
          </div>

          {playerConfig === 'ai_vs_ai' && (
            <div className="setting-group row">
              <label>Auto-restart (2s)</label>
              <button 
                className={`toggle-switch ${autoRestart ? 'active' : ''}`} 
                onClick={() => setAutoRestart(!autoRestart)}
              >
                <span className="toggle-thumb"></span>
              </button>
            </div>
          )}

          <div className="setting-actions">
            <button className="action-btn" onClick={() => { onRestart(); onClose(); }}>Restart Game</button>
            <button className="action-btn exit" onClick={() => { onExit(); onClose(); }}>Exit to Menu</button>
          </div>
        </div>
      </div>
    </div>
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
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [autoRestart, setAutoRestart] = useState(false);

  const [colorX, setColorX] = useState('#FFD1A4');
  const [colorO, setColorO] = useState('#D4B7FF');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const winCondition = gridSize <= 4 ? gridSize : 5;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update default colors if they haven't been customized
    const lightX = '#FFD1A4', darkX = '#FFA040';
    const lightO = '#D4B7FF', darkO = '#B080FF';

    if (colorX === lightX || colorX === darkX) {
      setColorX(theme === 'light' ? lightX : darkX);
    }
    if (colorO === lightO || colorO === darkO) {
      setColorO(theme === 'light' ? lightO : darkO);
    }
  }, [theme]);

  useEffect(() => {
    if (isPlaying && !showIntro) {
      document.body.classList.add('playing');
    } else {
      document.body.classList.remove('playing');
    }
  }, [isPlaying, showIntro]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const calculateWinner = useCallback((board: Array<string | null>, size: number, condition: number): string | null => {
    // Rows & Cols
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - condition; c++) {
        let winR = true, winC = true;
        const firstR = board[r * size + c];
        const firstC = board[c * size + r];
        // 'Draw' string in ultimateWinners is not a winner
        if (firstR && firstR !== 'Draw') {
          for (let i = 1; i < condition; i++) if (board[r * size + c + i] !== firstR) { winR = false; break; }
          if (winR) return firstR;
        }
        if (firstC && firstC !== 'Draw') {
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
        if (first1 && first1 !== 'Draw') {
          for (let i = 1; i < condition; i++) if (board[(r + i) * size + (c + i)] !== first1) { win1 = false; break; }
          if (win1) return first1;
        }
        if (first2 && first2 !== 'Draw') {
          for (let i = 1; i < condition; i++) if (board[(r + i) * size + (c + condition - 1 - i)] !== first2) { win2 = false; break; }
          if (win2) return first2;
        }
      }
    }
    return null;
  }, []);

  // Determine current game state
  const isUltimate = variant.startsWith('ultimate');
  const winner = isUltimate 
    ? calculateWinner(ultimateWinners, 3, 3) 
    : calculateWinner(squares, gridSize, winCondition);
  
  const isDraw = isUltimate
    ? !winner && ultimateWinners.every(w => w !== null) // Logic fixed for ultimate draw
    : !winner && squares.every(s => s !== null);

  const evaluateBoard = (board: Array<string | null>, player: string, opponent: string): number => {
    let score = 0;
    const size = gridSize;
    const condition = winCondition;

    const checkLine = (line: Array<string | null>) => {
      let pCount = 0, oCount = 0;
      line.forEach(cell => { if (cell === player) pCount++; if (cell === opponent) oCount++; });
      if (pCount > 0 && oCount > 0) return 0;
      if (pCount > 0) return Math.pow(10, pCount + 0.5);
      if (oCount > 0) return -Math.pow(10, oCount + 0.6);
      return 0;
    };

    const mid = Math.floor(size / 2);
    for (let i = 0; i < board.length; i++) {
      if (board[i] === player) {
        const r = Math.floor(i / size);
        const c = i % size;
        if (r === mid && c === mid) score += 5;
        else if ((r === 0 || r === size - 1) && (c === 0 || c === size - 1)) score += 2;
      }
    }

    for (let i = 0; i < board.length; i++) {
      if (board[i] === player) {
        const r = Math.floor(i / size);
        const c = i % size;
        const adjacentOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        for (const [dr, dc] of adjacentOffsets) {
          const newR = r + dr;
          const newC = c + dc;
          if (newR >= 0 && newR < size && newC >= 0 && newC < size) {
            const adjIdx = newR * size + newC;
            if (board[adjIdx] === player) score += 3;
            if (board[adjIdx] === null) score += 0.5;
          }
        }
      }
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - condition; c++) {
        score += checkLine(board.slice(r * size + c, r * size + c + condition));
      }
    }
    for (let c = 0; c < size; c++) {
      for (let r = 0; r <= size - condition; r++) {
        const line = [];
        for (let i = 0; i < condition; i++) line.push(board[(r + i) * size + c]);
        score += checkLine(line);
      }
    }
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
    const w = calculateWinner(board, gridSize, winCondition);
    if (w === player) return 1000000 / (depth + 1);
    if (w === opponent) return -1000000 / (depth + 1);

    let maxDepth = 5;
    if (gridSize > 15) maxDepth = 1;
    else if (gridSize > 8) maxDepth = 2;
    else if (gridSize > 5) maxDepth = 4;
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

  const findBestMove = (board: Array<string | null>, player: string): number | null => {
    let bestScore = -Infinity;
    let moves: number[] = [];
    const opponent = player === 'X' ? 'O' : 'X';
    const available = board.map((s, i) => s === null ? i : null).filter(i => i !== null) as number[];

    available.sort((a, b) => {
      const dist = (i: number) => Math.abs(Math.floor(i / gridSize) - gridSize / 2) + Math.abs((i % gridSize) - gridSize / 2);
      return dist(a) - dist(b);
    });

    let searchMoves = available;
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
      else searchMoves = available.slice(0, Math.min(1, available.length));
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
    return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
  };

  const restartGame = useCallback(() => {
    setSquares(Array(gridSize * gridSize).fill(null));
    const subSize = gridSize * gridSize;
    setUltimateBoards(Array(9).fill(0).map(() => Array(subSize).fill(null)));
    setUltimateWinners(Array(9).fill(null));
    setActiveBoard(null);
    setXIsNext(true);
  }, [gridSize]);

  // Auto Restart Logic
  useEffect(() => {
    if (isPlaying && playerConfig === 'ai_vs_ai' && autoRestart) {
      if (winner || isDraw) {
        const timer = setTimeout(() => {
          restartGame();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [winner, isDraw, isPlaying, playerConfig, autoRestart, restartGame]);

  useEffect(() => {
    if (!isPlaying || variant.startsWith('ultimate')) return;
    if (winner || squares.every(s => s !== null)) return;

    if ((playerConfig === 'human_vs_ai' && !xIsNext) || playerConfig === 'ai_vs_ai') {
      const currentPlayer = xIsNext ? 'X' : 'O';
      const bestMove = findBestMove([...squares], currentPlayer);

      if (bestMove !== null) {
        const timeout = setTimeout(() => handleSquareClick(bestMove, true), aiSpeed);
        return () => clearTimeout(timeout);
      }
    }
  }, [xIsNext, squares, isPlaying, variant, gridSize, aiSpeed, winner]); // Added winner to deps

  const handleSquareClick = (i: number, isAI = false) => {
    if (squares[i] || winner) return;
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
      const nextBoardIdx = squareIdx % 9;
      setActiveBoard(newWinners[nextBoardIdx] ? null : nextBoardIdx);
    } else {
      setActiveBoard(null);
    }
  };

  useEffect(() => {
    if (!isPlaying || !variant.startsWith('ultimate')) return;
    if (winner || isDraw) return; // Stop if game over

    if ((playerConfig === 'human_vs_ai' && !xIsNext) || playerConfig === 'ai_vs_ai') {
      const currentPlayer = xIsNext ? 'X' : 'O';
      const opponentPlayer = xIsNext ? 'O' : 'X';

      const possibleBoards = (variant === 'ultimate' && activeBoard !== null)
        ? [activeBoard]
        : ultimateWinners.map((w, idx) => w === null ? idx : null).filter(idx => idx !== null) as number[];

      let bestMove: { bIdx: number, sIdx: number } | null = null;
      let candidates: { bIdx: number, sIdx: number }[] = [];

      for (const bIdx of possibleBoards) {
        const availableSquares = ultimateBoards[bIdx].map((s, idx) => s === null ? idx : null).filter(idx => idx !== null) as number[];
        for (const sIdx of availableSquares) {
          const nextSubBoard = ultimateBoards[bIdx].slice();
          nextSubBoard[sIdx] = currentPlayer;
          if (calculateWinner(nextSubBoard, gridSize, winCondition) === currentPlayer) candidates.push({ bIdx, sIdx });
        }
      }

      if (candidates.length === 0) {
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
  }, [xIsNext, ultimateBoards, ultimateWinners, activeBoard, isPlaying, variant, gridSize, winCondition, calculateWinner, aiSpeed, winner, isDraw]);

  const onStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowIntro(true);
      restartGame();
    }, 800);
  };

  const finishIntro = () => {
    setShowIntro(false);
    setIsPlaying(true);
  };

  // Status message generation
  let statusText = "";
  if (winner) {
      statusText = winner === 'Draw' ? "Draw!" : "Winner: " + winner;
  } else if (isDraw) {
      statusText = "Draw!";
  } else {
      statusText = (xIsNext ? "X" : "O") + "'s turn";
  }

  return (
    <div className="game">
      <style>{`
        .header-controls {
          position: fixed;
          top: 20px;
          right: 80px;
          display: flex;
          gap: 10px;
          z-index: 100;
        }
        .icon-btn {
          background: var(--surface-light);
          border: 1px solid var(--border-color);
          color: var(--text-color);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          transform: rotate(15deg);
          background: var(--surface);
        }
        .icon-btn svg {
          width: 20px;
          height: 20px;
        }
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          background: var(--surface);
          border: 1px solid var(--border-color);
          padding: 24px;
          border-radius: 16px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
        }
        .modal-header h3 { margin: 0; }
        .close-btn {
          background: none; border: none; cursor: pointer; color: var(--text-secondary);
        }
        .setting-group { margin-bottom: 20px; }
        .setting-group.row { display: flex; justify-content: space-between; align-items: center; }
        .setting-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.9em; color: var(--text-secondary); }
        .segmented-control {
          display: flex;
          background: var(--bg-color);
          padding: 4px;
          border-radius: 8px;
        }
        .segmented-control button {
          flex: 1;
          background: none;
          border: none;
          padding: 8px;
          font-size: 0.85em;
          color: var(--text-secondary);
          border-radius: 6px;
          cursor: pointer;
        }
        .segmented-control button.active {
          background: var(--surface-light);
          color: var(--text-color);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          font-weight: 600;
        }
        .setting-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 30px; }
        .setting-actions .action-btn { width: 100%; }

        /* Toggle Switch */
        .toggle-switch {
          width: 44px;
          height: 24px;
          background: var(--border-color);
          border-radius: 12px;
          border: none;
          position: relative;
          cursor: pointer;
          transition: background 0.3s;
          padding: 0;
        }
        .toggle-switch.active { background: #4CAF50; }
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .toggle-switch.active .toggle-thumb { transform: translateX(20px); }

        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="header-controls">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        {isPlaying && (
          <button className="icon-btn" onClick={() => setShowSettings(true)}>
            <GearIcon />
          </button>
        )}
      </div>

      <div className="status" style={{ color: 'var(--current-player-color)' }}>
        {isPlaying && !showIntro ? statusText : ""}
      </div>

      <div className="game-wrapper" style={{
        '--player-x-color': colorX,
        '--player-o-color': colorO,
        '--current-player-color': winner ? (winner === 'X' ? colorX : (winner === 'O' ? colorO : 'var(--text-color)')) : (xIsNext ? colorX : colorO)
      } as any}>
        {isLoading ? (
          <div className="loading-screen">
            <div className="loader"></div>
            <p>Preparing Battle...</p>
          </div>
        ) : showIntro ? (
          <div className="intro-screen">
            <h2>{variant.toUpperCase()} MODE</h2>
            <div className="player-vs">
              <div className="p-card" style={{ borderColor: colorX }}>
                <span className="p-icon" style={{ color: colorX }}>X</span>
                <p>{playerConfig === 'ai_vs_ai' ? 'CPU 1' : 'Player 1'}</p>
              </div>
              <div className="vs-badge">VS</div>
              <div className="p-card" style={{ borderColor: colorO }}>
                <span className="p-icon" style={{ color: colorO }}>O</span>
                <p>{playerConfig === 'human_vs_human' ? 'Player 2' : 'CPU'}</p>
              </div>
            </div>
            <div className="rules">
              <p>Grid: {gridSize}x{gridSize}</p>
              <p>Win with {winCondition} in a row</p>
            </div>
            <button className="skip-intro-btn" onClick={finishIntro}>Ready to Start</button>
          </div>
        ) : isPlaying ? (
          variant.startsWith('ultimate') ? (
            <div className="ultimate-board">
              {ultimateBoards.map((board, bIdx) => (
                <div
                  key={bIdx}
                  className={`sub-board ${activeBoard === bIdx || (activeBoard === null && !ultimateWinners[bIdx]) ? 'active' : ''} ${ultimateWinners[bIdx] ? 'won-' + ultimateWinners[bIdx] : ''}`}
                  data-winner={ultimateWinners[bIdx] || ''}
                  style={ultimateWinners[bIdx] && ultimateWinners[bIdx] !== 'Draw' ? ({ '--winner-color': ultimateWinners[bIdx] === 'X' ? 'var(--player-x-color)' : 'var(--player-o-color)' } as any) : {}}
                >
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
            colorX={colorX} setColorX={setColorX}
            colorO={colorO} setColorO={setColorO}
            playerConfig={playerConfig}
            onStart={onStart}
          />
        )}
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        aiSpeed={aiSpeed}
        setAiSpeed={setAiSpeed}
        onRestart={restartGame}
        onExit={() => setIsPlaying(false)}
        autoRestart={autoRestart}
        setAutoRestart={setAutoRestart}
        playerConfig={playerConfig}
      />
    </div>
  );
}

export default Game;