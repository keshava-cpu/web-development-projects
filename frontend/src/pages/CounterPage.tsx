
import { useEffect, useRef, useState } from "react";
import {
  CounterProvider,
  useComplexObj,
  useCounterDispatch,
} from "@/contexts/CounterContext";
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
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { RefObject } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { createContext, useContext } from "react";
import { toast, Toaster } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";

const ResettingContext = createContext<boolean | null>(null);

interface CounterButtonProps {
  isResetting: boolean;
  setIsResetting: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CounterPage() {
    
    const [isResetting, setIsResetting] = useState(false);

    return (
    <div className="flex mt-10 flex-col items-center justify-center gap-5">
      <CounterProvider>
      <ResettingContext value={isResetting}>
          <CounterButton
          isResetting={isResetting}
          setIsResetting={setIsResetting}
          />
          <FirstGenChild>
          <SecondGenChild />
          </FirstGenChild>
      </ResettingContext>
      </CounterProvider>
      <Toaster
        viewportClassName="fixed top-0 right-0 bottom-auto left-auto z-[100] flex max-h-screen w-full flex-col p-4 sm:max-w-[420px]"
        swipeDirection={"right"}
      />
    </div>
    );
}

function CounterButton({ isResetting, setIsResetting }: CounterButtonProps) {
  const { val } = useComplexObj();
  const dispatch = useCounterDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetOnOutsideClick, setResetOnOutsideClick] = useState(true);
  const [increment, setIncrement] = useState(1);
  const [capVal, setCapVal] = useState(10);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  interface simpleFormI {
    InputNum: number;
  }
  interface simpleForm2I {
    CapVal: number;
  }
  const {
    register: registerInc,
    handleSubmit: handleSubmitInc,
    reset: resetInc,
    formState: { errors: IncErrors },
  } = useForm<simpleFormI>({
    defaultValues: {
      InputNum: 1,
    },
  });
  const {
    register: registerCap,
    handleSubmit: handleSubmitCap,
    reset: resetCap,
    formState: { errors: CapErrors },
  } = useForm<simpleForm2I>({
    defaultValues: {
      CapVal: 10,
    },
  });
  const actionOnSubmit: SubmitHandler<simpleFormI> = ({ InputNum }) => {
    if (isNaN(InputNum)) {
      triggerReset();
      return;
    }
    setIncrement(InputNum);
  };
  const actionOnSubmitForm2: SubmitHandler<simpleForm2I> = ({ CapVal }) => {
    if (isNaN(CapVal)) {
      triggerReset();
      return;
    }
    setCapVal(CapVal);
  };

  const triggerReset = async () => {
    setIsResetting(true);
    setDialogOpen(false);
    setIncrement(1);
    setCapVal(10);
    resetInc({ InputNum: 1 });
    resetCap({ CapVal: 10 });

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
    <div className="flex flex-col gap-5">
      <FieldLabel htmlFor="switch-share" className="max-w-xs">
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
            const nextValue: number = val + increment;
            dispatch({ type: "setCount", value: nextValue });

            if (nextValue >= capVal) {
              setDialogOpen(true);
              const id = toast.add({
                type: "warning",
                description: `Heads up! You cannot increment counter more than ${capVal}`,
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
          disabled={isResetting || val > capVal}
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

      <form onSubmit={handleSubmitInc(actionOnSubmit)}>
        <FieldGroup>
          <Field orientation={"horizontal"}>
            <FieldLabel htmlFor="InputNumber">Step increment:</FieldLabel>
            <Input
              type="number"
              id="InputNumber"
              {...registerInc("InputNum", {
                min: { value: 1, message: "Increment must be at least 1" },
                max: { value: 100, message: "Increment must be at-most 100" },
                valueAsNumber: true,
              })}
            />
            <Button
              type="submit"
              disabled={isResetting}
              className={"relative min-w-15"}
            >
              {isResetting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner data-icon="inline-start" />
                </div>
              )}
              <span className={isResetting ? "invisible" : "visible"}>
                Enter
              </span>
            </Button>
          </Field>
        </FieldGroup>

        {IncErrors.InputNum && (
          <FieldError
            errors={[{ message: String(IncErrors.InputNum.message) }]}
          />
        )}
      </form>

      <form onSubmit={handleSubmitCap(actionOnSubmitForm2)}>
        <Field orientation={"horizontal"}>
          <FieldLabel htmlFor="cap-value">Cap Value</FieldLabel>
          <Input
            id="cap-value"
            type="number"
            {...registerCap("CapVal", {
              min: { value: 1, message: "Min value is 1" },
              max: { value: 1000, message: "CapVal must be at-most 1000" },
              valueAsNumber: true,
            })}
            placeholder="Enter cap value..."
          />
          <Button
            type="submit"
            disabled={isResetting}
            className={"relative min-w-15"}
          >
            {isResetting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner data-icon="inline-start" />
              </div>
            )}
            <span className={isResetting ? "invisible" : "visible"}>Enter</span>
          </Button>
        </Field>

        {CapErrors.CapVal && (
          <FieldError
            errors={[{ message: String(CapErrors.CapVal.message) }]}
          />
        )}
      </form>

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
    <Card className="wrapper sm:min-h-25 sm:min-w-xs p-2">
      <CardContent className="h1"> First Gen Child </CardContent>
      {children}
    </Card>
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
    <Card>
      {isResetting ? (
        <Skeleton className="h-12 w-auto sm:max-w-sm sm:min-w-50 p-4" />
      ) : (
        <CardContent className="p-2 text-xl font-bold"> Second Gen Child: {val}</CardContent>
      )}
    </Card>
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
