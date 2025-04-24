import { User, Group } from "@/db/dummy";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
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

/* eslint-disable */
interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const [playClickSound] = useSound("/sounds/mouse-click.mp3");
  const { soundEnabled } = usePreferences();
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const { user: currentUser } = useKindeBrowserClient();
  const [groups, setGroups] = useState<Group[]>([]);
  const { data: users = [] } = useUsers();

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
        {users.map((user, idx) =>
          isCollapsed ? (
            <TooltipProvider key={idx}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div onClick={() => handleUserClick(user)}>
                    <Avatar className="my-1 flex justify-center items-center">
                      <AvatarImage
                        src={user.image || "/avatars/user-placeholder.png"}
                        alt="User Image"
                        className="border-2 border-white rounded-full w-10 h-10"
                      />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">{user.name}</span>
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              key={idx}
              variant={"grey"}
              size="xl"
              onClick={() => handleUserClick(user)}
              className={cn(
                "w-full justify-start gap-4 my-1",
                selectedUser?.id === user.id && "bg-muted shrink"
              )}
            >
              <Avatar className="flex justify-center items-center">
                <AvatarImage
                  src={user.image || "/avatars/user-placeholder.png"}
                  alt={"User image"}
                  className="w-10 h-10"
                />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col max-w-28">
                <span>{user.name}</span>
              </div>
            </Button>
          )
        )}

        {/* Groups Section */}
        {!isCollapsed && groups.length > 0 && (
          <div className="mt-4">
            <div className="flex gap-2 items-center text-2xl mb-2">
              <Users2 className="h-6 w-6" />
              <span>Groups</span>
            </div>
            {groups.map((group, idx) => (
              <Button
                key={idx}
                variant={"grey"}
                size="xl"
                onClick={() => handleGroupClick(group)}
                className={cn(
                  "w-full justify-start gap-4 my-1",
                  selectedUser?.id === group.id && "bg-muted shrink"
                )}
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
                </div>
              </Button>
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
