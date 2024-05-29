import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Loading from "../animation/loading";
import { FaPaperPlane, FaTrashCan, FaRegComments } from "react-icons/fa6";
import {
  PiUserDuotone,
  PiBrainDuotone,
  PiArrowDown,
  PiFolderUserDuotone,
  PiGlobeSimpleDuotone,
  PiDownloadSimpleDuotone,
  PiQueueDuotone,
  PiMagnifyingGlassDuotone,
  PiGoogleLogoDuotone,
} from "react-icons/pi";
import hljs from "highlight.js";
import "highlight.js/styles/panda-syntax-dark.css"; // choose a style of your preference
import axios from "axios";
import LoadingDots from "../animation/loadingDots";
import formatDate from "../../utils/dateFormat";
import linkify from "../../utils/linkify.js";
import { useSessionStorage } from "../../hooks/useSessionStorage";
import firstLetterCapitalized from "../../utils/stringManimupaltion";
import extractUsername from "../../utils/usernameExtractor";
import Spinner from "../animation/spinner"

function ChatController({
  isSendChatLoading,
  isGetChatLoading,
  streamingResponse,
  messages,
  setInputText,
  responseStatus,
}) {
  const router = useRouter();
  const [user, setUser] = useSessionStorage("user", "");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState({
    blockId: null,
    index: null,
  }); // Add this state
  const [summaryData, setSummaryData] = useState(null);
  const { docId } = router.query;
  const [accessToken, setAccessToken] = useSessionStorage("accessToken", "");
  const [firstLetter, setFirstLetter] = useState("");
  const [usernameExtracted, setUsernameExtracted] = useState("");

  useEffect(() => {
    if (user) {
      setFirstLetter(firstLetterCapitalized(user.email));
      setUsernameExtracted(extractUsername(user.email));
      // setUserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);

  const renderBasedOnResponseStatus = (status) => {
    console.log("renderBasedOnResponseStatus", status);
    switch (status[0]) {
      case "ChatGPT":
        return (
          <div className="border border-purple-500/75 border-1 flex rounded-lg justify-center items-center max-w-fit">
            <div className="flex">
              <PiGlobeSimpleDuotone className="w-6 h-6 mx-4 my-2 text-purple-500" />
            </div>
            <div className="my-2 mr-5">
              <div className="flex items-center">
                <div className="text-gray text-xs font-bold flex aligns-center">
                  <span className="mr-2">Browsing...</span>
                </div>
                <Spinner
                  className=""
                  size={`w-3 h-3`}
                  tintColor={"fill-black"}
                  bgColor={"dark:text-purple-300"}
                />
              </div>
              <div className="text-gray text-xs font-medium mr-2">
                {responseStatus[0]}
              </div>
            </div>
          </div>
        );
      case "Google_Search":
        return (
          <div className="border border-red-500/75 border-1 flex rounded-lg justify-center items-center max-w-fit">
            <div className="flex">
              <PiGoogleLogoDuotone className="w-6 h-6 mx-4 my-2 text-red-500" />
            </div>
            <div className="my-2 mr-5">
              <div className="flex items-center">
                <div className="text-gray text-xs font-bold flex aligns-center">
                  <span className="mr-2">Browsing...</span>
                </div>
                <Spinner
                  className=""
                  size={`w-3 h-3`}
                  tintColor={"fill-black"}
                  bgColor={"dark:text-red-300"}
                />
              </div>
              <div className="text-gray text-xs font-medium mr-2">
                {responseStatus[0]}
              </div>
            </div>
          </div>
        );
      case "Document_QA_System":
        return (
          <div className="border border-blue-500/75 border-1 flex rounded-lg justify-center items-center max-w-fit">
            <div className="flex">
              <PiFolderUserDuotone className="w-6 h-6 mx-4 my-2 text-blue-500" />
            </div>
            <div className="my-2 mr-5">
              <div className="flex items-center">
                <div className="text-gray text-xs font-bold flex aligns-center">
                  <span className="mr-2">Browsing...</span>
                </div>
                <Spinner
                  className=""
                  size={`w-3 h-3`}
                  tintColor={"fill-black"}
                  bgColor={"dark:text-blue-300"}
                />
              </div>
              <div className="text-gray text-xs font-medium mr-2">
                Your documents
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="mt-4">
            <LoadingDots />
          </div>
        );
    }
  };

  const renderBasedOnSource = (sourceStatus) => {
    switch (sourceStatus) {
      case "ChatGPT":
        return (
          <div className="flex rounded-lg justify-center items-center max-w-fit bg-white rounded-md">
            <div className="flex">
              <PiGlobeSimpleDuotone className="w-6 h-6 mx-4 my-2 text-purple-500" />
            </div>
            <div className="my-2 mr-5">
              <div className="flex items-center">
                <div className="text-gray text-xs font-bold flex aligns-center">
                  <span className="mr-2">ChatGPT</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "Google_Search":
        return (
          <div className="flex rounded-lg justify-center items-center max-w-fit bg-white rounded-md">
            <div className="flex">
              <PiGoogleLogoDuotone className="w-6 h-6 mx-4 my-2 text-red-500" />
            </div>
            <div className="my-2 mr-5">
              <div className="flex items-center">
                <div className="text-gray text-xs font-bold flex aligns-center">
                  <span className="mr-2">Google Search</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "Document_QA_System":
        return (
          <div className="flex rounded-lg justify-center items-center max-w-fit">
            <div className="flex">
              <PiFolderUserDuotone className="w-6 h-6 mx-4 my-2 text-blue-500" />
            </div>
            <div className="my-2 mr-5">
              <div className="flex items-center">
                <div className="text-gray text-xs font-bold flex aligns-center">
                  <span className="mr-2">Document Library</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "Document_Display":
        return (
          <div className="flex rounded-lg justify-center items-center max-w-fit">
            <div className="flex">
              <PiMagnifyingGlassDuotone className="w-6 h-6 mx-4 my-2 text-blue-500" />
            </div>
            <div className="my-2 mr-5">
              <div className="flex items-center">
                <div className="text-gray text-xs font-bold flex aligns-center">
                  <span className="mr-2">Document Search</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <></>;
    }
  };
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleHandleInstruction = (itemText) => () => {
    setInputText(itemText);
  };
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  async function getDownloadDocument(id) {
    console.log("this is id", id);
    if (!id) return;

    console.log("this is download document id" + id);
    try {
      const response = await axios.post(
        `/api/upload/getDownloadDocument`,
        { selectedId: id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const url = response.data.url;
      window.open(url, "_blank");

      if (response.status === 200) {
        console.log("Document Opened");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  function markdownToHtml(str) {
    // Convert bold text
    str = str.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert code blocks with syntax highlighting
    str = str.replace(/```(.*?)\n(.*?)```/gs, function (match, lang, code) {
      const highlightedCode = hljs.highlight(lang, code).value;
      return `<pre><code class="hljs ${lang}">${highlightedCode}</code></pre>`;
    });

    str = linkify(str);

    return str;
  }

  const downloadDocumentClick = (fileId) => {
    getDownloadDocument(fileId);
  };

  async function getDownloadDocument(id) {
    if (!id) return;

    console.log("this is download document id" + id);
    try {
      const response = await axios.post(
        `/api/upload/getDownloadDocument`,
        { selectedId: id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const url = response.data.url;
      window.open(url, "_blank");

      if (response.status === 200) {
        console.log("Document Opened");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  async function summarizeDocumentClick(blockId, fileId, index) {
    console.log("this is blockId", blockId);
    console.log("this is fileId", fileId);

    setSummaryLoading(true);
    setSummaryData("");

    // Check if the clicked block is already expanded
    if (expandedBlock.blockId === blockId) {
      setExpandedBlock({ blockId: null, index: null }); // Collapse the expanded block
    } else {
      setExpandedBlock({ blockId: blockId, index: index }); // Set the clicked block as the expanded block

      const data = await getSummary(fileId);
      setSummaryData(data);
    }

    setSummaryLoading(false);
  }

  const getSummary = async (id) => {
    const selectedId = id;

    try {
      const response = await axios.get(
        `/api/chatbot/getSummary/?selectedId=${selectedId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const summary = await response.data.message;
      console.log("this is summary ", summary);
      return summary;
    } catch (err) {
      console.log(err);
      return "Error occured during summary. Please Try again.";
    }
  };

  useEffect(() => {
    scrollToBottom;
  }, [messages]);

  return (
    <>
      <div className="w-full">
        <div
          className={
            messages.length == 0 && !docId ? "w-full mb-0" : " w-full "
          }
        >
          {messages.length == 0 && !isGetChatLoading && !docId ? (
            <div className="flex justify-center items-center font-bold text-9xl mt-20 text-[#cccfef8c]">
              <FaRegComments />
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full">
              <div className="p-6"></div>
              <div className="border-t border-gray-300"></div>
              <div className="justify-center">
                {messages?.map((item, blockId) => {
                  let displayMessage = item.message;

                  return item.sender == "human" ? (
                    <div className="">
                      <div className="m-auto max-w-3xl p-5">
                        <div className="bg-white flex" key={blockId}>
                          <div className="bg-green-800 text-md w-7 h-7 aspect-1 rounded-full  text-white flex items-center justify-center">
                            {firstLetter}
                          </div>

                          <div className="ml-5">
                            <div className="text-black-800 truncate  font-bold">
                              You
                            </div>
                            {displayMessage}
                            <div>
                              <time className="text-xs opacity-50">
                                {formatDate(item.timestamp)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="">
                      <div className="m-auto max-w-3xl p-5">
                        <div className="flex" key={blockId}>
                          <div className="text-white">
                            <PiBrainDuotone className="text-3xl fill-current bg-blue-600 rounded-full p-1" />
                          </div>
                          <div className="ml-5 w-full">
                            <div className="text-black-800 truncate  font-bold">
                              CPAL
                            </div>
                            <div
                              style={{ whiteSpace: "pre-line" }}
                              dangerouslySetInnerHTML={{
                                __html: markdownToHtml(item.message),
                              }}
                            ></div>

                            {item.sender === "ai" &&
                            (item.source === "Document_QA_System" ||
                              item.source === "Document_Display") ? (
                              <div className="bg-white p-2 rounded-md my-2">
                                <div className="">
                                  {renderBasedOnSource(item.source)}
                                </div>
                                <div className="flex text-xs mt-2 items-center w-full">
                                  <table className="min-w-full divide-y divide-gray-200 outline outline-1 outline-gray-200 rounded-md">
                                    <thead>
                                      <tr>
                                        <th className="px-4 py-2">Filename</th>
                                        <th className="px-4 py-2 ">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.relevant_files &&
                                        item.relevant_files.map(
                                          (item, index) => (
                                            <React.Fragment key={index}>
                                              <tr key={index}>
                                                <td className="px-4 py-2">
                                                  {item.file_name}
                                                </td>
                                                <td className="flex px-4 py-2 items-center justify-center">
                                                  <button
                                                    onClick={() =>
                                                      downloadDocumentClick(
                                                        item.file_id
                                                      )
                                                    }
                                                    className="relative transform transition-transform hover:scale-105 active:scale-95 px-2"
                                                  >
                                                    <div className="relative group">
                                                      <PiDownloadSimpleDuotone />
                                                    </div>
                                                  </button>
                                                  <button
                                                    onClick={() =>
                                                      summarizeDocumentClick(
                                                        blockId,
                                                        item.file_id,
                                                        index
                                                      )
                                                    }
                                                    className="px-2"
                                                  >
                                                    <div className="relative group">
                                                      <PiQueueDuotone />
                                                    </div>
                                                  </button>
                                                </td>
                                              </tr>
                                              {expandedBlock.blockId ===
                                                blockId &&
                                                expandedBlock.index ===
                                                  index && (
                                                  <tr>
                                                    <td
                                                      colSpan="2"
                                                      className="px-4 py-2"
                                                    >
                                                      {/* Display the summary data here */}
                                                      {summaryData}
                                                    </td>
                                                  </tr>
                                                )}
                                            </React.Fragment>
                                          )
                                        )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : item.sender === "ai" &&
                              (item.source === "ChatGPT" ||
                                item.source === "Google_Search") ? (
                              <>
                                <div className="">
                                  {renderBasedOnSource(item.source)}
                                </div>

                                <div className="flex text-xs items-center">
                                  {(item.relevant_files &&
                                    item.relevant_files.length > 0) ||
                                  (item.relevant_files &&
                                    item.relevant_files.length > 0) ? (
                                    <span className="text-sm font-bold mr-2">
                                      Learn more:
                                    </span>
                                  ) : null}
                                  <div className="flex flex-wrap items-center">
                                    {item.relevant_files &&
                                      item.relevant_files.length > 0 &&
                                      item.relevant_files.map((data, index) => (
                                        <button
                                          key={index}
                                          className="relative transform transition-transform px-1 mr-1 max-w-[130px] "
                                          onClick={() => {
                                            getDownloadDocument(data.file_id);
                                          }}
                                        >
                                          <div className="relative group text-xs bg-blue-500 px-2 py-1 rounded-lg text-white truncate max-w-[130px] hover:max-w-full">
                                            {data.file_name}
                                          </div>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                            <div>
                              <time className="text-xs opacity-50">
                                {formatDate(item.timestamp)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className=" border-gray-300"></div>
              </div>
            </div>
          )}
          <div>
            {isSendChatLoading ? (
              <div className="">
                <div className="m-auto max-w-3xl">
                  <div className=" p-5 flex ">
                    <div className="text-white">
                      <PiBrainDuotone className="text-3xl fill-current bg-orange-600 rounded-full p-1" />
                    </div>
                    <div
                      className="chat-bubble chat-bubble-primary ml-5"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      <div>
                        <div className="max-width-[150px] mb-2">
                          {renderBasedOnResponseStatus(responseStatus)}
                        </div>
                      </div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: markdownToHtml(streamingResponse),
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="bottom-0"ref={messagesEndRef} />
      </div>
    </>
  );
}

export default ChatController;
