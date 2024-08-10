import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { useParams } from "react-router-dom";
import { createMessageReaction } from "../http/create-message-reaction";
import { toast } from "sonner";
import { removeMessageReaction } from "../http/remove-message-reaction";

interface MessageProps {
  message: {
    id: string;
    text: string;
    amountOfReactions: number;
    answered?: boolean;
  }
}

export function Message(props: MessageProps) {
  const params = useParams<{ roomId: string }>();
  const [hasReacted, setHasReacted] = useState(false);

  if (!params.roomId) {
    throw new Error("Message component must be used within room page");
  }

  async function createMessageReactionAction() {
    if (!params.roomId) {
      return
    }

    try {
      await createMessageReaction({ roomId: params.roomId, messageId: props.message.id });
      setHasReacted(true);
    } catch (err) {
      toast.error("Falha ao reagir mensagem, tente novamente!");
    }
  }

  async function removeMessageReactionAction() {
    if (!params.roomId) {
      return
    }

    try {
      await removeMessageReaction({ roomId: params.roomId, messageId: props.message.id });
      setHasReacted(false);
    } catch (err) {
      toast.error("Falha ao remover reação, tente novamente!");
    }
  }

  return (
    <li
      data-answered={props.message.answered}
      className="ml-4 leading-relaxed text-zinc-100 data-[answered=true]:opacity-50 data-[answered=true]:pointer-events-none"
    >
      {props.message.text}

      { hasReacted ? (
        <button
          onClick={removeMessageReactionAction}
          className="flex items-center gap-2 mt-3 text-sm font-medium text-orange-400 hover:text-orange-500"
        >
          <ArrowUp className="size-4" />
          Curtir pergunta ({props.message.amountOfReactions})
        </button>
      ) : (
        <button
          onClick={createMessageReactionAction}
          className="flex items-center gap-2 mt-3 text-sm font-medium text-zinc-400 hover:text-zinc-300"
        >
          <ArrowUp className="size-4" />
          Curtir pergunta ({props.message.amountOfReactions})
        </button>
      )}
    </li>
  )
}