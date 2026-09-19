export type DeliveryRequest = {
  image: string;
  subscriberSupportsAvif: boolean;
};

export function chooseFormat(request: DeliveryRequest): "avif" | "webp" {
  return request.subscriberSupportsAvif ? "avif" : "webp";
}
