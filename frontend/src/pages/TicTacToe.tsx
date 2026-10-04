import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
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
}

function Board({board, WhoIsNext, onPlay}: BoardProps) {
    const gameOver = (squares: Array<string | null>) => {
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
        if (gameOver(board) || board[i]) return;

        const nextState = board.slice();
        nextState[i] = WhoIsNext;
        onPlay(nextState);
    }

    const winner = gameOver(board);

    const statusMessage : {title: string, body : string} = winner ? {title: `Game Over!`, body: `Winner: ${winner}`}
    : {title: `Next turn:`, body: `${WhoIsNext}`};

    return(
        <div className="flex mx-auto items-center gap-5">
            <div className="grid grid-cols-[repeat(3,6rem)] gap-0.5">
                {
                    board.map((ele, idx) => <Square value={ele} key={idx} onSquareClick={() => handleClickBoard(idx)} />)
                }
            </div>
            <Card className="p-3 w-full max-w-sm">
                <CardTitle>
                    {statusMessage.title}
                </CardTitle>
                <CardFooter className="justify-center">
                    {statusMessage.body}
                </CardFooter>
            </Card>
        </div>
    );
    
}

export default function TicTacToe() {

    const [debugStr, setDebugStr] = useState<Array<string | null>>(["Nothing", "YES"]);
    const [WhoIsNext, setWhoIsNext] = useState<string>("X");
    const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
    const [history, setHistory] = useState<Array<Array<string | null>>>([Array(9).fill(null)]);

    const onPlay = (nextState: Array<string | null>) => {
        setHistory([...history, nextState]);
        if (WhoIsNext == 'X') setWhoIsNext('O');
        else setWhoIsNext('X');
    }
    
    return(
        <div className="container flex flex-col gap-2 mx-auto p-3">
            <div className="flex items-center gap-3">
                <Board board={history[history.length - 1]} WhoIsNext={WhoIsNext} onPlay={onPlay} /> 

                
            </div>
            <div className="flex">
                <Button  onClick={() => setDebugStr(board)} >Debug</Button>
                <Button onClick={() => { setBoard(Array(9).fill(null)); setWhoIsNext('X')}} >Reset</Button>
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