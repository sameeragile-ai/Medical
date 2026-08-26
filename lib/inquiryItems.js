// Normalizes the multi-product `items` array sent from the inquiry form into
// a clean shape for storage, and derives the aggregate qty/value/product_name
// columns that the rest of the app (table sorting, exports) still reads.
export function normalizeItems(rawItems) {
  const items = Array.isArray(rawItems) ? rawItems : [];
  return items
    .filter((it) => it && it.productId)
    .map((it) => {
      const qty = Math.max(0, Number(it.qty) || 0);
      const price = Math.max(0, Number(it.price) || 0);
      return {
        productId: it.productId,
        productName: it.productName || "",
        qty,
        price,
        amount: qty * price,
      };
    });
}

export function itemsTotals(items) {
  const qty = items.reduce((sum, it) => sum + it.qty, 0);
  const value = items.reduce((sum, it) => sum + it.amount, 0);
  const productName = items.map((it) => it.productName).filter(Boolean).join(", ");
  const productId = items[0]?.productId || null;
  return { qty, value, productName, productId };
}
