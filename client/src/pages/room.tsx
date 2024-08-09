import { useParams } from "react-router-dom"
import { ArrowRight, Share2 } from "lucide-react";
import { toast } from "sonner";

import amaLogo from "../assets/ama-logo.svg"
import { Message } from "../components/message";

export function Room() {
  const params = useParams<{ roomId: string }>();

  function handleShareRoom() {
    const url = window.location.href.toString();
    
    if (navigator.share !== undefined && navigator.canShare()) {
      navigator.share({ url });
    }

    navigator.clipboard.writeText(url);
    toast.info("The room URL was copied to your clipboard");
  }

  return (
    <div className="flex flex-col gap-6 py-10 px-4 mx-auto max-w-[640px]">
      <header className="flex items-center gap-3 px-3">
        <img src={amaLogo} alt="AMA" className="h-5" />

        <span className="text-sm text-zinc-500 truncate">
          Código da sala: <span>{params.roomId}</span>
        </span>

        <button
          type="submit"
          onClick={handleShareRoom}
          className="flex items-center px-3 py-1.5 ml-auto gap-1.5 rounded-lg font-medium text-sm bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-900"
        >
          Compartilhar
          <Share2 className="size-4 text-zinc-300" />
        </button>
      </header>

      <div className="h-px w-full bg-zinc-900"></div>

      <form
        // action={handleCreateRoom}
        className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 ring-orange-400 ring-offset-2 ring-offset-zinc-950 focus-within:ring-1"
      >
        <input
          type="text"
          name="theme"
          placeholder="Qual a sua pergunta?"
          autoComplete="off"
          className="flex-1 mx-2 outline-none text-sm bg-transparent text-zinc-100 placeholder:text-zinc-500"
        />
        <button
          type="submit"
          className="flex items-center px-3 py-1.5 gap-1.5 rounded-lg font-medium text-sm bg-orange-400 text-orange-950 transition-colors hover:bg-orange-500"
        >
          Criar pergunta
          <ArrowRight className="size-4" />
        </button>
      </form>

      <main>
        <ol className="list-decimal list-outside px-3 space-y-8">
          <Message
            text="O que é GoLang e quais são suas principais vantagens em comparação com outras linguagens de programação como Python, Java ou C++?"
            amountOfReactions={162}
            answered
          />
          <Message
            text="Como funcionam as goroutines em GoLang e por que elas são importantes para a concorrência e paralelismo?"
            amountOfReactions={142}
          />
        </ol>
      </main>
  </div>
  )
}