import { useEffect, useRef, useState } from "react";
import {
  CounterProvider,
  useComplexObj,
  useCounterDispatch,
} from "./contexts/CounterContext";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { RefObject } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "./components/ui/spinner";
import { createContext, useContext } from "react";
import { toast, Toaster } from "@/components/ui/toast";
// import { Viewport } from "./App.css"

const ResettingContext = createContext<boolean | null>(null);

export default function App() {
  const [isResetting, setIsResetting] = useState(false);

  return (
    <div className="mt-50 flex flex-col items-center justify-center gap-5">
      <CounterProvider>
        <ResettingContext.Provider value={isResetting}>
          <CounterButton
            isResetting={isResetting}
            setIsResetting={setIsResetting}
          />
          <FirstGenChild>
            <SecondGenChild />
          </FirstGenChild>
        </ResettingContext.Provider>
      </CounterProvider>
      <Toaster
        viewportClassName="fixed top-0 right-0 bottom-auto left-auto z-[100] flex max-h-screen w-full flex-col p-4 sm:max-w-[420px]"
        swipeDirection={"right"}
      />
    </div>
  );
}

interface CounterButtonProps {
  isResetting: boolean;
  setIsResetting: React.Dispatch<React.SetStateAction<boolean>>;
}

function CounterButton({ isResetting, setIsResetting }: CounterButtonProps) {
  const { val } = useComplexObj();
  const dispatch = useCounterDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetOnOutsideClick, setResetOnOutsideClick] = useState(true);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const triggerReset = async () => {
    setIsResetting(true);
    setDialogOpen(false);

    await new Promise((resolve) => setTimeout(resolve, 500));

    dispatch({ type: "reset" });
    setIsResetting(false);
  };

  useOutsideMouseClick(
    dialogRef,
    () => {
      if (resetOnOutsideClick) triggerReset();
      else setDialogOpen(false);
    },
    dialogOpen,
  );

  return (
    <div className="flex gap-5">
      <FieldLabel htmlFor="switch-share">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle> Want safety Reset?</FieldTitle>
            <FieldDescription>
              Reset occurs when you click outside of the Dialog box.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="switch-share"
            checked={resetOnOutsideClick}
            onCheckedChange={setResetOnOutsideClick}
          />
        </Field>
      </FieldLabel>

      <>
        <Button
          onClick={() => {
            const nextValue = val + 5;
            dispatch({ type: "setCount", value: nextValue });

            if (nextValue >= 10) {
              setDialogOpen(true);
              const id = toast.add({
                type: "warning",
                description:
                  "Heads up! You cannot increment counter more than 10",
                actionProps: {
                  children: "Reset",
                  onClick() {
                    triggerReset();
                    toast.close(id);
                  },
                },
              });
            }
          }}
          disabled={val > 10}
          className={"min-w-30"}
        >
          {isResetting ? (
            <>
              <Spinner data-icon="inline-start" />
              Wait
            </>
          ) : (
            <span>Value : {val}</span>
          )}
        </Button>
      </>

      <Button
        onClick={triggerReset}
        disabled={isResetting}
        className={"min-w-30"}
      >
        {isResetting ? (
          <>
            <Spinner data-icon="inline-start" />
            Resetting...
          </>
        ) : (
          <> Reset </>
        )}
      </Button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent ref={dialogRef} size={"sm"}>
          <AlertDialogHeader>
            <AlertDialogTitle>The counter is Full!</AlertDialogTitle>
            <AlertDialogDescription>
              You need to reset it to use again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={triggerReset}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FirstGenChild({ children }: { children: React.ReactNode }) {
  return (
    <div className="wrapper min-h-25 min-w-xs border-2 p-2">
      <h1 className="h1"> First Gen Child </h1>
      {children}
    </div>
  );
}

function useResettingCont() {
  const context = useContext(ResettingContext);
  if (context === null) throw new Error("Use it inside App conponent");
  return context;
}

function SecondGenChild() {
  const { val } = useComplexObj();
  const isResetting = useResettingCont();

  return (
    <>
      {isResetting ? (
        <Skeleton className="h-12 max-w-sm min-w-50 p-4" />
      ) : (
        <h2 className="p-2 text-xl font-bold"> Second Gen Child: {val}</h2>
      )}
    </>
  );
}

function useOutsideMouseClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [ref, callback, enabled]);
}
