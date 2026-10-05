import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

type Player = "X" | "O";
type SquareValue = Player | null;
type BoardState = SquareValue[];

type GameMode = "classic" | "ai";

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

interface SquareProps {
  value: SquareValue;
  onSquareClick: () => void;
}

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <Button className="w-24 h-24 text-5xl" onClick={onSquareClick}>
      {value}
    </Button>
  );
}

function getWinner(squares: BoardState): Player | "No One" | null {
  for (const [a, b, c] of WIN_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a] as Player;
    }
  }

  if (squares.every((cell) => cell !== null)) {
    return "No One";
  }

  return null;
}

function minimax(board: BoardState, isMaximizing: boolean, aiSymbol: Player, depth: number): number {
  const winner = getWinner(board);

  if (winner === aiSymbol) return 10 - depth;
  if (winner === "No One") return 0;
  if (winner !== null && winner !== aiSymbol) return depth - 10;

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = aiSymbol;
        const score = minimax(board, false, aiSymbol, depth + 1);
        board[i] = null;
        bestScore = Math.max(bestScore, score);
      }
    }

    return bestScore;
  }

  const humanSymbol = aiSymbol === "X" ? "O" : "X";
  let bestScore = Infinity;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = humanSymbol;
      const score = minimax(board, true, aiSymbol, depth + 1);
      board[i] = null;
      bestScore = Math.min(bestScore, score);
    }
  }

  return bestScore;
}

function findBestMove(board: BoardState, aiSymbol: Player) {
  let bestScore = -Infinity;
  let bestMove: number | null = null;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = aiSymbol;
      const score = minimax(board, false, aiSymbol, 0);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

interface BoardProps {
  board: BoardState;
  WhoIsNext: string;
  onPlay: (nextState: BoardState) => void;
  pastMove: BoardState | null;
}

function Board({ board, WhoIsNext, onPlay, pastMove }: BoardProps) {
  let tempBoard = board.slice();
  const inPastMove = pastMove !== null && Array.isArray(pastMove) && board !== pastMove;

  if (inPastMove) {
    tempBoard = pastMove.slice();
  }

  const gameOver = (squares: SquareValue[]) => {
    let num = 0;

    for (const cell of squares) {
      if (cell !== null) num++;
    }

    if (num === squares.length) return "No One";

    for (const [a, b, c] of WIN_LINES) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return null;
  };

  const handleClickBoard = (index: number) => {
    if (inPastMove) return;
    if (gameOver(board) || board[index]) return;

    const nextState = board.slice();
    nextState[index] = WhoIsNext as Player;
    onPlay(nextState);
  };

  const winner = gameOver(tempBoard);

  let statusMessage: { title: string; body: string };

  switch (winner) {
    case "X":
    case "O":
      statusMessage = { title: "Game Over!", body: `Winner: ${winner}` };
      break;
    case null:
      statusMessage = { title: "Next turn:", body: WhoIsNext };
      break;
    case "No One":
    default:
      statusMessage = { title: "Game Over!", body: "Nobody Won" };
      break;
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <Card className="p-3 w-full min-w-35 max-w-sm h-min">
        <CardTitle className="text-center">
          {statusMessage.title + " " + statusMessage.body}
        </CardTitle>
      </Card>
      <div className="grid grid-cols-[repeat(3,6rem)] gap-0.5">
        {tempBoard.map((cell, idx) => (
          <Square key={idx} value={cell} onSquareClick={() => handleClickBoard(idx)} />
        ))}
      </div>
    </div>
  );
}

function ClassicGame() {
  const [debugStr, setDebugStr] = useState<Array<SquareValue>>(["X", null, "O"]);
  const [WhoIsNext, setWhoIsNext] = useState<string>("X");
  const [history, setHistory] = useState<Array<BoardState>>([Array(9).fill(null) as BoardState]);
  const [pastMove, setPastMove] = useState<BoardState | null>(null);

  const onPlay = (nextState: BoardState) => {
    setHistory((prevHistory) => [...prevHistory, nextState]);
    setWhoIsNext((prevTurn) => (prevTurn === "X" ? "O" : "X"));
    setPastMove(null);
  };

  return (
    <div className="container flex flex-col gap-2 mx-auto p-3">
      <div className="flex justify-center items-center gap-20">
        <Board board={history[history.length - 1]} WhoIsNext={WhoIsNext} onPlay={onPlay} pastMove={pastMove} />
        <div className="flex flex-col gap-5 items-center overflow-hidden">
          <Card className="min-w-20 text-center h-min">
            <CardTitle>History</CardTitle>
          </Card>
          <ButtonGroup orientation="vertical">
            {history.map((_, idx) => (
              <Button className="w-20" key={idx} onClick={() => setPastMove(history[idx])}>
                {idx}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>
      <div className="flex">
        <Button onClick={() => setDebugStr(history[history.length - 1])}>Debug</Button>
        <Button onClick={() => {
          setHistory([Array(9).fill(null) as BoardState]);
          setWhoIsNext("X");
          setPastMove(null);
        }}>
          Reset
        </Button>
      </div>
      <div>
        <ShowDebug val={debugStr} />
      </div>
    </div>
  );
}

function AIGame() {
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | "No One" | null>(null);

  const playerSymbol: Player = "X";
  const aiSymbol: Player = "O";

  useEffect(() => {
    if (isPlayerTurn || winner !== null) return;

    const timer = window.setTimeout(() => {
      const bestMove = findBestMove(board, aiSymbol);

      if (bestMove === null) {
        setWinner("No One");
        return;
      }

      const nextBoard = [...board] as BoardState;
      nextBoard[bestMove] = aiSymbol;
      const nextWinner = getWinner(nextBoard);

      setBoard(nextBoard);
      setWinner(nextWinner ?? null);
      setIsPlayerTurn(true);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [board, isPlayerTurn, winner, aiSymbol]);

  const makeMove = (index: number, symbol: Player) => {
    if (board[index] !== null || winner !== null || !isPlayerTurn) return;

    const nextBoard = [...board] as BoardState;
    nextBoard[index] = symbol;
    const nextWinner = getWinner(nextBoard);

    setBoard(nextBoard);
    setWinner(nextWinner ?? null);
    setIsPlayerTurn(false);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  const statusText = winner
    ? winner === "No One"
      ? "Draw!"
      : `Winner: ${winner}`
    : isPlayerTurn
      ? "Your turn"
      : "AI is thinking...";

  return (
    <div className="flex flex-col items-center gap-4 p-3">
      <Card className="p-3 w-full min-w-35 max-w-sm h-min">
        <CardTitle className="text-center">{statusText}</CardTitle>
      </Card>

      <div className="grid grid-cols-[repeat(3,6rem)] gap-0.5">
        {board.map((cell, idx) => (
          <Button key={idx} className="w-24 h-24 text-5xl" onClick={() => makeMove(idx, playerSymbol)}>
            {cell}
          </Button>
        ))}
      </div>

      <Button onClick={resetGame}>Reset AI Match</Button>
    </div>
  );
}

export default function TicTacToe() {
  const [mode, setMode] = useState<GameMode>("classic");

  return (
    <div className="container flex flex-col gap-4 mx-auto p-3">
      <div className="flex gap-2 justify-center">
        <Button variant={mode === "classic" ? "default" : "secondary"} onClick={() => setMode("classic")}>
          Classic
        </Button>
        <Button variant={mode === "ai" ? "default" : "secondary"} onClick={() => setMode("ai")}>
          Play vs AI
        </Button>
      </div>

      {mode === "classic" ? <ClassicGame /> : <AIGame />}
    </div>
  );
}

type T = SquareValue | number | null;

function ShowDebug({ val }: { val: Array<T> }) {
  return (
    <Card>
      <CardContent>{`[ ${val.join(" , ")} ]`}</CardContent>
    </Card>
  );
}