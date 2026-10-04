/* eslint-disable react-refresh/only-export-components */

/*
A counter
A complex Object
*/

import { createContext, useReducer, useMemo, useContext } from "react";

// Counter State
interface State {
  count: number;
}

const initState: State = { count: 0 };

// Complex Object
interface complexObject {
  val: number;
}

// Reducer function types
type CounterAction =
  { type: "reset" } | { type: "setCount"; value: State["count"] };

// Recuder function
const stateReducer = (state: State, action: CounterAction): State => {
  switch (action.type) {
    case "reset":
      return initState;
    case "setCount":
      return { ...state, count: action.value };
  }
};

// Counter context
const ComplexDispatchContext =
  createContext<React.Dispatch<CounterAction> | null>(null);

// Complex Object context
const ComplexObjContext = createContext<complexObject | null>(null);

interface CounterProviderI {
  children: React.ReactNode;
}

// Counter Provider
export function CounterProvider({ children }: CounterProviderI) {
  // Counter Reducer
  const [state, dispatch] = useReducer(stateReducer, initState);

  const complexObj = useMemo(() => ({ val: state.count }), [state.count]);

  return (
    <>
      <ComplexObjContext.Provider value={complexObj}>
        <ComplexDispatchContext.Provider value={dispatch}>
          {children}
        </ComplexDispatchContext.Provider>
      </ComplexObjContext.Provider>
    </>
  );
}

export function useCounterDispatch() {
  const context = useContext(ComplexDispatchContext);
  if (!context)
    throw new Error(
      "useCounterDispatch must be used within a Counter Provider",
    );
  return context;
}

export function useComplexObj() {
  const context = useContext(ComplexObjContext);
  if (!context)
    throw new Error("useComplexObj must be used within a Counter Provider");
  return context;
}
