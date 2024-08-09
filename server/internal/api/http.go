package api

import (
	"encoding/json"
	"net/http"
)

func WriteJSON(w http.ResponseWriter, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	w.Header().Set("content-type", "application/json")

	if _, err := w.Write(data); err != nil {
		return err
	}

	return nil
}
