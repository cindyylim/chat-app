import { Button } from "@/components/ui/button";

const AuthButtons = () => {
  return (
    <div className="flex gap-3 md:flex-row flex-col absolute bottom-10 justify-center">
      <Button className="w-full p-8 text-xl" size="lg" variant="outline">
        Sign up
      </Button>
      <Button className="w-full p-8 text-xl" size="lg">Login</Button>
    </div>
  );
};

export default AuthButtons;
