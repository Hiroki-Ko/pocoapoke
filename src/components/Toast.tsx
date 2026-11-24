// /pocoapoke/src/components/Toast.tsx
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Kind = "success" | "error";
type ToastApi = { show: (message: string, kind: Kind) => void };

const ToastContext = createContext<ToastApi>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; kind: Kind } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((message: string, kind: Kind) => {
    setToast({ message, kind });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), kind === "error" ? 4000 : 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] mx-auto flex max-w-md justify-center px-4">
          <div
            role="status"
            className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg ${toast.kind === "error" ? "bg-red-500" : "bg-emerald-600"}`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
