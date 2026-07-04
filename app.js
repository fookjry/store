const SHEET_API_URL = "PUT_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
const LOCAL_DATA_URL = "data/products.json";
const DEFAULT_BUY_LINK = "https://www.facebook.com/boostify.shop9/";
const APP_VERSION = "2026-07-05-0109";

const grid = document.getElementById("grid");
const statusBar = document.getElementById("statusBar");
const searchInput = document.getElementById("searchInput");
const showSold = document.getElementById("showSold");
const reloadBtn = document.getElementById("reloadBtn");

let allRows = [];

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "-";
  return new Intl.NumberFormat("th-TH").format(n) + " บาท";
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const allowSold = showSold.checked;

  const filtered = allRows.filter((row) => {
    const status = normalizeStatus(row.status);
    const isSold = status === "sold";
    if (isSold && !allowSold) return false;

    const haystack = `${row.id || ""} ${row.title || ""}`.toLowerCase();
    return haystack.includes(q);
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty">ไม่พบสินค้า</div>';
    statusBar.textContent = `แสดง 0 รายการ`;
    return;
  }

  grid.innerHTML = filtered
    .map((row) => {
      const id = row.id || "-";
      const title = row.title || "-";
      const price = formatPrice(row.price);
      const status = normalizeStatus(row.status) === "sold" ? "sold" : "available";
      const badgeText = status === "sold" ? "ขายแล้ว" : "พร้อมขาย";
      const rowBuyLink = row.buy_link ? String(row.buy_link).trim() : "";
      const buyLink = rowBuyLink || DEFAULT_BUY_LINK;
      const buyButton =
        status === "available"
          ? `<a class="buy-btn" href="${buyLink}" target="_blank" rel="noopener">ติดต่อซื้อ</a>`
          : "";
      const img = row.image_url ? String(row.image_url).trim() : "";

      return `
        <article class="card">
          <img src="${img}" alt="${id}" loading="lazy" referrerpolicy="no-referrer">
          <div class="card-body">
            <div class="id">${id}</div>
            <div class="title">${title}</div>
            <div class="meta">ราคา: ${price}</div>
            <div class="meta"><span class="badge ${status}">${badgeText}</span></div>
            ${buyButton}
          </div>
        </article>
      `;
    })
    .join("");

  statusBar.textContent = `แสดง ${filtered.length} รายการ`;
}

async function loadData() {
  const useSheet =
    SHEET_API_URL && !SHEET_API_URL.includes("PUT_YOUR_APPS_SCRIPT");
  const sourceUrl = useSheet ? SHEET_API_URL : LOCAL_DATA_URL;

  statusBar.textContent = "กำลังโหลดข้อมูล...";
  try {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");

    allRows = data;
    if (useSheet) {
      statusBar.textContent = `โหลดข้อมูลจาก Google Sheet สำเร็จ (${APP_VERSION})`;
    } else {
      statusBar.textContent = `โหลดข้อมูลจากไฟล์ local สำเร็จ (${APP_VERSION})`;
    }
    render();
  } catch (error) {
    statusBar.textContent = "โหลดข้อมูลไม่สำเร็จ";
    grid.innerHTML = `<div class="empty">เกิดข้อผิดพลาด: ${error.message}</div>`;
  }
}

searchInput.addEventListener("input", render);
showSold.addEventListener("change", render);
reloadBtn.addEventListener("click", loadData);

loadData();
