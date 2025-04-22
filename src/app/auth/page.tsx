import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import AuthButtons from "./AuthButtons";
import { redirect } from "next/navigation";

const page = async () => {
  const { isAuthenticated } = getKindeServerSession();
  if (await isAuthenticated()) {
    return redirect("/");
  }
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-1 overflow-hidden dark:bg-blue-800 relative justify-center items-center">
        <p className="text-4xl font-bold text-center text-gray-600 absolute top-10">
          Chat and connect with your friends
        </p>
        <AuthButtons />
        <img
          src="/logo.png"
          alt="logo"
          className="absolute lg:scale-125 xl:scale-100 scale-[2] pointer-events-none select-none -z-1"
        ></img>
      </div>
    </div>
  );
};

export default page;
