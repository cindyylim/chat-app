import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import ChatLayout from "@/components/chat/ChatLayout";
import { cookies } from "next/headers";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  const cookieStoreInstance = await cookies();
  const layout = cookieStoreInstance.get("react-resizable-panels:layout");
  const defaultLayout = layout ? JSON.parse(layout.value) : [320, 480];

  return (
    <main className="h-screen">
      <ChatLayout defaultLayout={defaultLayout} />
    </main>
  );
}
