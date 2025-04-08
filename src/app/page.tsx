import Image from "next/image";
import PreferencesTab from "@/components/PreferencesTab";
import { cookies } from "next/headers";
import ChatLayout from "@/components/chat/ChatLayout";

export default function Home() {
  const layout = cookies().get("react-resizable-panels:layout");
  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  return <main className="flex h-screen flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
    <PreferencesTab/>
    <div className="border rounded-lg max-w-5xl w-full min-h-[85vh text-sm lg:flex">
      <ChatLayout defaultLayout={defaultLayout}/>
    </div>
  </main>
}
