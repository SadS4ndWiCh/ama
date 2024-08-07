package api

import (
	"net/http"

	"github.com/SadS4ndWiCh/ama/internal/store/pgstore"
	"github.com/go-chi/chi/v5"
)

type apiHandler struct {
	query  *pgstore.Queries
	router *chi.Mux
}

func (h apiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.router.ServeHTTP(w, r)
}

func NewHandler(query *pgstore.Queries) http.Handler {
	handler := apiHandler{query: query}

	router := chi.NewRouter()
	handler.router = router

	return handler
}
