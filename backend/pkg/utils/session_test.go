package utils

import (
	"testing"
)

func TestGenerateSessionToken(t *testing.T) {
	// Test token generation
	token1, err := GenerateSessionToken()
	if err != nil {
		t.Fatalf("GenerateSessionToken() error = %v", err)
	}

	if token1 == "" {
		t.Error("GenerateSessionToken() returned empty token")
	}

	// Test uniqueness
	token2, err := GenerateSessionToken()
	if err != nil {
		t.Fatalf("GenerateSessionToken() error = %v", err)
	}

	if token1 == token2 {
		t.Error("GenerateSessionToken() should generate unique tokens")
	}

	// Test minimum length (32 bytes base64 encoded should be at least 40 chars)
	if len(token1) < 40 {
		t.Errorf("GenerateSessionToken() token too short: %d characters", len(token1))
	}
}

func TestGenerateSessionTokenMultiple(t *testing.T) {
	tokens := make(map[string]bool)
	iterations := 100

	for i := 0; i < iterations; i++ {
		token, err := GenerateSessionToken()
		if err != nil {
			t.Fatalf("GenerateSessionToken() error = %v on iteration %d", err, i)
		}

		if tokens[token] {
			t.Errorf("GenerateSessionToken() generated duplicate token: %s", token)
		}

		tokens[token] = true
	}

	if len(tokens) != iterations {
		t.Errorf("Expected %d unique tokens, got %d", iterations, len(tokens))
	}
}
