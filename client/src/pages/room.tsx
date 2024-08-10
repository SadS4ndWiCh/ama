import { Suspense } from "react";
import { useParams } from "react-router-dom"
import { Share2 } from "lucide-react";
import { toast } from "sonner";

import amaLogo from "../assets/ama-logo.svg"

import { Messages } from "../components/messages";
import { CreateMessageForm } from "../components/create-message-form";

export function Room() {
  const params = useParams<{ roomId: string }>();

  function handleShareRoom() {
    const url = window.location.href.toString();
    
    if (navigator.share !== undefined && navigator.canShare()) {
      navigator.share({ url });
    }

    navigator.clipboard.writeText(url);
    toast.info("O link da sala foi copiado para área de transferência");
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

      <CreateMessageForm />

      <main>
        <Suspense fallback={<p>loading...</p>}>
          <Messages />
        </Suspense>
      </main>
  </div>
  )
}