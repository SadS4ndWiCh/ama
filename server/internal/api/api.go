package api

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"sync"

	"github.com/SadS4ndWiCh/ama/internal/store/pgstore"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5"
)

type apiHandler struct {
	query       *pgstore.Queries
	router      *chi.Mux
	upgrader    websocket.Upgrader
	subscribers map[string]map[*websocket.Conn]context.CancelFunc
	mu          *sync.Mutex
}

func (h apiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.router.ServeHTTP(w, r)
}

func NewHandler(query *pgstore.Queries) http.Handler {
	handler := apiHandler{
		query: query,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		subscribers: make(map[string]map[*websocket.Conn]context.CancelFunc),
		mu:          &sync.Mutex{},
	}

	router := chi.NewRouter()
	router.Use(middleware.RequestID, middleware.Recoverer, middleware.Logger)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	router.Get("/subscribe/{room_id}", handler.handleSubscribe)

	router.Route("/api", func(r chi.Router) {
		r.Route("/rooms", func(r chi.Router) {
			r.Post("/", handler.handleCreateRoom)
			r.Get("/", handler.handleGetRooms)

			r.Route("/{room_id}/messages", func(r chi.Router) {
				r.Get("/", handler.handleGetRoomMessages)
				r.Post("/", handler.handleCreateRoomMessage)

				r.Route("/{message_id}", func(r chi.Router) {
					r.Get("/", handler.handleGetRoomMessage)
					r.Patch("/react", handler.handleReactToMessage)
					r.Delete("/react", handler.handleRemoveReactFromMessage)
					r.Patch("/answer", handler.handleMarkMessageAsAnswered)
				})
			})
		})
	})

	handler.router = router

	return handler
}

func (h apiHandler) notifyClients(msg Message) {
	h.mu.Lock()
	defer h.mu.Unlock()

	subscribers, ok := h.subscribers[msg.RoomID]
	if !ok || len(subscribers) == 0 {
		return
	}

	for conn, cancel := range subscribers {
		if err := conn.WriteJSON(msg); err != nil {
			slog.Error("failed to send message to client", "error", err)
			cancel()
		}
	}
}

func (h apiHandler) handleSubscribe(w http.ResponseWriter, r *http.Request) {
	rawRoomId := chi.URLParam(r, "room_id")
	roomId, err := uuid.Parse(rawRoomId)
	if err != nil {
		http.Error(w, "invalid room id", http.StatusBadRequest)
		return
	}

	if _, err := h.query.GetRoom(r.Context(), roomId); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "room not found", http.StatusBadRequest)
			return
		}

		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}

	c, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Warn("failed to upgrade connection", "error", err)
		http.Error(w, "failed to upgrade to ws connection", http.StatusBadRequest)
		return
	}
	defer c.Close()

	ctx, cancel := context.WithCancel(r.Context())

	h.mu.Lock()
	if _, ok := h.subscribers[rawRoomId]; !ok {
		h.subscribers[rawRoomId] = make(map[*websocket.Conn]context.CancelFunc)
	}
	slog.Info("new client connected", "room_id", roomId, "client_ip", r.RemoteAddr)
	h.subscribers[rawRoomId][c] = cancel
	h.mu.Unlock()

	<-ctx.Done()

	h.mu.Lock()
	delete(h.subscribers[rawRoomId], c)
	h.mu.Unlock()
}

func (h apiHandler) handleCreateRoom(w http.ResponseWriter, r *http.Request) {
	type _body struct {
		Theme string `json:"theme"`
	}

	var body _body
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	roomID, err := h.query.InsertRoom(r.Context(), body.Theme)
	if err != nil {
		slog.Error("failed to insert room", "error", err)
		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID string `json:"id"`
	}

	if err := WriteJSON(w, response{ID: roomID.String()}); err != nil {
		switch err.(type) {
		case *json.MarshalerError:
			slog.Error("failed to marshal json", "error", err)
		default:
			slog.Error("failed to send json to client", "error", err)
		}

		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}
}

func (h apiHandler) handleGetRooms(w http.ResponseWriter, r *http.Request) {
	rooms, err := h.query.GetRooms(r.Context())
	if err != nil {
		slog.Error("failed to get all rooms", "error", err)
		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		Rooms []pgstore.Room `json:"rooms"`
	}

	if err := WriteJSON(w, response{Rooms: rooms}); err != nil {
		switch err.(type) {
		case *json.MarshalerError:
			slog.Error("failed to marshal json", "error", err)
		default:
			slog.Error("failed to send json to client", "error", err)
		}

		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}
}

func (h apiHandler) handleGetRoomMessages(w http.ResponseWriter, r *http.Request) {

}

func (h apiHandler) handleCreateRoomMessage(w http.ResponseWriter, r *http.Request) {
	rawRoomId := chi.URLParam(r, "room_id")
	roomId, err := uuid.Parse(rawRoomId)
	if err != nil {
		http.Error(w, "invalid room id", http.StatusBadRequest)
		return
	}

	if _, err := h.query.GetRoom(r.Context(), roomId); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "room not found", http.StatusBadRequest)
			return
		}

		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}

	type _body struct {
		Message string `json:"message"`
	}

	var body _body
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	messageID, err := h.query.InsertMessage(r.Context(), pgstore.InsertMessageParams{
		RoomID: roomId, Message: body.Message,
	})
	if err != nil {
		slog.Error("failed to insert message", "error", err)
		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}

	type response struct {
		ID string `json:"id"`
	}

	if err := WriteJSON(w, response{ID: messageID.String()}); err != nil {
		switch err.(type) {
		case *json.MarshalerError:
			slog.Error("failed to marshal json", "error", err)
		default:
			slog.Error("failed to send json to client", "error", err)
		}

		http.Error(w, "something went wrong", http.StatusInternalServerError)
		return
	}

	go h.notifyClients(Message{
		Kind:   MessageKindMessageCreated,
		RoomID: rawRoomId,
		Value: MessageMessageCreated{
			ID:      messageID.String(),
			Message: body.Message,
		},
	})
}

func (h apiHandler) handleGetRoomMessage(w http.ResponseWriter, r *http.Request) {

}

func (h apiHandler) handleReactToMessage(w http.ResponseWriter, r *http.Request) {

}

func (h apiHandler) handleRemoveReactFromMessage(w http.ResponseWriter, r *http.Request) {

}

func (h apiHandler) handleMarkMessageAsAnswered(w http.ResponseWriter, r *http.Request) {

}
