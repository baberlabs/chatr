import PeopleSidebar from "./PeopleSidebar";
import ChatContainer from "./ChatContainer";

const HomePage = () => {
  return (
    <div className="flex h-screen text-sm bg-gray-100 text-gray-800 overflow-hidden">
      <PeopleSidebar />
      <ChatContainer />
    </div>
  );
};

export default HomePage;
