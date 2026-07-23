export function getProductPriceOptions(product) {
  if (Array.isArray(product?.priceOptions) && product.priceOptions.length) {
    return product.priceOptions;
  }
  if (product?.price != null && product.price !== "") {
    return [{ label: "Standard", price: Number(product.price) }];
  }
  return [];
}

export function formatProductPriceDisplay(product, aedFormatter) {
  const opts = getProductPriceOptions(product);
  if (opts.length === 0) return "—";
  if (opts.length === 1) return aedFormatter.format(opts[0].price);
  const amounts = opts.map((o) => o.price);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  if (min === max) return aedFormatter.format(min);
  return `${aedFormatter.format(min)} – ${aedFormatter.format(max)}`;
}

export function formatProductPriceShort(product, aedFormatter) {
  const opts = getProductPriceOptions(product);
  if (opts.length === 0) return "—";
  if (opts.length === 1) return aedFormatter.format(opts[0].price);
  const min = Math.min(...opts.map((o) => o.price));
  return `From ${aedFormatter.format(min)}`;
}
