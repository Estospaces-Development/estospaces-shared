package middleware

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func newEncodingTestApp(reached *bool) *fiber.App {
	app := fiber.New()
	app.Use(RejectEncodedRequestBodies())
	handler := func(c *fiber.Ctx) error {
		*reached = true
		return c.SendString("ok")
	}
	app.Post("/", handler)
	app.Get("/", handler)
	return app
}

func TestRejectEncodedRequestBodies(t *testing.T) {
	tests := []struct {
		name      string
		method    string
		encodings []string // one request header line per entry
		want      int
	}{
		{name: "no header", method: http.MethodPost, want: http.StatusOK},
		{name: "identity", method: http.MethodPost, encodings: []string{"identity"}, want: http.StatusOK},
		{name: "identity mixed case and padding", method: http.MethodPost, encodings: []string{"  Identity "}, want: http.StatusOK},
		{name: "empty value", method: http.MethodPost, encodings: []string{""}, want: http.StatusOK},
		{name: "gzip", method: http.MethodPost, encodings: []string{"gzip"}, want: http.StatusUnsupportedMediaType},
		{name: "GZIP upper case", method: http.MethodPost, encodings: []string{"GZIP"}, want: http.StatusUnsupportedMediaType},
		{name: "br", method: http.MethodPost, encodings: []string{"br"}, want: http.StatusUnsupportedMediaType},
		{name: "deflate", method: http.MethodPost, encodings: []string{"deflate"}, want: http.StatusUnsupportedMediaType},
		{name: "unknown coding", method: http.MethodPost, encodings: []string{"zstd"}, want: http.StatusUnsupportedMediaType},
		{name: "list with identity last", method: http.MethodPost, encodings: []string{"gzip, identity"}, want: http.StatusUnsupportedMediaType},
		{name: "list with identity first", method: http.MethodPost, encodings: []string{"identity, gzip"}, want: http.StatusUnsupportedMediaType},
		{name: "identity then gzip header lines", method: http.MethodPost, encodings: []string{"identity", "gzip"}, want: http.StatusUnsupportedMediaType},
		{name: "gzip then identity header lines", method: http.MethodPost, encodings: []string{"gzip", "identity"}, want: http.StatusUnsupportedMediaType},
		{name: "GET without header", method: http.MethodGet, want: http.StatusOK},
		{name: "GET with identity", method: http.MethodGet, encodings: []string{"identity"}, want: http.StatusOK},
		{name: "GET with gzip is rejected too", method: http.MethodGet, encodings: []string{"gzip"}, want: http.StatusUnsupportedMediaType},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reached := false
			app := newEncodingTestApp(&reached)

			req := httptest.NewRequest(tt.method, "/", strings.NewReader(`{}`))
			for _, encoding := range tt.encodings {
				req.Header.Add("Content-Encoding", encoding)
			}

			resp, err := app.Test(req)
			if err != nil {
				t.Fatalf("exercise route: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.want {
				t.Fatalf("status = %d, want %d", resp.StatusCode, tt.want)
			}
			wantReached := tt.want == http.StatusOK
			if reached != wantReached {
				t.Fatalf("handler reached = %v, want %v", reached, wantReached)
			}
			if tt.want == http.StatusUnsupportedMediaType {
				var body map[string]any
				if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
					t.Fatalf("decode error body: %v", err)
				}
				if msg, _ := body["error"].(string); msg == "" {
					t.Fatalf("expected a non-empty error message, got %v", body)
				}
			}
		})
	}
}

// TestEncodedBodyIsInflatedWithoutMiddleware pins the behaviour the middleware exists for:
// Fiber inflates a small gzip body to its full size before any handler sees it, and the
// middleware stops that before the handler runs.
func TestEncodedBodyIsInflatedWithoutMiddleware(t *testing.T) {
	const inflatedSize = 4 << 20

	var compressed bytes.Buffer
	zw := gzip.NewWriter(&compressed)
	if _, err := zw.Write(make([]byte, inflatedSize)); err != nil {
		t.Fatalf("compress body: %v", err)
	}
	if err := zw.Close(); err != nil {
		t.Fatalf("close gzip writer: %v", err)
	}
	if compressed.Len() > 64<<10 {
		t.Fatalf("test body should compress well, got %d bytes", compressed.Len())
	}

	send := func(app *fiber.App) *http.Response {
		req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(compressed.Bytes()))
		req.Header.Set("Content-Encoding", "gzip")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("exercise route: %v", err)
		}
		return resp
	}

	t.Run("unprotected app inflates the body", func(t *testing.T) {
		inflated := 0
		app := fiber.New()
		app.Post("/", func(c *fiber.Ctx) error {
			inflated = len(c.Body())
			return c.SendStatus(http.StatusOK)
		})
		resp := send(app)
		defer resp.Body.Close()
		if inflated != inflatedSize {
			t.Fatalf("c.Body() returned %d bytes, want %d; Fiber no longer inflates, review this middleware", inflated, inflatedSize)
		}
	})

	t.Run("protected app never reads the body", func(t *testing.T) {
		touched := false
		app := fiber.New()
		app.Use(RejectEncodedRequestBodies())
		app.Post("/", func(c *fiber.Ctx) error {
			touched = true
			_ = c.Body()
			return c.SendStatus(http.StatusOK)
		})
		resp := send(app)
		defer resp.Body.Close()
		if _, err := io.Copy(io.Discard, resp.Body); err != nil {
			t.Fatalf("drain response: %v", err)
		}
		if resp.StatusCode != http.StatusUnsupportedMediaType {
			t.Fatalf("status = %d, want %d", resp.StatusCode, http.StatusUnsupportedMediaType)
		}
		if touched {
			t.Fatal("handler ran for a gzip body")
		}
	})
}
