package middleware

import (
	"io"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestClientIP(t *testing.T) {
	tests := []struct {
		name         string
		trustedHops  int
		forwardedFor string
		wantClientIP string
	}{
		// Direct Cloud Run (dev): Google appends the caller, so the last entry is trusted.
		{"direct without header uses the peer", 1, "", "0.0.0.0"},
		{"direct single entry", 1, "59.92.33.77", "59.92.33.77"},
		{"direct ignores caller-sent entries", 1, "198.51.100.12,59.92.33.77", "59.92.33.77"},
		{"direct tolerates spaces and empties", 1, " , 198.51.100.12 , 59.92.33.77 ,", "59.92.33.77"},
		{"direct IPv6", 1, "2409:40e6:463:ccff::1", "2409:40e6:463:ccff::1"},
		// Behind the load balancer (prod): caller, then the load balancer's own address.
		{"load balancer", 2, "59.92.33.77,8.232.252.146", "59.92.33.77"},
		{"load balancer ignores caller-sent entries", 2, "198.51.100.12,198.51.100.11,59.92.33.77,8.232.252.146", "59.92.33.77"},
		{"load balancer short header uses the leftmost", 2, "10.0.0.5", "10.0.0.5"},
		{"load balancer without header uses the peer", 2, "", "0.0.0.0"},
		{"zero hops is treated as one", 0, "198.51.100.12,59.92.33.77", "59.92.33.77"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			app := fiber.New()
			app.Get("/", func(c *fiber.Ctx) error {
				return c.SendString(ClientIP(c, tt.trustedHops))
			})
			req := httptest.NewRequest("GET", "/", nil)
			if tt.forwardedFor != "" {
				req.Header.Set(fiber.HeaderXForwardedFor, tt.forwardedFor)
			}
			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("request: %v", err)
			}
			body, _ := io.ReadAll(resp.Body)
			if got := string(body); got != tt.wantClientIP {
				t.Fatalf("ClientIP = %q, want %q", got, tt.wantClientIP)
			}
		})
	}
}

func TestTrustedProxyHops(t *testing.T) {
	tests := []struct {
		env, override string
		want          int
	}{
		{"prod", "", 2},
		{"Production", "", 2},
		{"dev", "", 1},
		{"", "", 1},
		{"staging", "", 1},
		{"dev", "3", 3},
		{"prod", "1", 1},
		{"prod", "0", 2},
		{"prod", "two", 2},
	}
	for _, tt := range tests {
		t.Setenv("ENV", tt.env)
		t.Setenv("TRUSTED_PROXY_HOPS", tt.override)
		if got := TrustedProxyHops(); got != tt.want {
			t.Fatalf("ENV=%q TRUSTED_PROXY_HOPS=%q: got %d, want %d", tt.env, tt.override, got, tt.want)
		}
	}
}
