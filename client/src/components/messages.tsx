import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { Message } from "./message";

import { getRoomMessages } from "../http/get-room-messages";
import { useMessageWebsocket } from "../hooks/use-messages-websocket";

export function Messages() {
  const params = useParams<{ roomId: string }>();

  if (!params.roomId) {
    throw new Error("messages components must be used within room page");
  }

  const messagesQuery = useSuspenseQuery({
    queryKey: ["messages", params.roomId],
    queryFn: () => getRoomMessages({ roomId: params.roomId! })
  });

  useMessageWebsocket({ roomId: params.roomId });

  const sortedMessages = messagesQuery.data.messages.sort((a, b) => b.amountOfReactions - a.amountOfReactions);

  return (
    <ol className="list-decimal list-outside px-3 space-y-8">
      { sortedMessages.map(message => (
        <Message
          key={message.id}
          message={message}
        />
      )) }
    </ol>
  )
}