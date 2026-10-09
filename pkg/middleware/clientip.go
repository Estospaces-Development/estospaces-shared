package middleware

import (
	"os"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// ClientIP returns the caller address that per-client limits should key on.
//
// On Cloud Run the TCP peer is Google's front end, the same for every caller, so keying on it
// puts everyone in one bucket per instance. Google appends the connecting address to
// X-Forwarded-For, and the external load balancer appends its own address after that, so the
// real caller is the entry trustedHops from the right: 1 when Cloud Run is called directly, 2
// behind the load balancer. Entries further left are whatever the caller sent and are ignored.
// A header with fewer entries falls back to its leftmost one, and no header to the TCP peer.
func ClientIP(c *fiber.Ctx, trustedHops int) string {
	var entries []string
	for _, entry := range strings.Split(c.Get(fiber.HeaderXForwardedFor), ",") {
		if entry = strings.TrimSpace(entry); entry != "" {
			entries = append(entries, entry)
		}
	}
	if trustedHops < 1 {
		trustedHops = 1
	}
	switch {
	case len(entries) >= trustedHops:
		return entries[len(entries)-trustedHops]
	case len(entries) > 0:
		return entries[0]
	default:
		return c.Context().RemoteIP().String()
	}
}

// TrustedProxyHops is how many X-Forwarded-For entries Google appends in front of this service:
// TRUSTED_PROXY_HOPS when it is a positive number, otherwise 2 when ENV is prod or production
// (production only accepts traffic through the external load balancer) and 1 elsewhere.
func TrustedProxyHops() int {
	if hops, err := strconv.Atoi(strings.TrimSpace(os.Getenv("TRUSTED_PROXY_HOPS"))); err == nil && hops > 0 {
		return hops
	}
	switch strings.ToLower(strings.TrimSpace(os.Getenv("ENV"))) {
	case "prod", "production":
		return 2
	default:
		return 1
	}
}
