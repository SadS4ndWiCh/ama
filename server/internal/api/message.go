package api

type MessageKind string
type Message struct {
	Kind   MessageKind `json:"king"`
	Value  any         `json:"value"`
	RoomID string      `json:"-"`
}

const (
	MessageKindMessageCreated MessageKind = "message_created"
)

type MessageMessageCreated struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}
