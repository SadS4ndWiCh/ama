import { ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { createMessage } from "../http/create-message";
import { toast } from "sonner";

export function CreateMessageForm() {
  const params = useParams<{ roomId: string }>();

  if (!params.roomId) {
    throw new Error("CreateMessageForm component must be used within room page");
  }

  async function createMessageAction(data: FormData) {
    const message = data.get("message")?.toString();

    if (!message || !params.roomId) {
      return
    }

    try {
      await createMessage({ roomId: params.roomId, message });
    } catch (err) {
      toast.error("Falha ao enviar pergunta, tente novamente!")
    }
  }

  return (
    <form
      action={createMessageAction}
      className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 ring-orange-400 ring-offset-2 ring-offset-zinc-950 focus-within:ring-1"
    >
      <input
        type="text"
        name="message"
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
  )
}