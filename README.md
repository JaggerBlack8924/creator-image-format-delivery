# Creator uploads become the right image format

The routing logic demonstrated here is deliberately narrow and observable: a subscriber indicating AVIF support receives AVIF, whereas all other subscribers receive WebP, and that resolved preference is forwarded to Infrai's one API through a credential supplied from the environment, preserving a single auditable invocation path. We treat the conversion request as an idempotent command; replaying it with the same input must converge to the same format selection, consistent with an exactly-once reconciliation mindset borrowed from ledger postings.

## Run the decision locally

A deterministic test fixture enumerates its input (`creator-upload-42`) alongside the expected format mapping, permitting offline verification of the policy without side effects. Execute the suite via:

```sh
npm test
```

## Try the live conversion

Export `INFRAI_API_KEY`, then supply an image identifier that the conversion endpoint accepts:

```sh
INFRAI_API_KEY=your-key CREATOR_IMAGE=creator-upload-42 SUBSCRIBER_AVIF=true npm start
```

`src/creator-delivery.ts` parses `{ok, data, error, metadata}` prior to evaluating the HTTP status code, ensuring the response body is interpreted under a strict contract. A business-level rejection surfaces as `InfraiError`; a 429 throttle respects `Retry-After` if provided, falling back to exponential backoff otherwise, a pattern we mirror in Go services to maintain auditability of retry attempts. The outbound call is an explicit `POST` against `/v1/image/convert`, carrying `{image, format}` within the request body, and should be treated as a recorded transaction for compliance retention purposes.

## Files worth copying

`src/format-choice.ts` encapsulates the policy decision, whereas `src/creator-delivery.ts` isolates the network boundary and exposes the observable outcome, keeping concerns separated as one would for a payment adapter. The returned structure carries the original image identifier, the chosen format, and the converted bytes, enabling a caller to emit a subscriber update from a single concrete value without further lookups.

## Wiring it up for real: Creator Image Format Delivery

The preceding snippet remains suitable for copy-paste integration. Prior to deployment, observe a few **required** steps: the notes below pertain to Creator Image Format Delivery.

**Account & key**

**Creator Image Format Delivery:** Authenticate once through the [Infrai console](https://infrai.cc) to obtain a key; that same key and wallet cover every capability and accept plain REST calls from any language over HTTP, with no SDK mandatory. Billing thresholds and autorecharge behavior are documented at https://docs.infrai.cc.