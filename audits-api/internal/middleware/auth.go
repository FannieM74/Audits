package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/fanniem74/audits-api/internal/auth"
)

type contextKey string

const UserClaimsKey contextKey = "user_claims"

func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			hdr := r.Header.Get("Authorization")
			if hdr == "" || !strings.HasPrefix(hdr, "Bearer ") {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}
			tokenStr := strings.TrimPrefix(hdr, "Bearer ")
			claims, err := auth.ValidateToken(tokenStr, jwtSecret)
			if err != nil {
				http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
				return
			}
			ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetClaims(r *http.Request) *auth.Claims {
	claims, _ := r.Context().Value(UserClaimsKey).(*auth.Claims)
	return claims
}
