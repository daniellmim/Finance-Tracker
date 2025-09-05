"use client";

import * as React from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import PinScreen from "@/components/spendwise/pin-screen";
import AppDashboard from "@/components/spendwise/app-dashboard";

export default function Home() {
  const [unlocked, setUnlocked] = useLocalStorage("app-unlocked", false);
  const [pin, setPin] = useLocalStorage<string | null>("app-pin", null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePinSet = (newPin: string) => {
    setPin(newPin);
    setUnlocked(true);
  };

  const handlePinUnlock = () => {
    setUnlocked(true);
  };

  // When the component unmounts or the tab is closed, lock the app
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      // Note: use-local-storage doesn't immediately sync across tabs on unload,
      // but this will ensure the state is persisted for the next session.
      setUnlocked(false);
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          // Also lock when the component unmounts (e.g., navigating away in a SPA)
          setUnlocked(false);
        };
    }
  }, [setUnlocked]);


  if (!isClient) {
    // Render a placeholder or null on the server to avoid hydration mismatch
    return null;
  }

  if (!unlocked || !pin) {
    return (
      <PinScreen
        pin={pin}
        onPinSet={handlePinSet}
        onUnlock={handlePinUnlock}
      />
    );
  }

  return <AppDashboard />;
}
