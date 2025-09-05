"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import useLocalStorage from "./use-local-storage";

export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // In a real app, this would be a securely hashed password.
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = {
  username: string;
  email: string;
  password: string;
};

// A very simple hashing function for demonstration purposes.
// DO NOT use this in production. Use a proper library like bcrypt.
const simpleHash = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export function useAuth() {
  const [users, setUsers] = useLocalStorage<User[]>("users", []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>("currentUser", null);

  const signup = (credentials: SignupCredentials): boolean => {
    const { username, email, password } = credentials;
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      passwordHash: simpleHash(password),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    return true;
  };

  const login = (credentials: LoginCredentials): boolean => {
    const { email, password } = credentials;
    const user = users.find((u) => u.email === email);

    if (user && user.passwordHash === simpleHash(password)) {
      setCurrentUser(user);
      return true;
    }

    return false; // Invalid credentials
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return {
    user: currentUser,
    signup,
    login,
    logout,
  };
}
