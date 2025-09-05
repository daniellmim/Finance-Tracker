"use client";

import * as React from "react";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WishCart() {
  const { wishes, addWish, deleteWish } = useAppData();
  const [newWish, setNewWish] = React.useState("");

  const handleAddWish = () => {
    if (newWish.trim()) {
      addWish(newWish.trim());
      setNewWish("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddWish();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Wish Cart
        </CardTitle>
        <CardDescription>A quick list of things you want to buy.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-2 mb-4">
          <Input
            placeholder="e.g., New shoes"
            value={newWish}
            onChange={(e) => setNewWish(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" size="icon" onClick={handleAddWish}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-72">
          <div className="space-y-2">
            {wishes && wishes.length > 0 ? (
              wishes.map((wish) => (
                <div
                  key={wish.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                  <span className="text-sm font-medium">{wish.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => deleteWish(wish.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))
            ) : (
                <p className="text-sm text-center text-muted-foreground py-10">
                    Your wish cart is empty.
                </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
