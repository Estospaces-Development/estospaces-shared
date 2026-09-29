package entitlementpermit

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestVerifyAcceptsSignedCurrentPermit(t *testing.T) {
	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	now := time.Date(2026, time.September, 19, 12, 0, 0, 0, time.UTC)
	propertyLimit := 2
	claims := Claims{PermitID: uuid.NewString(), KeyID: "payment-key-1", ManagerID: uuid.NewString(), Mode: "test", CallerService: "core-service", Action: ActionPublishProperty, IdempotencyKey: "publish-1", AuthorityVersion: "free:1", ResourceKey: "property-1", PublishedPropertyLimit: ResourceLimit{Kind: "finite", Value: &propertyLimit}, ActiveCaseLimit: ResourceLimit{Kind: "finite", Value: &propertyLimit}, IssuedAt: now.Add(-time.Second), ExpiresAt: now.Add(-time.Second + Lifetime)}
	payload, err := json.Marshal(claims)
	if err != nil {
		t.Fatal(err)
	}
	token := base64.RawURLEncoding.EncodeToString(payload) + "." + base64.RawURLEncoding.EncodeToString(ed25519.Sign(privateKey, payload))
	got, err := Verify(token, base64.RawStdEncoding.EncodeToString(publicKey), now)
	if err != nil || got.PermitID != claims.PermitID || got.PublishedPropertyLimit.Value == nil || got.ActiveCaseLimit.Value == nil || *got.PublishedPropertyLimit.Value != 2 || *got.ActiveCaseLimit.Value != 2 {
		t.Fatalf("claims=%+v err=%v", got, err)
	}
}
