"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input/index";
import { UserPlus } from "lucide-react";
import { useSelectedUser } from "@/store/useSelectedUser";
import { User } from "@/db/dummy";
import { useQueryClient } from "@tanstack/react-query";

export default function AddUserDialog() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { setSelectedUser } = useSelectedUser();
  const queryClient = useQueryClient();

  const handleSearch = async () => {
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to find user");
        return;
      }

      // Set the first found user as the selected user
      if (data.users && data.users.length > 0) {
        const newUser = data.users[0] as User;
        setSelectedUser(newUser);
        setEmail("");
        
        // Invalidate the users query to refresh the sidebar
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        
        // Close the dialog
        setOpen(false);
      } else {
        setError("No user found with this email");
      }
    } catch (err) {
      setError("An error occurred while searching for the user " + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User by Email</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
} 