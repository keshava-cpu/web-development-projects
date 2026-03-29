import { useContext } from 'react'
import { incrementContextCreation } from '../context/IncrementContext';

function Child1 () {

    // Using the exported `const` context
    let {counter, increment, decrement} = useContext(incrementContextCreation);
    return (
        <div className='card-content'>
            <h2 className="card-title">Counter 1</h2>
            <div className="counter-display">
                <span className="counter-value">{counter}</span>
            </div>
            <div className="button-group">
                <button type="button" className="btn btn-primary" onClick={increment}>+</button>
                <button type="button" className='btn btn-secondary' onClick={decrement}>-</button>
            </div>
        </div>
    );
}

export default Child1;