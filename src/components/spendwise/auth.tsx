"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { LoginCredentials, SignupCredentials } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginSchema = z.infer<typeof loginSchema>;
type SignupSchema = z.infer<typeof signupSchema>;

type AuthProps = {
  isLogin: boolean;
  onLogin: (credentials: LoginCredentials) => boolean;
  onSignup: (credentials: SignupCredentials) => boolean;
  toggleForm: () => void;
};

export default function Auth({ isLogin, onLogin, onSignup, toggleForm }: AuthProps) {
  const { toast } = useToast();

  const form = useForm<LoginSchema | SignupSchema>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { username: "", email: "", password: "" },
  });
  
  React.useEffect(() => {
    form.reset( isLogin
      ? { email: "", password: "" }
      : { username: "", email: "", password: "" });
  }, [isLogin, form]);


  const onSubmit = (values: LoginSchema | SignupSchema) => {
    let success = false;
    if (isLogin) {
      success = onLogin(values as LoginCredentials);
      if (!success) {
        toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      }
    } else {
      success = onSignup(values as SignupCredentials);
      if (!success) {
        toast({ title: "Signup Failed", description: "An account with this email already exists.", variant: "destructive" });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
        <CardDescription>
          {isLogin ? "Enter your credentials to access your account." : "Create an account to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="Your username" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Button variant="link" onClick={toggleForm} className="p-0 h-auto">
            {isLogin ? "Sign Up" : "Login"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}