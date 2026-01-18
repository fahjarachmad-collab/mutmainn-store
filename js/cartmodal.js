window.openCartModal = openCartModal;

function openCartModal() {
   renderCart(); // ⬅️ INI KUNCINYA
  document.getElementById("cartModal").classList.remove("hidden");
}

const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const cartModal = document.getElementById("cartModal");
const closeCartBtn = document.getElementById("closeCart");

// CLOSE CART
closeCartBtn.addEventListener("click", () => cartModal.classList.add("hidden"));
cartModal.addEventListener("click", (e) => { if (e.target === cartModal) cartModal.classList.add("hidden"); });

// RENDER CART
function renderCart() {
  cartList.innerHTML = "";
  let total = 0;

  Object.values(cart).forEach(item => {
    if (!item.checked) item.checked = true;
    if (item.checked) total += item.price * item.qty;

    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <input type="checkbox" ${item.checked ? "checked" : ""}>
      <img src="${item.image}">
      <div class="info">
        <h4>${item.name}</h4>
        <p>${formatRupiah(item.price)}</p>
        <div class="qty">
          <button class="minus">−</button>
          <span>${item.qty}</span>
          <button class="plus">+</button>
        </div>
      </div>
      <div class="subtotal">
        ${formatRupiah(item.price * item.qty)}
        <div class="delete">🗑</div>
      </div>
    `;

    const checkbox = row.querySelector("input");
    const plusBtn = row.querySelector(".plus");
    const minusBtn = row.querySelector(".minus");
    const deleteBtn = row.querySelector(".delete");

    
    checkbox.onchange = (e) => { item.checked = e.target.checked; saveCart(); updateTotal(); };

    plusBtn.onclick = () => { item.qty++; saveCart(); renderCart(); };

    minusBtn.onclick = () => {
      if(item.qty === 1){
        confirmDelete(item.id);
      } else {
        item.qty--; saveCart(); renderCart(); notifyCartUpdated()
      }
    };

    deleteBtn.onclick = (e) => {
  e.stopPropagation();
  confirmDelete(item.id);
};

    cartList.appendChild(row);
  });

  cartTotal.innerText = formatRupiah(total);
}

function updateTotal() {
  cartTotal.innerText = formatRupiah(
    Object.values(cart).filter(i => i.checked).reduce((sum,i)=>sum + i.price * i.qty, 0)
  );
}

// CONFIRM DELETE SINGLE ITEM
function confirmDelete(id) {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  overlay.innerHTML = `
    <div class="confirm-box">
      <p>Hapus produk ini dari keranjang?</p>
      <button class="yes">Ya, hapus</button>
      <button class="no">Batal</button>
    </div>
  `;

  overlay.querySelector(".yes").onclick = () => {
    delete cart[id];
    saveCart();
    renderCart();
    updateCartBadge();
    notifyCartUpdated();
    overlay.remove();
  };

  overlay.querySelector(".no").onclick = () => overlay.remove();

  document.body.appendChild(overlay);
}


// CONFIRM DELETE ITEM
function confirmClearCart() {
  if (!Object.keys(cart).length) return;

  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  overlay.innerHTML = `
    <div class="confirm-box">
      <p>Hapus semua produk di keranjang?</p>
      <button class="yes">Ya, hapus semua</button>
      <button class="no">Batal</button>
    </div>
  `;

  overlay.querySelector(".yes").onclick = () => {
    Object.keys(cart).forEach(key => delete cart[key]);
    saveCart();
    renderCart();
    updateCartBadge();
    notifyCartUpdated();
    overlay.remove();
  };

  overlay.querySelector(".no").onclick = () => overlay.remove();

  document.body.appendChild(overlay);
}


// CLEAR ALL CART
// clear cart + close cart harus global
function clearCart() {
  confirmClearCart();

  }
window.clearCart = clearCart;


// CLEAR ALL CART

function closeCart() {
  document.getElementById("cartModal").classList.add("hidden");
}
window.closeCart = closeCart;


function checkoutCart() {
  const items = Object.values(cart)
    .filter(i => i.checked)
    .map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      image: i.image
    }));

     if (!items.length) {
    alert("Pilih produk dulu");
    return;
  }

 const order = {
  items: items,
  from: "cart",
  createdAt: Date.now()
};

  localStorage.setItem("order", JSON.stringify(order));
  window.location.href = "checkoutmodal.js";
}


function addToCartAndOpenCart() {
  if (!selectedProduct) return;

  addToCart({
    id: selectedProduct.id,
    name: selectedProduct.name,
    price: selectedProduct.price,
    qty,
    image: selectedProduct.image
  });

  closeModal();

  setTimeout(() => {
    if (typeof openCartModal === "function") {
      openCartModal();
    }
  }, 200);
}
