import { createContext, useContext } from "react";
import type { MesApp } from "./useMesApp";

export const AppContext = createContext<MesApp | null>(null);
export function useApp(): MesApp {
  const app = useContext(AppContext);
  if (!app) throw new Error("AppContext no disponible");
  return app;
}
