import React from 'react';
import EditorUI from './components/EditorUI';
import { AppProvider, useAppContext } from './context/AppContext';

function AppInner() {
  const { devMode } = useAppContext();

  return (
    <>
      <EditorUI />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
