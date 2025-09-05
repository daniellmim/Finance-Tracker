"use client";

import * as React from "react";
import AppDashboard from "@/components/spendwise/app-dashboard";
import Auth from "@/components/spendwise/auth";
import { useAuth } from "@/hooks/use-auth";
import { Landmark } from "lucide-react";

export default function Home() {
  const { user, login, signup, logout } = useAuth();
  const [showLogin, setShowLogin] = React.useState(true);

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center gap-2">
            <Landmark className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
              SpendWise
            </h1>
          </div>
          <Auth
            isLogin={showLogin}
            onLogin={login}
            onSignup={signup}
            toggleForm={() => setShowLogin(!showLogin)}
          />
        </div>
      </div>
    );
  }

  return <AppDashboard user={user} onLogout={logout} />;
}
