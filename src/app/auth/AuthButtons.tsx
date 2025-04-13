"use client"
import { Button } from "@/components/ui/button";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { useState } from "react";

const AuthButtons = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex gap-3 md:flex-row flex-col absolute bottom-10 justify-center">
      <RegisterLink className="flex-1" onClick={() => setIsLoading(true)}>
        <Button className="w-full p-8 text-xl" size="lg" variant="outline" disabled={isLoading}>
          Sign up
        </Button>
      </RegisterLink>
      <LoginLink className="flex-1" onClick={() => setIsLoading(true)}>
        <Button className="w-full p-8 text-xl" size="lg" disabled={isLoading}>
          Login
        </Button>
      </LoginLink>
    </div>
  );
};

export default AuthButtons;
