package middleware

import (
	"bytes"

	"github.com/gofiber/fiber/v2"
)

var (
	contentEncodingHeader = []byte(fiber.HeaderContentEncoding)
	identityEncoding      = []byte("identity")
)

// RejectEncodedRequestBodies answers 415 Unsupported Media Type to any request that declares
// a Content-Encoding other than "identity".
//
// Fiber's c.Body() (and therefore c.BodyParser) transparently inflates gzip, deflate and br
// request bodies with no cap on the inflated size. BodyLimit only counts the compressed bytes,
// so a few MB of gzip can expand to gigabytes and exhaust the instance, even on public routes.
// Our web and mobile clients never compress request bodies, so refusing them closes the hole
// for every handler that reads the body.
//
// Every Content-Encoding header is inspected, not only the first: Fiber decodes with the last
// one, so checking c.Get (the first) would let "identity" followed by "gzip" through. The value
// is compared case-insensitively after trimming, and a comma list such as "gzip, identity"
// counts as encoded. The method is ignored: a GET that declares an encoding is rejected too.
//
// Register it before any middleware or handler that reads the request body.
func RejectEncodedRequestBodies() fiber.Handler {
	return func(c *fiber.Ctx) error {
		encoded := false
		c.Request().Header.VisitAll(func(key, value []byte) {
			if !bytes.EqualFold(key, contentEncodingHeader) {
				return
			}
			if v := bytes.TrimSpace(value); len(v) > 0 && !bytes.EqualFold(v, identityEncoding) {
				encoded = true
			}
		})
		if encoded {
			return c.Status(fiber.StatusUnsupportedMediaType).JSON(fiber.Map{"error": "Encoded request bodies are not supported"})
		}
		return c.Next()
	}
}
