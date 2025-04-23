"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import { User } from "@/db/dummy";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

interface SelectMembersDialogProps {
  onSelect: (members: string[]) => void;
  selectedMembers: string[];
}

export default function SelectMembersDialog({ onSelect, selectedMembers }: SelectMembersDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm) {
      setUsers([]);
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
        body: JSON.stringify({ email: searchTerm }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to search users");
        return;
      }

      setUsers(data.users || []);
    } catch (err) {
      setError("An error occurred while searching users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      onSelect(selectedMembers.filter(id => id !== userId));
    } else {
      onSelect([...selectedMembers, userId]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Group Members</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Search by email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {searchTerm ? "No users found. Try searching with a different email." : "Enter an email to search for users."}
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted ${
                    selectedMembers.includes(user.id) ? "bg-primary/10" : ""
                  }`}
                  onClick={() => handleSelect(user.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  {selectedMembers.includes(user.id) ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
} 