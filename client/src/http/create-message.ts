interface CreateMessageRequest {
  roomId: string;
  message: string;
}

interface CreateMessageResponse {
  id: string;
}

export async function createMessage(payload: CreateMessageRequest) {
  const url = new URL(`/api/rooms/${payload.roomId}/messages`, import.meta.env.VITE_APP_API_URL);
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json() as CreateMessageResponse;

  return { messageId: data.id }
}