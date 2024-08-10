interface GetRoomMessagesRequest {
  roomId: string;
}

export interface GetRoomMessagesResponse {
  messages: {
    id: string;
    text: string;
    amountOfReactions: number;
    answered: boolean;
  }[];
}

interface Message {
  ID: string;
  RoomId: string;
  Message: string;
  ReactionCount: number;
  Answered: boolean;
}

export async function getRoomMessages(payload: GetRoomMessagesRequest): Promise<GetRoomMessagesResponse> {
  const url = new URL(`/api/rooms/${payload.roomId}/messages`, import.meta.env.VITE_APP_API_URL);
  const res = await fetch(url);

  const data = await res.json() as Message[] ?? [];

  return {
    messages: data.map(message => ({
      id: message.ID,
      text: message.Message,
      amountOfReactions: message.ReactionCount,
      answered: message.Answered,
    }))
  }
}