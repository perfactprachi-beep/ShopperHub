export function calcFinalPrice(basePrice, discountPct) {
  return basePrice - (basePrice * (discountPct / 100));
}
