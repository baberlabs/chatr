import { useChatStore } from "@/store/useChatStore";

import ChatHeader from "./ChatHeader";
import ChatWindow from "./ChatWindow";
import NewMessageForm from "./NewMessageForm";

const ChatContainer = ({ mobile }) => {
  const { selectedUser } = useChatStore();

  return (
    <main
      className={`flex flex-col h-screen w-full bg-gray-800 text-gray-100 overflow-hidden ${
        mobile ? "flex sm:hidden" : "hidden sm:flex"
      }`}
    >
      <ChatHeader />
      <ChatWindow />
      {selectedUser && <NewMessageForm />}
    </main>
  );
};

export default ChatContainer;
