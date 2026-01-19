
/* ==== RENDER PRODUCTS ==== */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productGrid");

  renderProducts(products);

  function renderProducts(list) {
    grid.innerHTML = "";

    list.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      const hasDiscount = product.discount && product.discount > 0;

      card.innerHTML = `
        ${hasDiscount ? `<span class="discount-badge">${product.discount}% OFF</span>` : ""}
        <img src="${product.image}">
        <h4>${product.name}</h4>
        <p class="price">
          <span class="new">${formatRupiah(product.price)}</span>
        </p>
        <div class="add-btn">+</div>
      `;

      // ADD BTN
     card.querySelector(".add-btn").addEventListener("click", (e) => {
  e.stopPropagation();

  // posisi tombol +
  const rect = e.target.getBoundingClientRect();

  // panggil animasi PLUS
  showPlusEffect(
    rect.left + rect.width / 2,
    rect.top
  );

  // tambah ke cart
  addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    qty: 1,
    image: product.image
  });
  
   showToast();   
  // animasi cart (aman meski kosong)
  flyToCartAnimation();
});



      // OPEN MODAL
      card.addEventListener("click", () => {
        openProductModal(product);
      });

      grid.appendChild(card);
    });
  }
});

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(n);
}


renderProducts(products);

/* ==== MODAL PRODUCT ==== */


function addProduct(id) {
  selectedProduct = products.find(p => p.id === id);
  qty = 1;

  document.getElementById("modalImage").src = selectedProduct.image;
  document.getElementById("modalName").innerText = selectedProduct.name;
  document.getElementById("modalPrice").innerText = formatRupiah(selectedProduct.price);

  updateTotal();

  document.getElementById("productModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("productModal").classList.add("hidden");
}

function changeQty(amount) {
  qty += amount;
  if (qty < 1) qty = 1;
  document.getElementById("qtyValue").innerText = qty;
  updateTotal();
}

function updateTotal() {
  document.getElementById("qtyValue").innerText = qty;
  document.getElementById("modalTotal").innerText =
    formatRupiah(selectedProduct.price * qty);
}

function checkout() {
  const total = selectedProduct.price * qty;
  alert(
    `Checkout:\n${selectedProduct.name}\nQty: ${qty}\nTotal: ${formatRupiah(total)}`
  );
}



  // Update badge otomatis sudah ada di addToCart
