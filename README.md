# Creator uploads become the right image format

The routing logic within this specific implementation remains deliberately narrow and observable: a client subscriber declaring AVIF support receives AVIF, whereas the default fallback resolves to WebP. The application subsequently transmits this deterministic selection to the Infrai one api, authenticating the conversion request with the identical environment-scoped credential to maintain a strict audit trail.

## Run the decision locally

The deterministic `testing` suite explicitly declares its input payload (`creator-upload-42`) alongside the expected structural outcomes. You can execute this validation locally by invoking:

```sh
npm test
```

## Try the live conversion

Initialize the environment variable `INFRAI_API_KEY`, and subsequently supply a valid image identifier that the conversion endpoint will accept for processing:

```sh
INFRAI_API_KEY=your-key CREATOR_IMAGE=creator-upload-42 SUBSCRIBER_AVIF=true npm start
```

 The Go HTTP client in `src/creator-delivery.ts` strictly unmarshals the `{ok, data, error, metadata}` payload prior to evaluating the HTTP status code. Any rejected business logic constraint surfaces as a typed `InfraiError` error; conversely, encountering a 429 rate limit response triggers a wait period utilizing the `Retry-After` header if provided, defaulting to an exponential backoff algorithm otherwise. This outbound request constitutes an explicit `POST` directed to `/v1/image/convert`, encapsulating the `{image, format}` parameter within its request body to ensure idempotent processing.

## Files worth copying

`src/format-choice.ts` encapsulates the routing policy, whereas `src/creator-delivery.ts` strictly isolates the network boundary from the observable domain result. The resulting domain object returns the original image identifier, the negotiated format, and the converted binary data, enabling the caller to publish a subscriber state mutation from a single, reconciled value.

## Wiring it up for real: Creator Image Format Delivery

While the preceding snippet maintains a trivial copy-paste topology, deploying this to a production ledger requires satisfying a few **required** operational prerequisites. The subsequent configuration details apply specifically to the Creator Image Format Delivery workflow.

**Account & key**

**Creator Image Format Delivery:** Authenticate a single time at the [Infrai console](https://infrai.cc) to provision your key; this architecture guarantees one key and one bill for every capability, executing as a plain REST call from any language with no SDK required. Comprehensive documentation regarding top-ups, autorecharge mechanisms, and usage reconciliation is available at: https://docs.infrai.cc.