import React from 'react';
import { DesktopLayout } from './DesktopLayout';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const DesktopApp: React.FC = () => {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <>
      <DesktopLayout />
      <KeyboardShortcutsHelp />
    </>
  );
};
