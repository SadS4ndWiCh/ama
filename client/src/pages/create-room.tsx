import { ArrowRight } from "lucide-react"
import amaLogo from "../assets/ama-logo.svg"
import { useNavigate } from "react-router-dom"
import { createRoom } from "../http/create-room";
import { toast } from "sonner";

export function CreateRoom() {
  const navigate = useNavigate();

  async function handleCreateRoom(data: FormData) {
    const theme = data.get("theme")?.toString();
    if (!theme) {
      return
    }

    try {
      const room = await createRoom({ theme });
      navigate(`/room/${room.roomId}`);
    } catch (err) {
      toast.error("não foi possível criar a sala");
    }
  }

  return (
    <main className="flex items-center justify-center h-screen px-4">
      <div className="flex flex-col gap-6 max-w-[450px]">
        <img src={amaLogo} alt="AMA" className="h-10" />
        <p className="leading-relaxed text-zinc-300 text-center">
          Crie uma sala pública de AMA (Ask me anything) e priorize as perguntas
          mais importantes para a comunidade.
        </p>

        <form
          action={handleCreateRoom}
          className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 ring-orange-400 ring-offset-2 ring-offset-zinc-950 focus-within:ring-1"
        >
          <input
            type="text"
            name="theme"
            placeholder="Nome da sala"
            autoComplete="off"
            className="flex-1 mx-2 outline-none text-sm bg-transparent text-zinc-100 placeholder:text-zinc-500"
          />
          <button
            type="submit"
            className="flex items-center px-3 py-1.5 gap-1.5 rounded-lg font-medium text-sm bg-orange-400 text-orange-950 transition-colors hover:bg-orange-500"
          >
            Criar sala
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </main>
  )
}