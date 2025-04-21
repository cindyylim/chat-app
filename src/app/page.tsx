import Image from "next/image";
import PreferencesTab from "@/components/PreferencesTab";
import { cookies } from "next/headers";
import ChatLayout from "@/components/chat/ChatLayout";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { User } from "@/db/dummy";
import redis from "@/db/db";

async function getUsers(): Promise<User[]> {
  const userKeys: string[] = [];
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: "user:*",
      type: "hash",
      count: 100,
    });
    cursor = nextCursor;
    userKeys.push(...keys);
  } while (cursor !== "0");
  const { getUser } = getKindeServerSession();
  const currentUser = await getUser();

  const pipeline = redis.pipeline();
  userKeys.forEach((key) => pipeline.hgetall(key));
  const results = (await pipeline.exec()) as User[];

  const users: User[] = [];
  for (const user of results) {
    if (user.id !== currentUser?.id) {
      users.push(user);
    }
  }
  return users;
}

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return redirect("/auth");
  }
  const users = await getUsers();
  const cookieStore = await cookies();
  const layout = cookieStore.get("react-resizable-panels:layout");
  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  return (
    <main className="flex h-screen flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
      <PreferencesTab />
      <div className="border rounded-lg max-w-5xl w-full min-h-[85vh text-sm lg:flex">
        <ChatLayout defaultLayout={defaultLayout} users={users} />
      </div>
    </main>
  );
}
