import ChatTopbar from "./ChatTopbar";
import MessageList from "./MessageList";
import ChatBottomBar from "./ChatBottomBar";
import { USERS } from "@/db/dummy";

const MessageContainer = () => {
  
  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar />
      <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
        <MessageList />
        <ChatBottomBar />
      </div>
    </div>
  );
};

export default MessageContainer;
