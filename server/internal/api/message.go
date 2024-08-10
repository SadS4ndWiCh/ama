package api

type MessageKind string
type Message struct {
	Kind   MessageKind `json:"kind"`
	Value  any         `json:"value"`
	RoomID string      `json:"-"`
}

const (
	MessageKindMessageCreated           MessageKind = "message_created"
	MessageKindMessageAnswered          MessageKind = "message_answered"
	MessageKindMessageReactionIncreased MessageKind = "message_reaction_increased"
	MessageKindMessageReactionDecreased MessageKind = "message_reaction_decreased"
)

type MessageMessageCreated struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

type MessageMessageAnswered struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

type MessageMessageReactionDecreased struct {
	ID    string `json:"id"`
	Count int64  `json:"count"`
}

type MessageMessageReactionIncreased struct {
	ID    string `json:"id"`
	Count int64  `json:"count"`
}
