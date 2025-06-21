import PeopleSidebar from "./PeopleSidebar";
import ChatContainer from "./ChatContainer";

const HomePage = () => {
  return (
    <div className="flex h-screen w-full text-sm bg-gray-900 text-gray-100">
      <PeopleSidebar />
      <ChatContainer />
    </div>
  );
};

export default HomePage;
