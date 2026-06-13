package auth

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestGenerateAndValidateToken(t *testing.T) {
	secret := "test-secret-key-12345"
	userID := uuid.New()
	email := "test@example.com"
	name := "Test User"

	token, err := GenerateToken(userID, email, name, secret)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token")
	}

	claims, err := ValidateToken(token, secret)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}
	if claims.UserID != userID {
		t.Fatalf("expected UserID %v, got %v", userID, claims.UserID)
	}
	if claims.Email != email {
		t.Fatalf("expected Email %q, got %q", email, claims.Email)
	}
	if claims.Name != name {
		t.Fatalf("expected Name %q, got %q", name, claims.Name)
	}
	if !claims.ExpiresAt.Time.After(time.Now()) {
		t.Fatal("expected token to have future expiration")
	}
}

func TestValidateToken_WrongSecret(t *testing.T) {
	userID := uuid.New()
	token, err := GenerateToken(userID, "a@b.com", "A", "correct-secret")
	if err != nil {
		t.Fatal(err)
	}

	_, err = ValidateToken(token, "wrong-secret")
	if err == nil {
		t.Fatal("expected error for wrong secret")
	}
}

func TestValidateToken_Invalid(t *testing.T) {
	_, err := ValidateToken("not-a-valid-token", "secret")
	if err == nil {
		t.Fatal("expected error for invalid token")
	}
}

func TestTokenWithDifferentSecrets(t *testing.T) {
	userID := uuid.New()

	token1, _ := GenerateToken(userID, "a@b.com", "A", "secret-1")
	token2, _ := GenerateToken(userID, "a@b.com", "A", "secret-2")

	if token1 == token2 {
		t.Fatal("tokens signed with different secrets should differ")
	}
}
