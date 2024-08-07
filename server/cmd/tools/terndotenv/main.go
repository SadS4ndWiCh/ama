package main

import (
	"os"
	"os/exec"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}

	cmd := exec.Command(
		"tern",
		"migrate",
		"--migrations",
		"./internal/store/pgstore/migrations",
		"--config",
		"./internal/store/pgstore/migrations/tern.conf",
	)

	// The "exec.Command" not inherit env vars from "godotenv.Load" automaticly
	cmd.Env = os.Environ()

	if err := cmd.Run(); err != nil {
		panic(err)
	}
}
