let selectedProduct = null;

/* ================= OPEN MODAL ================= */
function openProductModal(product) {
  selectedProduct = product;
  qty = 1;

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
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(link)
      .then(() => alert("Link berhasil disalin"))
      .catch(() => fallbackCopy(link));
  } else {
    fallbackCopy(link);
  }
}

function fallbackCopy(link) {
  const tempInput = document.createElement("input");
  tempInput.value = link;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  alert("Link berhasil disalin");
}

