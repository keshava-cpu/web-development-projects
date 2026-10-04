import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface SquareProps {
    value: string | null,
    onSquareClick: () => void,
};

function Square({ value, onSquareClick } : SquareProps ) {
    return (<Button className={"w-24 h-24 text-5xl"} onClick={onSquareClick}>{ value }</Button>)
}

interface BoardProps {
    board: Array<string | null>,
    WhoIsNext: string,
    onPlay: (nextState: (string | null)[]) => void,
    pastMove: Array<string | null> | null,
}

function Board({board, WhoIsNext, onPlay, pastMove}: BoardProps) {

    let tempBoard = board.slice();
    const inPastMove = (pastMove !== null && Array.isArray(pastMove) && board !== pastMove)
    if (inPastMove) {
        tempBoard = pastMove.slice();
    }
    console.log("tempBoard: ", tempBoard);
    const gameOver = (squares: Array<string | null>) => {
        let num = 0;
        for (const i of squares) {
            if (i !== null) num++;
        }
        if (num == squares.length) return "No One";
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
            }
        }
        return null;
    }

    const handleClickBoard = (i : number) => {
        if (inPastMove) return;
        if (gameOver(board) || board[i]) return;

        const nextState = board.slice();
        nextState[i] = WhoIsNext;
        onPlay(nextState);
    }

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

    return(
        <div className="flex flex-col items-center gap-5">
            <Card className="p-3 w-full min-w-35 max-w-sm h-min">
                <CardTitle className=" text-center ">
                    {statusMessage.title + " " + statusMessage.body}
                </CardTitle>
            </Card>
            <div className="grid grid-cols-[repeat(3,6rem)] gap-0.5">
                {
                    tempBoard.map((ele, idx) => <Square value={ele} key={idx} onSquareClick={() => handleClickBoard(idx)} />)
                }
            </div>
        </div>
    );
    
}

export default function TicTacToe() {

    const [debugStr, setDebugStr] = useState<Array<string | null>>(["Nothing", "YES"]);
    const [WhoIsNext, setWhoIsNext] = useState<string>("X");
    const [history, setHistory] = useState<Array<Array<string | null>>>([Array(9).fill(null)]);
    const [pastMove, setPastMove] = useState<Array<string | null> | null> (null);

    const onPlay = (nextState: Array<string | null>) => {
        setHistory([...history, nextState]);
        if (WhoIsNext == 'X') setWhoIsNext('O');
        else setWhoIsNext('X');
        setPastMove(null);
    }
    
    return(
        <div className="container flex flex-col gap-2 mx-auto p-3">
            <div className="flex justify-center items-center gap-20">
                <Board board={history[history.length - 1]} WhoIsNext={WhoIsNext} onPlay={onPlay} pastMove={pastMove}/> 
                <div className="flex flex-col gap-5 items-center overflow-hidden">
                    <Card className="min-w-20 text-center h-min">
                        <CardTitle>
                            History
                        </CardTitle>
                    </Card>
                    <ButtonGroup orientation={"vertical"} >
                        {
                            history.map((ele, idx) => <Button className={"w-20"} key={idx} onClick={() => setPastMove(history[idx])} >{idx}</Button>)
                        }
                    </ButtonGroup>
                </div>
            </div>
            <div className="flex">
                <Button  onClick={() => setDebugStr(history[history.length - 1])} >Debug</Button>
                <Button onClick={() => { setHistory([Array(9).fill(null)]); setWhoIsNext('X'); setPastMove(null); }} >Reset</Button>
            </div>
            <div>
                <ShowDebug val={debugStr} />
            </div>
        </div>
    );
}

type T = | string | number | null

function ShowDebug({ val } : { val : Array<T> }) {
    return (
        <Card>
            <CardContent>
                {`[ ${val.join(" , ")} ]`}
            </CardContent>
        </Card>
    );
}