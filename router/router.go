package router

import (
	"net/http"
)

// New sets up our routes and returns a *http.ServeMux.
func New() *http.ServeMux {
	router := http.NewServeMux()

	// Handles static files (JS, CSS, Images)
	fs := http.FileServer(http.Dir("web/static"))
	router.Handle("/static/", http.StripPrefix("/static/", fs))

	// This route is always accessible.
	router.Handle("/", http.HandlerFunc(HandlePortfolio))
	router.Handle("/portfolio", http.HandlerFunc(HandlePortfolio))

	return router
}
