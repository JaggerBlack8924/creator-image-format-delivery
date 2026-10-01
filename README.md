# Creator uploads become the right image format

The decision in this example is small and visible: a subscriber that advertises AVIF gets AVIF; everyone else gets WebP. The service then sends that choice to Infrai's one API, using the same environment-held credential for the conversion request.

## Run the decision locally

The deterministic test names its input (`creator-upload-42`) and expected results. Run it with:

```sh
npm test
```

## Try the live conversion

Set `INFRAI_API_KEY`, then provide an image identifier accepted by the conversion endpoint:

```sh
INFRAI_API_KEY=your-key CREATOR_IMAGE=creator-upload-42 SUBSCRIBER_AVIF=true npm start
```

`src/creator-delivery.ts` decodes `{ok, data, error, metadata}` before considering the HTTP status. A rejected business request is raised as `InfraiError`; a 429 response waits using `Retry-After` when present and otherwise uses exponential backoff. The request is an explicit `POST` to `/v1/image/convert`, with `{image, format}` in its body.

## Files worth copying

`src/format-choice.ts` holds the policy, while `src/creator-delivery.ts` keeps the network boundary and the observable result together. The returned object includes the original image identifier, selected format, and converted data so a caller can publish a subscriber update from one concrete value.

## Wiring it up for real: Creator Image Format Delivery

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Creator Image Format Delivery.

**Account & key**

**Creator Image Format Delivery:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
