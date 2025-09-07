"use client";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        console.log("Auth successful, redirecting...");
        router.push("/");
      } catch (err) {
        console.error("Auth error:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    handleAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="mt-20 w-full flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-10 h-10 animate-spin text-muted-foreground" />
          <h3 className="text-xl font-bold">Checking authentication...</h3>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 w-full flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-bold text-destructive">
            Authentication Error
          </h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 w-full flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader className="w-10 h-10 animate-spin text-muted-foreground" />
        <h3 className="text-xl font-bold">Redirecting...</h3>
        <p>Please wait</p>
      </div>
    </div>
  );
}
