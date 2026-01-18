window.cart = JSON.parse(localStorage.getItem("cart")) || {};

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cart:updated"));
}

let qty = 1;
// cart.js
window.cart = JSON.parse(localStorage.getItem("cart")) || {};

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}
window.saveCart = saveCart;


/* TAMBAH */
function addToCart(product) {
  if (cart[product.id]) {
    cart[product.id].qty += 1;
  } else {
    cart[product.id] = {
      ...product,
      qty: 1,
      checked: true
    };
  }
  saveCart();
  updateCartBadge();
  notifyCartUpdated(); 
}

/* UPDATE QTY */
function updateQty(id, delta) {
  cart[id].qty += delta;
  if (cart[id].qty < 1) cart[id].qty = 1;
  saveCart();
}

/* OPEN CART */
function openCart() {
  console.log("cart clicked");
  renderCart();
  document.getElementById("cartModal").classList.remove("hidden");
}


/* CHECK / UNCHECK */
function toggleItem(id, value) {
  cart[id].checked = true;
  saveCart();
}

/* TOTAL YANG DICENTANG */
function getCheckedTotal() {
  return Object.values(cart)
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.qty * item.price, 0);
}

/* BADGE */
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const total = Object.values(cart)
    .reduce((sum, item) => sum + item.qty, 0);

  badge.textContent = total;
  badge.classList.toggle("hidden", total === 0);
}

document.addEventListener("DOMContentLoaded", updateCartBadge);


function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart:updated"));
}
