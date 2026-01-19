// ambil slug dari URL
// contoh: /share.html?slug=kalender-planner-floral-a3-2026

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

// data produk (HARUS SAMA DENGAN DATA DI APP)
const products = window.products || [];

const product = products.find(p => p.slug === slug);

if (product) {
  document.title = product.name;

  document.querySelector('meta[property="og:title"]').setAttribute("content", product.name);
  document.querySelector('meta[property="og:description"]').setAttribute("content", product.description.slice(0, 120));
  document.querySelector('meta[property="og:image"]').setAttribute(
    "content",
    window.location.origin + "/" + product.image
  );

  // redirect ke homepage lalu buka modal
  setTimeout(() => {
    window.location.href = "/?open=" + product.slug;
  }, 800);
}
