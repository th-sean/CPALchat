import React from "react";
import { useState, useMemo, useEffect } from "react";
import moment from "moment-timezone";
import useChatInfoStore from "../../stores/chatStore.js";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import Spinner from "../animation/spinner";
import { PiChatDuotone, PiTrashDuotone } from "react-icons/pi";
import { useSessionStorage } from "../../hooks/useSessionStorage.js";

function ChatDrawer({}) {
  const [userTimeZone, setUserTimeZone] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  /**
   * @comment update spell check
   */
  const [isDeleteChatLoading, setIsDeleteChatLoading] = useState(false);
  const [accessToken] = useSessionStorage("accessToken", "");
  const router = useRouter(); // Get the router object
  const currentChatId = useChatInfoStore((state) => state.currentChatId);
  const setChatArray = useChatInfoStore((state) => state.setChatArray);


  useEffect(() => {
    getChatList();
    console.log("chatList:", chatList)
    setUserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  /**
   * @comment Split this method into another two files
   * put axios call into service/getChatList.js
   * put the hooks update into hooks/useChatList.js, ant call the `service/getChatList.js` inside.
   */
  async function getChatList() {
    try {
      console.log("Function :getChatList");
      const response = await axios.get("/api/chatbot/getChatList", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("chatlist response :", response.data);
      setChatList(response.data);
    } catch (error) {
      console.error("Error getting new chat ID", error);
    }
  }

  /**
   * @comment Split this method into another two files
   * same as the `getChatList` function
   */
  async function postDeleteChat(id) {
    setIsDeleteChatLoading(true);
    try {
      console.log("Function : getNewChatId ", id);
      const response = await axios.post(
        "/api/chatbot/postDeleteChat",
        { chat_id: id },
        {
          headers: {
            Authorization: `Bearer ${accessToken || ""}`,
          },
        }
      );
      setChatArray([]);
    } catch (error) {
      console.error("Error getting new chat ID", error);
      return -1;
    } finally {
      router.push(`/chatbot`, undefined, { shallow: true });
      
      setIsDeleteChatLoading(false);
    }
  }

  /**
   * @comment Split this method into another two files
   * same as the `getChatList` function
   */
  async function getNewChatId() {
    try {
      console.log("Function : getNewChatId ");
      const response = await axios.get("/api/chatbot/postCreateNewChat", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const chatId = response.data.chat_id;

      return chatId;
    } catch (error) {
      console.error("Error getting new chat ID", error);
      return -1;
    }
  }

  async function handleNewConversation() {
    const newChatId = await getNewChatId();
    console.log("New ChatId conversation: ", newChatId);
    setChatArray([]);
    router.push(`/chatbot/${newChatId}`, undefined, { shallow: true });
    setSelectedChatId(newChatId);
    await getChatList();
  }

  async function handleChatClick(id) {
    console.log("Chat id Clicked: ", id);
    router.push(`/chatbot/${id}`);
    setSelectedChatId(id);
  }

  const groupedChats = useMemo(() => {
    const today = [];
    const yesterday = [];
    const last7Days = [];
    const last30Days = [];

    if (!userTimeZone)
      return { today: [], yesterday: [], last7Days: [], last30Days: [] };

    console.log("This is userTimeZone", userTimeZone);
    const now = moment().tz(userTimeZone).startOf("day");

    chatList.forEach((chat) => {
      const chatTime = moment
        .utc(chat.last_chat_time)
        .tz(userTimeZone)
        .startOf("day");
      const diffDays = now.diff(chatTime, "days");

      if (diffDays < 0) return; // Handle chats from the future appropriately

      if (diffDays === 0) today.push(chat);
      else if (diffDays === 1) yesterday.push(chat);
      else if (diffDays <= 7) last7Days.push(chat);
      // If you want to include 'yesterday' in 'last7Days'
      else if (diffDays <= 30) last30Days.push(chat); // If you want to include 'last7Days' in 'last30Days'
    });

    return { today, yesterday, last7Days, last30Days };
  }, [chatList, userTimeZone]);

  return (
    <div className={`flex flex-col h-full relative bg-white`}>
      {/* Chat history */}
      <div className="w-full flex justify-center mb-2 ">
        <button
          className="w-full max-w-xs mx-4 mt-2 font-semibold text-sm py-2
              bg-blue-600 text-white shadow-sm rounded-md ring-0 ring-blue-600 hover:ring-2 active:ring-0
              transition-all duration-200 outline-none hover:outline-none focus:outline-none"
          onClick={() => {}}
        >
          <div onClick={handleNewConversation} className="max-w-[30vh]">+ New Chat</div>
        </button>
      </div>
      <div className="overflow-y-auto flex-grow ">
        {[
          { label: "Today", chats: groupedChats.today },
          { label: "Yesterday", chats: groupedChats.yesterday },
          { label: "Previous 7 Days", chats: groupedChats.last7Days },
          { label: "Previous 30 Days", chats: groupedChats.last30Days },
        ].map(
          (section) =>
            section.chats.length > 0 && (
              <div
                className="text-sm text-gray-600 px-2 py-1"
                key={section.label}
              >
                <div className="text-xs ml-3 font-semibold text-gray-400">
                  {section.label}
                </div>
                <ul>
                  {section.chats.map((chat) => (
                    <li
                      key={chat.chat_id}
                      onClick={() => handleChatClick(chat.chat_id)}
                      className={
                        selectedChatId === chat.chat_id
                          ? "text-blue-800 bg-gray-200 rounded-lg hover:bg-gray-200 relative"
                          : "relative"
                      }
                    >
                      <Link
                        href={`/chatbot/${chat.chat_id}`}
                        className="block py-3 px-2 rounded hover:bg-gray-100 transition duration-300 w-full relative"
                      >
                        <div className="flex items-center flex-grow space-x-2 pr-6">
                          <div className="flex-shrink-0">
                            <PiChatDuotone />
                          </div>
                          <div
                            className={
                              selectedChatId === chat.chat_id
                                ? "min-w-0 mr-2 typewriter-effect inline-block"
                                : "min-w-0 mr-2 inline-block"
                            }
                          >
                            <div className="truncate text-ellipsis flex-grow text-caption font-regular">
                              {chat.subject}
                            </div>
                          </div>
                        </div>
                        {selectedChatId === chat.chat_id &&
                          (isDeleteChatLoading ? (
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 pr-2">
                              <Spinner size={`w-5 h-5`} />
                            </div>
                          ) : (
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 pr-2">
                              <PiTrashDuotone
                                onClick={(e) => {
                                  postDeleteChat(chat.chat_id);
                                }}
                              />
                            </div>
                          ))}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default ChatDrawer;

// "flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-full
