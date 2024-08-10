interface CreateMessageReactionRequest {
  roomId: string;
  messageId: string
}

export async function createMessageReaction(payload: CreateMessageReactionRequest) {
  const url = new URL(
    `/api/rooms/${payload.roomId}/messages/${payload.messageId}/react`,
    import.meta.env.VITE_APP_API_URL
  );
  await fetch(url, { method: "PATCH", body: JSON.stringify(payload) });
}