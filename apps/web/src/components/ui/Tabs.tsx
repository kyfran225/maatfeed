import React, { useState } from "react";

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  activeValue: string;
  setActiveValue: (value: string) => void;
}>({
  activeValue: "",
  setActiveValue: () => {}
});

export function Tabs({ children, defaultValue = "", className = "" }: TabsProps) {
  const [activeValue, setActiveValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }: TabsListProps) {
  return (
    <div className={`flex space-x-1 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "", onClick }: TabsTriggerProps) {
  const { activeValue, setActiveValue } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
        isActive
          ? "bg-orange-500 text-white border-b-2 border-orange-500"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      } ${className}`}
      onClick={() => {
        setActiveValue(value);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }: TabsContentProps) {
  const { activeValue } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  if (!isActive) return null;

  return (
    <div className={className}>
      {children}
    </div>
  );
}
