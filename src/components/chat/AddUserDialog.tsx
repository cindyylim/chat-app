"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input/index";
import { UserPlus } from "lucide-react";
import { useSelectedUser } from "@/store/useSelectedUser";
import { User } from "@/db/dummy";

export default function AddUserDialog() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedUser } = useSelectedUser();

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
        setSelectedUser(data.users[0] as User);
        setEmail("");
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
    <Dialog>
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