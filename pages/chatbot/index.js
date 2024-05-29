import Controller from "../../components/chatbot/controller";
import { useState } from "react";
import withLayout from "../../components/layouts/withLayout";
import Link from "next/link";
import {
  PiUserDuotone,
  PiBrainDuotone,
  PiArrowDown,
  PiFolderUserDuotone,
  PiGlobeSimpleDuotone,
} from "react-icons/pi";
import { useRouter } from "next/router";
import useChatInfoStore from "../../stores/chatStore";

function Chat() {
  const setChatArray = useChatInfoStore((state) => state.setChatArray);
  const router = useRouter(); // Get the router object

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center">
      <Controller/>
    </div>
  );
}

export default withLayout(Chat, "chatbot");
