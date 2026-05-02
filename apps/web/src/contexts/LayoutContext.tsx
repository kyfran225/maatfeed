import { createContext, useContext, useState, ReactNode } from "react";

interface LayoutContextType {
  hideBottomNav: boolean;
  setHideBottomNav: (hide: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [hideBottomNav, setHideBottomNav] = useState(false);

  return (
    <LayoutContext.Provider value={{ hideBottomNav, setHideBottomNav }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
