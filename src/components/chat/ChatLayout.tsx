"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "../Sidebar";
import MessageContainer from "./MessageContainer";
import { useSelectedUser } from "@/store/useSelectedUser";

interface ChatLayoutProps {
  defaultLayout: number[] | undefined;
}

const ChatLayout = ({ defaultLayout = [320, 480] }: ChatLayoutProps) => {
  const { selectedUser } = useSelectedUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(
          sizes
        )}`;
      }}
      className="h-full items-stretch"
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsible={true}
        minSize={15}
        maxSize={20}
        collapsedSize={4}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            true
          )}`;
        }}
        onExpand={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            false
          )}`;
        }}
      >
        <Sidebar isCollapsed={isCollapsed} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        {!selectedUser && (
          <div className="flex justify-center items-center h-full w-full px-10">
            <div className="flex flex-col justify-center items-center gap-4">
              <img
                src="logo.png"
                alt="Logo"
                className="w-full md:w-2/3 lg:w-1/2"
              />
              <p className="text-muted-foreground text-center">
                Click on a chat to view the messages
              </p>
            </div>
          </div>
        )}
        {selectedUser && <MessageContainer />}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;
