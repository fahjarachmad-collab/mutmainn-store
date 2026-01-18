let currentOrderID = null;


function generateOrderID() {
  const now = new Date();

  const date =
    now.getFullYear().toString().slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const time =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const rand = Math.floor(100 + Math.random() * 900);

  return `ORD-${date}-${time}-${rand}`;
}


let shippingCost = 0;
let itemTotal = 0;


function getCheckedItems() {
  const items = Object.values(window.cart || {});
  return items.some(i => i.checked)
    ? items.filter(i => i.checked)
    : items;
}

function getOrder() {
  return JSON.parse(localStorage.getItem("order")) || { items: [] };
}

/* OPEN / CLOSE */


function closeCheckout() {
  document.getElementById("checkoutModal").classList.add("hidden");
}

/* RENDER ORDER */
function renderOrder() {
  const items = getCheckedItems();
  const box = document.getElementById("checkoutItems");
  box.innerHTML = "";

// ⛔ JIKA CART KOSONG
  if (!items.length) {
    document.getElementById("totalOrder").innerText = "Rp 0";
    closeCheckout();
    return;
  }

  itemTotal = 0;

  items.forEach(item => {
    const subtotal = item.price * item.qty;
    itemTotal += subtotal;

    box.innerHTML += `
      <div class="checkout-item">
        <b>${item.name}</b><br>
        ${item.qty} × Rp ${item.price.toLocaleString("id-ID")} =
        <b>Rp ${subtotal.toLocaleString("id-ID")}</b>
      </div>
    `;
  });

  document.getElementById("totalOrder").innerText =
    "Rp " + itemTotal.toLocaleString("id-ID");
}



function syncGrandTotalBottom() {
  if (!shippingCost) return;

  const el = document.getElementById("grandTotalBottomValue");
  if (!el) return;

  el.innerText =
    "Rp " + (itemTotal + shippingCost).toLocaleString("id-ID");

  document.getElementById("grandTotalBottom")
    .classList.remove("hidden");
}


/* UNLOCK PAYMENT */

function unlockPaymentSection() {
  calculateShipping();

  const section = document.getElementById("paymentSection");
  section.classList.remove("locked");
  section.classList.add("active");
  startTimer(3600);
}


/* PAYMENT */
function selectPayment() {
  document.getElementById("qrisBox").classList.add("hidden");
  document.getElementById("bankBox").classList.add("hidden");

  const val = document.querySelector('input[name="payment"]:checked').value;
  if (val === "qris") document.getElementById("qrisBox").classList.remove("hidden");
  if (val === "bca") document.getElementById("bankBox").classList.remove("hidden");
}

/* TIMER */
function startTimer(sec) {
  const el = document.getElementById("paymentTimer");
  setInterval(() => {
    sec--;
    el.innerText = `${Math.floor(sec/60)}:${(sec%60).toString().padStart(2,'0')}`;
  }, 1000);
}

/* VALIDASI */
function checkSubmitReady() {
  document.getElementById("submitOrderBtn").disabled = false;
  document.getElementById("successText").classList.remove("hidden");
}




document.getElementById("buyerAddress").addEventListener("input", () => {
  calculateShipping();
});


/* ===============================
   MAP + ONGKIR SYSTEM (GRATIS)
================================ */

const ORIGIN = {
  lat: -6.1507, // Rajeg Tangerang
  lng: 106.5080
};

let map, marker, selectedLatLng = null;

/* INIT MAP */
function initMap() {
  map = L.map("map").setView([ORIGIN.lat, ORIGIN.lng], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  marker = L.marker([ORIGIN.lat, ORIGIN.lng], {
    draggable: true
  }).addTo(map);

  marker.on("dragend", async () => {
    selectedLatLng = marker.getLatLng();
    await reverseGeocode(selectedLatLng);
    calculateShipping();
  });
}

/* AUTOCOMPLETE ALAMAT */
document.getElementById("buyerAddress").addEventListener("input", async e => {
  const q = e.target.value;
  if (q.length < 4) return;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
  );
  const data = await res.json();

  if (!data[0]) return;

  selectedLatLng = {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };

  marker.setLatLng(selectedLatLng);
  map.setView(selectedLatLng, 14);
  calculateShipping();
});

/* PIN → ALAMAT */
async function reverseGeocode(latlng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
  );
  const data = await res.json();
  if (data.display_name) {
    document.getElementById("buyerAddress").value = data.display_name;
  }
}

/* HITUNG JARAK (KM) */
function haversine(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) *
    Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/* ONGKIR */
function calculateShipping() {
  if (!selectedLatLng) return;

  const distance = haversine(ORIGIN, selectedLatLng);

  const items = getCheckedItems();
  itemTotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const totalWeight = items.reduce((s, i) => s + i.qty * 0.25, 0);

  let base = totalWeight <= 0.5 ? 15000 : totalWeight <= 2 ? 20000 : 30000;
  let distanceFee = distance < 10 ? 0 : distance < 30 ? 5000 : 10000;

  shippingCost = base + distanceFee;

  document.getElementById("shippingCost").innerText =
    "Rp " + shippingCost.toLocaleString("id-ID");

  document.getElementById("grandTotal").innerText =
    "Rp " + (itemTotal + shippingCost).toLocaleString("id-ID");

  document.getElementById("grandTotalBottomValue").innerText =
    "Rp " + (itemTotal + shippingCost).toLocaleString("id-ID");

  document.getElementById("shippingRow").style.display = "flex";
  document.getElementById("grandTotalRow").style.display = "flex";
  document.getElementById("grandTotalBottom").classList.remove("hidden");
}

/* HOOK KE CHECKOUT */
function openCheckout() {
  const items = getCheckedItems();

  

  // ✅ selalu generate ID baru saat buka checkout
  currentOrderID = generateOrderID();
  document.getElementById("orderIDText").innerText = currentOrderID;

  renderOrder();

  document.getElementById("checkoutModal")
    .classList.remove("hidden");

  setTimeout(() => {
    if (!map) initMap();
  }, 100);
}

function resetCheckoutState() {
  shippingCost = 0;
  itemTotal = 0;
  currentOrderID = null;

  document.getElementById("checkoutItems").innerHTML = "";
  document.getElementById("totalOrder").innerText = "Rp 0";
  document.getElementById("shippingCost").innerText = "Rp 0";
  document.getElementById("grandTotal").innerText = "Rp 0";
  document.getElementById("grandTotalBottomValue").innerText = "Rp 0";

  document.getElementById("shippingRow").style.display = "none";
  document.getElementById("grandTotalRow").style.display = "none";
  document.getElementById("grandTotalBottom").classList.add("hidden");

  document.getElementById("checkoutModal")
    .classList.add("hidden");
}



window.addEventListener("cart:updated", () => {
  const items = getCheckedItems();

  if (!items.length) {
    resetCheckoutState();
    return;
  }

  // kalau checkout sedang terbuka → update
  if (!document.getElementById("checkoutModal").classList.contains("hidden")) {
    renderOrder();
    calculateShipping();
  }
});

//submit order//

function submitOrder() {
  const orderID = currentOrderID;


  const name = document.getElementById("buyerName")?.value || "-";
  const wa = document.getElementById("buyerWA")?.value || "-";
  const address = document.getElementById("buyerAddress")?.value || "-";

  const items = getCheckedItems();
  if (!items.length) {
    alert("Keranjang masih kosong");
    return;
  }

  let message = `*ORDER ID : ${orderID}*\n\n`;
  message += `Halo, saya ingin konfirmasi pesanan 👋\n\n`;
  message += `Nama : ${name}\n`;
  message += `WA : ${wa}\n`;
  message += `Alamat : ${address}\n\n`;
  message += `Pesanan:\n`;

  items.forEach(i => {
    message += `- ${i.name} (${i.qty} x Rp ${i.price.toLocaleString("id-ID")})\n`;
  });

  message += `\nSubtotal : Rp ${itemTotal.toLocaleString("id-ID")}`;
  message += `\nOngkir : Rp ${shippingCost.toLocaleString("id-ID")}`;
  message += `\nTOTAL : Rp ${(itemTotal + shippingCost).toLocaleString("id-ID")}`;

  const waUrl =
    "https://wa.me/6285183391144?text=" +
    encodeURIComponent(message);

localStorage.setItem("lastOrderID", orderID);
currentOrderID = null;

  window.open(waUrl, "_blank");
}

//download PDF//

function downloadReceiptPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF engine belum siap. Mohon refresh halaman.");
    return;
  }

  if (!currentOrderID) {
    alert("Order belum tersedia");
    return;
  }

  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF();


  const storeName = "MUTMAINN STORE";
  const storeTagline = "Hadiah Bermakna untuk Setiap Momen";

  const name = document.getElementById("buyerName")?.value || "-";
  const wa = document.getElementById("buyerWA")?.value || "-";
  const address = document.getElementById("buyerAddress")?.value || "-";

  const items = getCheckedItems();
  const total = itemTotal + shippingCost;

  let y = 20;

/* =====================
   HEADER
====================== */

// Nama Toko (brand color)
doc.setFontSize(14);
doc.setTextColor(48, 174, 130); // #30AE82
doc.text(storeName, 14, 20);

// Tagline (abu muda, kecil)
doc.setFontSize(8);
doc.setTextColor(140, 140, 140);
doc.text(storeTagline, 14, 26);

// Judul Receipt (kanan)
doc.setFontSize(12);
doc.setTextColor(60, 60, 60);
doc.text("RECEIPT", 196, 20, { align: "right" });

// Meta info (kanan)
doc.setFontSize(9);
doc.setTextColor(120, 120, 120);
doc.text(`Order ID : ${currentOrderID}`, 196, 26, { align: "right" });
doc.text(
  `Date : ${new Date().toLocaleDateString("id-ID")}`,
  196,
  31,
  { align: "right" }
);

// Garis bawah header (abu)
doc.setDrawColor(200, 200, 200);
doc.setLineWidth(0.3);
doc.line(14, 38, 196, 38);

y = 50;



  /* =====================
     BILL TO
  ====================== */
  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.text("BILL TO", 14, y);

  doc.setFontSize(10);
  doc.setTextColor(80);
  y += 6;
  doc.text(name, 14, y);
  y += 5;
  doc.text(`WhatsApp: ${wa}`, 14, y);
  y += 5;
  doc.text(address, 14, y, { maxWidth: 120 });

  y += 15;

  /* =====================
     TABLE HEADER
  ====================== */
  doc.setDrawColor(220);
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("ITEM", 14, y);
  doc.text("QTY", 120, y);
  doc.text("PRICE", 145, y, { align: "right" });
  doc.text("TOTAL", 196, y, { align: "right" });

  y += 4;
  doc.line(14, y, 196, y);
  y += 6;

  /* =====================
     ITEMS
  ====================== */
  doc.setFontSize(10);
  doc.setTextColor(50);

  items.forEach(item => {
    const subtotal = item.price * item.qty;

    doc.text(item.name, 14, y, { maxWidth: 100 });
    doc.text(String(item.qty), 120, y);
    doc.text(
      `Rp ${item.price.toLocaleString("id-ID")}`,
      145,
      y,
      { align: "right" }
    );
    doc.text(
      `Rp ${subtotal.toLocaleString("id-ID")}`,
      196,
      y,
      { align: "right" }
    );

    y += 8;
  });

  y += 4;
  doc.line(14, y, 196, y);
  y += 8;

  /* =====================
     TOTALS
  ====================== */
  doc.setFontSize(10);
  doc.text("Subtotal", 145, y, { align: "right" });
  doc.text(
    `Rp ${itemTotal.toLocaleString("id-ID")}`,
    196,
    y,
    { align: "right" }
  );
  y += 6;

  doc.text("Shipping", 145, y, { align: "right" });
  doc.text(
    `Rp ${shippingCost.toLocaleString("id-ID")}`,
    196,
    y,
    { align: "right" }
  );
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text("TOTAL", 145, y, { align: "right" });
  doc.text(
    `Rp ${total.toLocaleString("id-ID")}`,
    196,
    y,
    { align: "right" }
  );

  /* =====================
     FOOTER
  ====================== */
  y += 20;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "Terima kasih telah berbelanja di Mutmainn Store.",
    105,
    y,
    { align: "center" }
  );
  y += 5;
  doc.text(
    "Invoice digital ini sah tanpa tanda tangan.",
    105,
    y,
    { align: "center" }
  );

  doc.save(`invoice-${currentOrderID}.pdf`);
}

