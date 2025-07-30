import { useEffect, useState } from "react";

import PeopleHeader from "./PeopleHeader";
import FriendSearchResults from "./FriendSearchResults";
import ChatsLoadingPlaceholder from "./ChatsLoadingPlaceholder";
import NoChatsPlaceholder from "./NoChatsPlaceholder";
import ChatsList from "./ChatsList";
import { useChatStore } from "../../../store/useChatStore";

const PeopleSidebar = () => {
  const { users, isChatsLoading, getAllUsers, getAllChats } = useChatStore();
  const [newFriendsSearch, setNewFriendsSearch] = useState("");

  useEffect(() => {
    getAllUsers();
    getAllChats();
  }, [getAllUsers, getAllChats]);

  const ChatsLoading = isChatsLoading;
  const NoChats = !isChatsLoading && users.length === 0;
  const ChatsLoaded = !isChatsLoading && users.length > 0;

  return (
    <aside className="flex flex-col w-full sm:w-fit sm:min-w-[240px] ">
      <PeopleHeader
        setNewFriendsSearch={setNewFriendsSearch}
        newFriendsSearch={newFriendsSearch}
      />
      {newFriendsSearch && (
        <FriendSearchResults
          newFriendsSearch={newFriendsSearch}
          setNewFriendsSearch={setNewFriendsSearch}
        />
      )}
      <ul className="overflow-y-auto">
        {ChatsLoading && <ChatsLoadingPlaceholder />}
        {NoChats && <NoChatsPlaceholder />}
        {ChatsLoaded && <ChatsList />}
      </ul>
    </aside>
  );
};

export default PeopleSidebar;
