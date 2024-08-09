import { useState } from "react";
import { ArrowUp } from "lucide-react";

interface MessageProps {
  text: string;
  amountOfReactions: number;
  answered?: boolean;
}

export function Message(props: MessageProps) {
  const [hasReacted, setHasReacted] = useState(false);

  function handleReactToMessage() {
    setHasReacted(true);
  }

  return (
    <li
      data-answered={props.answered}
      className="ml-4 leading-relaxed text-zinc-100 data-[answered=true]:opacity-50 data-[answered=true]:pointer-events-none"
    >
      {props.text}

      { hasReacted ? (
        <button
          className="flex items-center gap-2 mt-3 text-sm font-medium text-orange-400 hover:text-orange-500"
        >
          <ArrowUp className="size-4" />
          Curtir pergunta ({props.amountOfReactions})
        </button>
      ) : (
        <button
          onClick={handleReactToMessage}
          className="flex items-center gap-2 mt-3 text-sm font-medium text-zinc-400 hover:text-zinc-300"
        >
          <ArrowUp className="size-4" />
          Curtir pergunta ({props.amountOfReactions})
        </button>
      )}
    </li>
  )
}