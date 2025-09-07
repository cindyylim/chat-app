import { User, Group } from "@/db/dummy";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { LogOut, Users, Users2 } from "lucide-react";
import { useSound } from "use-sound";
import { usePreferences } from "@/store/usePreferences";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useSelectedUser } from "@/store/useSelectedUser";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import AddUserDialog from "./chat/AddUserDialog";
import CreateGroupDialog from "./chat/CreateGroupDialog";
import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import PreferencesTab from "./PreferencesTab";
import { usePresence } from "../hooks/usePresence";

/* eslint-disable */
interface SidebarProps {
  isCollapsed: boolean;
}

function UserListItem({ user, isOnline }: { user: User, isOnline: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Avatar>
          <AvatarImage src={user.image} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <span
          className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      </div>
      <span>{user.name}</span>
    </div>
  );
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const [playClickSound] = useSound("/sounds/mouse-click.mp3");
  const { soundEnabled } = usePreferences();
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const { user: currentUser } = useKindeBrowserClient();
  const onlineUsers = usePresence(currentUser?.id);
  const [groups, setGroups] = useState<Group[]>([]);
  const { data: users = [] } = useUsers();
  const [previews, setPreviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups");
        const data = await response.json();
        if (data.groups) {
          setGroups(data.groups);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    fetch("/api/conversations/last-messages")
      .then(res => res.json())
      .then(data => setPreviews(data.previews || []));
  }, []);

  // Helper to get preview for a user or group
  const getPreview = (id: string) => {
    const preview = previews.find(
      p =>
        p.conversation?.participant1 === id ||
        p.conversation?.participant2 === id ||
        p.conversationId === id // for groups
    );
    return preview?.lastMessage?.content || "";
  };

  const getUserName = () => {
    if (!currentUser) return "";
    if (currentUser.given_name && currentUser.family_name) {
      return `${currentUser.given_name} ${currentUser.family_name}`;
    }
    return currentUser.email || "";
  };

  const handleUserClick = (user: User) => {
    soundEnabled && playClickSound();
    setSelectedUser(user);
  };

  const handleGroupClick = (group: Group) => {
    soundEnabled && playClickSound();
    setSelectedUser(group as unknown as User);
  };

  return (
    <div className="relative flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 max-h-full overflow-auto bg-background">     
      {!isCollapsed && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between p-2 items-center">
            <div className="flex gap-2 items-center text-2xl">
              <Users className="h-6 w-6" />
              <span>Users</span>
            </div>
            <div className="flex gap-2">
              <AddUserDialog />
              <CreateGroupDialog />
            </div>
          </div>
          <PreferencesTab />
        </div>
      )}
      <ScrollArea className="gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collpased=true]]:px-2">
        {/* Users Section */}
        {users.map(user => (
          <div
            key={user.id}
            className={`cursor-pointer hover:bg-accent rounded ${selectedUser?.id === user.id ? "bg-muted" : ""}`}
            onClick={() => handleUserClick(user)}
          >
            <UserListItem user={user} isOnline={onlineUsers.some(onlineUser => onlineUser.id === user.id)} />
            <div className="text-xs text-muted-foreground truncate px-2 pb-1">
              {getPreview(user.id)}
            </div>
          </div>
        ))}

        {/* Groups Section */}
        {!isCollapsed && groups.length > 0 && (
          <div className="mt-4">
            <div className="flex gap-2 items-center text-2xl mb-2">
              <Users2 className="h-6 w-6" />
              <span>Groups</span>
            </div>
            {groups.map((group) => (
              <div
                key={group.id}
                className={`cursor-pointer hover:bg-accent rounded ${selectedUser?.id === group.id ? "bg-muted" : ""}`}
                onClick={() => handleGroupClick(group)}
              >
                <Avatar className="flex justify-center items-center">
                  <AvatarImage
                    src={group.image || "/avatars/group-placeholder.png"}
                    alt={"Group image"}
                    className="w-10 h-10"
                  />
                  <AvatarFallback>
                    <Users2 className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col max-w-28">
                  <span>{group.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {group.members.length} members
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {getPreview(group.id)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="mt-auto">
        <div className="flex justify-between items-center gap-2 md:px-6 py-2">
          {!isCollapsed && currentUser && (
            <div className="hidden md:flex gap-2 items-center">
              <Avatar className="flex justify-center items-center">
                <AvatarImage
                  src={currentUser.picture || "/avatars/user-placeholder.png"}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 border-2 border-white rounded-full"
                />
                <AvatarFallback>{getUserName()[0]}</AvatarFallback>
              </Avatar>
              <p className="font-bold">{getUserName()}</p>
            </div>
          )}
          <div className="flex">
            <LogoutLink>
              <LogOut size={22} cursor="pointer" />
            </LogoutLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
