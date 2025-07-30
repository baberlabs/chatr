import PeopleSidebar from "./components/PeopleSidebar";
import ChatContainer from "./components/ChatContainer";
import { useChatStore } from "../../store/useChatStore";

const HomePage = () => {
  const { chatMode } = useChatStore();
  return (
    <div className="flex h-screen w-full text-sm bg-gray-900 text-gray-100">
      {!chatMode && <PeopleSidebar />}
      {chatMode && <ChatContainer mobile />}
      <ChatContainer />
    </div>
  );
};

export default HomePage;
