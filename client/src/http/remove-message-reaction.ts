interface RemoveMessageReactionRequest {
  roomId: string;
  messageId: string
}

export async function removeMessageReaction(payload: RemoveMessageReactionRequest) {
  const url = new URL(
    `/api/rooms/${payload.roomId}/messages/${payload.messageId}/react`,
    import.meta.env.VITE_APP_API_URL
  );
  await fetch(url, { method: "DELETE", body: JSON.stringify(payload) });
}