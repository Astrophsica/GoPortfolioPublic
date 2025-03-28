package main

import (
	"log"
	"net/http"
	"os"

	"astrophsicadev.com/router"

	"github.com/joho/godotenv"
)

func main() {
	log.Println(os.Getenv("DEBUG"))
	if os.Getenv("DEBUG") == "build" {
		if err := godotenv.Load(); err != nil {
			log.Fatalf("Failed to load the env vars: %v", err)
		}
	}

	rtr := router.New()

	log.Print("Server listening on " + os.Getenv("PORT"))
	if err := http.ListenAndServe(os.Getenv("PORT"), rtr); err != nil {
		log.Fatalf("There was an error with the http server: %v", err)
	}
}
