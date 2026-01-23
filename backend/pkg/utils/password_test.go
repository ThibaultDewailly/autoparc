package utils

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	tests := []struct {
		name      string
		password  string
		wantError bool
	}{
		{
			name:      "valid password",
			password:  "securePassword123",
			wantError: false,
		},
		{
			name:      "empty password",
			password:  "",
			wantError: true,
		},
		{
			name:      "long password",
			password:  "thisIsAVeryLongPasswordThatShouldStillWorkFine123456789",
			wantError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hash, err := HashPassword(tt.password)
			
			if tt.wantError {
				if err == nil {
					t.Errorf("HashPassword() expected error, got nil")
				}
				return
			}

			if err != nil {
				t.Errorf("HashPassword() unexpected error: %v", err)
				return
			}

			if hash == "" {
				t.Errorf("HashPassword() returned empty hash")
			}

			if hash == tt.password {
				t.Errorf("HashPassword() returned unhashed password")
			}
		})
	}
}

func TestCheckPassword(t *testing.T) {
	password := "testPassword123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	tests := []struct {
		name     string
		hash     string
		password string
		want     bool
	}{
		{
			name:     "correct password",
			hash:     hash,
			password: password,
			want:     true,
		},
		{
			name:     "incorrect password",
			hash:     hash,
			password: "wrongPassword",
			want:     false,
		},
		{
			name:     "empty password",
			hash:     hash,
			password: "",
			want:     false,
		},
		{
			name:     "empty hash",
			hash:     "",
			password: password,
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CheckPassword(tt.hash, tt.password)
			if got != tt.want {
				t.Errorf("CheckPassword() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestHashPasswordConsistency(t *testing.T) {
	password := "testPassword"
	
	hash1, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	hash2, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	// Hashes should be different due to salt
	if hash1 == hash2 {
		t.Error("HashPassword() should produce different hashes for same password")
	}

	// But both should validate correctly
	if !CheckPassword(hash1, password) {
		t.Error("First hash should validate password")
	}

	if !CheckPassword(hash2, password) {
		t.Error("Second hash should validate password")
	}
}
