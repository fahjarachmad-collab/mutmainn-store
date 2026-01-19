let selectedProduct = null;

/* ================= OPEN MODAL ================= */
function openProductModal(product) {
  selectedProduct = product;
  qty = 1;

   // update URL
  const url = new URL(window.location);
  url.searchParams.set("product", product.id);
  window.history.pushState({}, "", url);

 

  document.getElementById("modalImage").src = product.image;
  document.getElementById("modalName").textContent = product.name;
  document.getElementById("modalPrice").textContent =
    formatRupiah(product.price);

  document.getElementById("modalDescription").textContent =
    product.description || "";

  document.getElementById("modalVariant").textContent =
    product.variants ? product.variants.join(", ") : "";

  document.getElementById("modalSize").textContent =
    product.size || "";

  document.getElementById("qtyValue").textContent = qty;
  updateSubtotal();

  document.getElementById("productModal").classList.remove("hidden");
}

/* ================= CLOSE ================= */
function closeModal() {
  document.getElementById("productModal").classList.add("hidden");
  modal.classList.remove("show");
  const url = new URL(window.location);
  url.searchParams.delete("product");
  window.history.pushState({}, "", url);
}

/* ================= QTY ================= */
function changeQty(n) {
  qty = Math.max(1, qty + n);
  document.getElementById("qtyValue").textContent = qty;
  updateSubtotal();
}

/* ================= SUBTOTAL ================= */
function updateSubtotal() {
  if (!selectedProduct) return;

  document.getElementById("modalTotal").textContent =
    formatRupiah(selectedProduct.price * qty);
}

/* ================= FORMAT ================= */
function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(n);
}

/* ================= BIND BUTTON (AMAN) ================= */
document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    if (!selectedProduct) return;

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      qty,
      image: selectedProduct.image
    });

    closeModal();
    openCartModal();
  });
});


function copyProductLink(link) {
  // fallback aman
  const tempInput = document.createElement("input");
  tempInput.value = link;
  document.body.appendChild(tempInput);
  tempInput.select();
  tempInput.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  showCopyToast("Link produk berhasil disalin");
}

function showCopyToast(text) {
  const toast = document.createElement("div");
  toast.className = "copy-toast";
  toast.innerText = text;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 1200);
}


window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("product");

  if (productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      openProductModal(product);
    }
  }
});
