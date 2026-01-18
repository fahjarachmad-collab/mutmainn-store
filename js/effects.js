function showPlusEffect(x, y) {
  console.log("PLUS EFFECT DIPANGGIL", x, y);

  const plus = document.createElement("div");
  plus.className = "floating-plus";
  plus.textContent = "+";

  plus.style.left = `${x}px`;
  plus.style.top = `${y}px`;

  document.querySelector(".app").appendChild(plus);

  setTimeout(() => plus.remove(), 600);
}

function flyToCartAnimation() {
  // nanti
}


function showToast(message = "Produk ditambahkan ke cart") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 250);
  }, 700);
}
