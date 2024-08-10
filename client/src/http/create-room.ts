interface CreateRoomRequest {
  theme: string;
}

interface CreateRoomResponse {
  id: string;
}

export async function createRoom(payload: CreateRoomRequest) {
  const url = new URL("/api/rooms", import.meta.env.VITE_APP_API_URL);
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json() as CreateRoomResponse;

  return { roomId: data.id }
}