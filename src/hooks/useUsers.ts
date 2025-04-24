import { useQuery } from "@tanstack/react-query";
import { User } from "@/db/dummy";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      return data.users;
    },
  });
} 