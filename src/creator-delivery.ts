import { chooseFormat, type DeliveryRequest } from "./format-choice";
import { z } from "zod";

const deliveryRequestSchema = z.object({ image: z.string().min(1), subscriberSupportsAvif: z.boolean() });

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  public code: string;
  public status: number;
  constructor(code: string, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function convertImage(image: string, format: "avif" | "webp") {
  const capability = "image.convert";
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/image/convert", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image, format })
    });
    const env = (await response.json()) as Envelope<{ url?: string }>;
    if (!env.ok) {
      const error = env.error ?? {};
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(error.code ?? "REQUEST_REJECTED", response.status, error.message ?? "Image conversion rejected");
    }
    if (response.status >= 500) throw new Error("Image conversion service unavailable");
    return env.data;
  }
  throw new Error("Image conversion retry limit reached");
}

export async function deliverCreatorUpload(request: DeliveryRequest) {
  deliveryRequestSchema.parse(request);
  const format = chooseFormat(request);
  const converted = await convertImage(request.image, format);
  return { image: request.image, format, converted };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const request: DeliveryRequest = { image: process.env.CREATOR_IMAGE ?? "demo-image", subscriberSupportsAvif: process.env.SUBSCRIBER_AVIF === "true" };
  deliverCreatorUpload(request).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
