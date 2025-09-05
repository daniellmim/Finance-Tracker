"use client";

import * as React from "react";
import { Landmark, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type PinScreenProps = {
  pin: string | null;
  onPinSet: (pin: string) => void;
  onUnlock: () => void;
};

export default function PinScreen({ pin, onPinSet, onUnlock }: PinScreenProps) {
  const [input, setInput] = React.useState("");
  const [confirmInput, setConfirmInput] = React.useState("");
  const [isSettingPin, setIsSettingPin] = React.useState(!pin);
  const { toast } = useToast();

  const handleEnter = () => {
    if (isSettingPin) {
      if (input.length < 4) {
        toast({ title: "PIN too short", description: "Please use at least 4 digits.", variant: "destructive" });
        return;
      }
      if (input !== confirmInput) {
        toast({ title: "PINs do not match", description: "Please re-enter your PIN.", variant: "destructive" });
        setConfirmInput("");
        return;
      }
      onPinSet(input);
    } else {
      if (input === pin) {
        onUnlock();
      } else {
        toast({ title: "Incorrect PIN", variant: "destructive" });
        setInput("");
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEnter();
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Landmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">SpendWise</h1>
          </div>
          <CardTitle className="text-2xl">
            {isSettingPin ? "Set Your PIN" : "Enter Your PIN"}
          </CardTitle>
          <CardDescription>
            {isSettingPin
              ? "Create a 4-digit PIN to secure your app."
              : "Enter your PIN to unlock."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            type="password"
            placeholder="PIN"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-center text-lg tracking-widest"
            maxLength={8}
          />
          {isSettingPin && (
            <Input
              type="password"
              placeholder="Confirm PIN"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-center text-lg tracking-widest"
              maxLength={8}
            />
          )}
          <Button onClick={handleEnter} className="w-full">
            <Lock className="mr-2 h-4 w-4" />
            {isSettingPin ? "Set PIN" : "Unlock"}
          </Button>
          {!isSettingPin && (
             <Button variant="link" onClick={() => setIsSettingPin(true)}>
                Forgot PIN? Reset it.
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
