"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Users } from "lucide-react";
import { useSelectedUser } from "@/store/useSelectedUser";
import { User } from "@/db/dummy";
import SelectMembersDialog from "./SelectMembersDialog";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateGroupDialog() {
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedUser } = useSelectedUser();
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!name || members.length === 0) {
      setError("Please provide a group name and select members");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, members }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create group");
        return;
      }

      // Set the created group as the selected user
      setSelectedUser(data.group as User);
      setName("");
      setMembers([]);
      
      // Invalidate the users query to refresh the sidebar
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      setError("An error occurred while creating the group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Selected members: {members.length}</span>
            <SelectMembersDialog onSelect={setMembers} selectedMembers={members} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
} 