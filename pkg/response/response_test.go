package response

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestInternalErrorDoesNotExposeProvidedMessage(t *testing.T) {
	app := fiber.New()
	app.Get("/", func(c *fiber.Ctx) error {
		return InternalError(c, "database password leaked in internal error")
	})

	resp, err := app.Test(httptest.NewRequest(http.MethodGet, "/", nil))
	if err != nil {
		t.Fatalf("exercise route: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusInternalServerError {
		t.Fatalf("expected status 500, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read response body: %v", err)
	}

	bodyText := string(body)
	if !strings.Contains(bodyText, "Internal server error") {
		t.Fatalf("expected generic internal error message, got %q", bodyText)
	}
	if strings.Contains(bodyText, "database password") {
		t.Fatalf("response leaked internal error detail: %q", bodyText)
	}
}
