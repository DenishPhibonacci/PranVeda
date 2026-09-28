"use strict";

/*
  Complete billing.js
  - init, binding, product/customer/bill storage
  - seed demo data on first run
  - header cards show real values
  - save, print, whatsapp, edit, view, stock reduction
*/

const BILLING_CONFIG = {
    billStorageKey: "bills",
    productStorageKey: "PranVedaProducts",
    customerStorageKey: "customers",
    orderStorageKey: "pranvedaOrders",
    invoiceCounterKey: "invoiceCounter",
    invoicePrefix: "INV-"
};

let billingProducts = [];
let billingCustomers = [];
let editingBillId = null;

/* ================== STORAGE HELPERS ================== */

function readStorage(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch (e) {
        console.error("Storage read error", key, e);
        return fallback;
    }
}

function writeStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error("Storage write error", key, e);
        showToast("Unable to save data.", "error");
        return false;
    }
}

/* ================== INIT & DEMO SEED ================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeBilling();
});

function initializeBilling() {
    seedDemoDataIfNeeded();

    setCurrentDate();
    initializeInvoiceNumber();

    loadProducts();
    loadCustomers();

    bindEvents();

    clearProductTable();
    addBillingRow();

    loadBillingHistory();
    updateBillingSummary();
    updateHeaderCards();
    loadEditingBill();

    setText("currentDate", getToday());
}

function seedDemoDataIfNeeded() {

    /*
        DEMO DATA DISABLED

        Production ERP me:
        - koi dummy product create nahi hoga
        - koi dummy bill create nahi hoga
        - koi dummy customer create nahi hoga
        - existing real data untouched rahega
    */


    /* =========================================
       INVOICE COUNTER
    ========================================= */

    if (
        !localStorage.getItem(
            BILLING_CONFIG.invoiceCounterKey
        )
    ) {

        localStorage.setItem(
            BILLING_CONFIG.invoiceCounterKey,
            "1"
        );

    }

}

/* ================== ELEMENT HELPERS ================== */

function getElement(id) {
    return document.getElementById(id);
}

function getValue(id) {
    const el = getElement(id);
    return el ? String(el.value || "").trim() : "";
}

function setValue(id, value) {
    const el = getElement(id);
    if (el) el.value = value ?? "";
}

function setText(id, value) {
    const el = getElement(id);
    if (el) el.textContent = value;
}

function getElementValue(id) {
    const el = getElement(id);
    return el ? el.value : "";
}

/* ================== PRODUCTS & CUSTOMERS ================== */

function loadProducts() {
    billingProducts = readStorage(BILLING_CONFIG.productStorageKey, []);
}

function loadCustomers() {
    billingCustomers = readStorage(BILLING_CONFIG.customerStorageKey, []);
}

function populateProductSelect(select) {
    if (!select) return;
    select.innerHTML = `<option value="">Select Product</option>`;
    billingProducts.forEach(product => {
        const id = product.id ?? product._id ?? product.name;
        const name = product.name ?? product.productName ?? "Product";
        const price = Number(product.sellingPrice ?? product.price ?? 0);
        const stock = Number(product.stock ?? product.quantity ?? 0);
        const option = document.createElement("option");
        option.value = String(id);
        option.textContent = `${name} — ₹${price} | Stock: ${stock}`;
        select.appendChild(option);
    });
}

function findProduct(id) {
    return billingProducts.find(p => {
        const pid = p.id ?? p._id ?? p.name;
        return String(pid) === String(id);
    }) || null;
}

function getProductPrice(product) {
    return Number(product?.sellingPrice ?? product?.price ?? product?.salePrice ?? 0) || 0;
}

function getProductStock(product) {
    return Math.max(0, Number(product?.stock ?? product?.quantity ?? 0) || 0);
}

/* ================== TABLE ROWS & EVENTS ================== */

function bindEvents() {
    getElement("addItemBtn")?.addEventListener("click", () => addBillingRow());
    getElement("saveBill")?.addEventListener("click", saveBill);
    getElement("newBill")?.addEventListener("click", () => createNewBill(true));
    getElement("printBill")?.addEventListener("click", printCurrentBill);
    getElement("whatsappBill")?.addEventListener("click", sendBillToWhatsApp);
    getElement("discount")?.addEventListener("input", updateBillingSummary);
    getElement("discountType")?.addEventListener("change", updateBillingSummary);
    getElement("customerMobile")?.addEventListener("input", autoFillCustomer);
    getElement("productSearch")?.addEventListener("input", filterBillingRows);

    // delegate delete-row clicks
    getElement("billingTableBody")?.addEventListener("click", function (event) {
        const deleteButton = event.target.closest(".delete-row, .delete");
        if (!deleteButton) return;
        const row = deleteButton.closest("tr");
        if (!row) return;
        row.remove();
        if (document.querySelectorAll("#billingTableBody tr").length === 0) addBillingRow();
        updateBillingSummary();
    });
}

function clearProductTable() {
    const tbody = getElement("billingTableBody");
    if (tbody) tbody.innerHTML = "";
}

function addBillingRow() {
    const tbody = getElement("billingTableBody");
    if (!tbody) {
        console.error("billingTableBody not found.");
        return;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>
            <select class="product-select">
                <option value="">Select Product</option>
            </select>
        </td>
        <td>
            <input type="number" class="qty" value="1" min="1" step="1">
        </td>
        <td>
            <input type="number" class="rate" value="0" min="0" step="0.01">
        </td>
        <td class="amount">₹0.00</td>
        <td>
            <button type="button" class="btn delete delete-row" title="Remove Product"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;
    tbody.appendChild(row);

    const select = row.querySelector(".product-select");
    const qty = row.querySelector(".qty");
    const rate = row.querySelector(".rate");

    populateProductSelect(select);

    select?.addEventListener("change", () => {
        const product = findProduct(select.value);
        if (!product) {
            rate.value = "0";
            calculateRow(row);
            return;
        }
        rate.value = getProductPrice(product);
        qty.max = String(getProductStock(product));
        if (Number(qty.value) > getProductStock(product)) qty.value = Math.max(1, getProductStock(product));
        calculateRow(row);
    });

    qty?.addEventListener("input", () => {
        validateQuantity(row);
        calculateRow(row);
    });

    rate?.addEventListener("input", () => calculateRow(row));

    calculateRow(row);
}

/* ========== validation & calculations ========== */

function validateQuantity(row) {
    const select = row.querySelector(".product-select");
    const qty = row.querySelector(".qty");
    if (!select || !qty || !select.value) return;
    const product = findProduct(select.value);
    if (!product) return;
    const stock = getProductStock(product);
    let quantity = Number(qty.value) || 1;
    if (quantity < 1) quantity = 1;
    if (stock >= 0 && quantity > stock) {
        quantity = stock;
        showToast(`Only ${stock} unit(s) available.`, "error");
    }
    qty.value = quantity;
}

function calculateRow(row) {
    const qty = Number(row.querySelector(".qty")?.value) || 0;
    const rate = Number(row.querySelector(".rate")?.value) || 0;
    const amount = qty * rate;
    const amountCell = row.querySelector(".amount");
    if (amountCell) amountCell.textContent = formatCurrency(amount);
    updateBillingSummary();
}

function collectItems() {
    const rows = document.querySelectorAll("#billingTableBody tr");
    const items = [];
    rows.forEach(row => {
        const select = row.querySelector(".product-select");
        const qty = Number(row.querySelector(".qty")?.value) || 0;
        const rate = Number(row.querySelector(".rate")?.value) || 0;
        if (!select || !select.value || qty <= 0) return;
        const product = findProduct(select.value);
        if (!product) return;
        items.push({
            productId: product.id ?? product._id ?? product.name,
            product: product.name ?? product.productName ?? "Product",
            qty,
            rate,
            amount: qty * rate
        });
    });
    return items;
}

/* ========== summary & totals ========== */

function updateBillingSummary() {
    const items = collectItems();
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountValue = Number(getElementValue("discount")) || 0;
    const discountType = getElementValue("discountType") || "amount";
    let discountAmount = 0;
    if (discountType === "percent") discountAmount = subtotal * discountValue / 100;
    else discountAmount = discountValue;
    discountAmount = Math.min(Math.max(discountAmount, 0), subtotal);
    const grandTotal = Math.max(subtotal - discountAmount, 0);
    const subtotalElement = getElement("subTotal");
    const grandTotalElement = getElement("grandTotal");
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (grandTotalElement) grandTotalElement.textContent = formatCurrency(grandTotal);
    return { items, subtotal, discount: discountAmount, grandTotal };
}

/* ========== SAVE BILL ========== */

function saveBill() {
    const totals = updateBillingSummary();
    if (!totals || !totals.items || totals.items.length === 0) {
        showToast("Please add at least one product.", "error");
        return;
    }

    const customerName = getValue("customerName") || "Walk-in Customer";
    const mobile = getValue("customerMobile") || "";
    const invoiceNo = getValue("invoiceNo") || getNextInvoiceNumber();
    const billDate = getValue("billDate") || getToday();
    const payment = document.querySelector('input[name="payment"]:checked')?.value || "Cash";

    const bill = {
        id: generateId(),
        invoiceNo: invoiceNo,
        invoice: invoiceNo,
        customerName: customerName,
        customer: customerName,
        mobile: mobile,
        billDate: billDate,
        date: billDate,
        payment: payment,
        subtotal: totals.subtotal,
        discount: totals.discount,
        grandTotal: totals.grandTotal,
        total: totals.grandTotal,
        items: totals.items,
        status: "Paid",
        createdAt: new Date().toISOString()
    };

    const bills = readStorage(BILLING_CONFIG.billStorageKey, []);
    bills.push(bill);
    writeStorage(BILLING_CONFIG.billStorageKey, bills);

    // reduce stock
    try { reduceStock(bill.items); } catch (err) { console.error("reduceStock failed:", err); }

    // save/update customer
    try { saveCustomer(customerName, mobile, billDate, totals.grandTotal); } catch (err) { console.error("saveCustomer failed:", err); }

    incrementInvoiceCounter();
    loadBillingHistory();
    updateHeaderCards();

    showToast(`${invoiceNo} saved successfully.`);
    createNewBill(false);
}

/* ========== STOCK & CUSTOMERS ========== */

function reduceStock(items) {
    if (!Array.isArray(items)) return;
    const products = readStorage(BILLING_CONFIG.productStorageKey, []);
    items.forEach(item => {
        const idx = products.findIndex(p => String(p.id ?? p._id ?? p.name) === String(item.productId));
        if (idx === -1) return;
        const product = products[idx];
        const currentStock = Number(product.stock ?? product.quantity ?? 0) || 0;
        const newStock = Math.max(currentStock - Number(item.qty), 0);
        if (Object.prototype.hasOwnProperty.call(product, "stock")) product.stock = newStock;
        else product.quantity = newStock;
    });
    writeStorage(BILLING_CONFIG.productStorageKey, products);
    billingProducts = products;
}

function saveCustomer(name, mobile, billDate, amount) {
    const cleanMobile = String(mobile || "").replace(/\D/g, "");
    const customers = readStorage(BILLING_CONFIG.customerStorageKey, []);
    const index = customers.findIndex(customer => {
        const saved = String(customer.mobile ?? customer.phone ?? "").replace(/\D/g, "");
        return saved && cleanMobile && saved === cleanMobile;
    });

    if (index >= 0) {
        const customer = customers[index];
        customer.name = name || customer.name;
        customer.mobile = cleanMobile || customer.mobile;
        customer.phone = cleanMobile || customer.phone;
        customer.orders = Number(customer.orders || 0) + 1;
        customer.purchase = Number(customer.purchase || 0) + Number(amount || 0);
        customer.lastPurchase = billDate;
    } else {
        if (cleanMobile || name) {
            customers.push({
                id: generateId(),
                name,
                mobile: cleanMobile,
                phone: cleanMobile,
                orders: 1,
                purchase: Number(amount || 0),
                lastPurchase: billDate,
                createdAt: new Date().toISOString()
            });
        }
    }

    writeStorage(BILLING_CONFIG.customerStorageKey, customers);
    billingCustomers = customers;
}

/* ========== HISTORY & VIEW ========== */

function loadBillingHistory() {
    const table = getElement("historyTable");
    if (!table) return;
    const bills = readStorage(BILLING_CONFIG.billStorageKey, []);
    const sorted = [...bills].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.billDate || 0);
        const dateB = new Date(b.createdAt || b.billDate || 0);
        return dateB - dateA;
    });

    if (!sorted.length) {
        table.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;">No billing history found.</td></tr>`;
        return;
    }

    table.innerHTML = sorted.map(bill => {
        const payment = bill.payment || bill.paymentMethod || "Cash";
        const total = bill.grandTotal ?? bill.total ?? 0;
        return `
            <tr>
                <td>${escapeHtml(bill.invoiceNo || bill.invoice || "-")}</td>
                <td>${escapeHtml(bill.customerName || bill.customer || "Walk-in Customer")}</td>
                <td>${formatDate(bill.billDate || bill.date)}</td>
                <td><span class="payment ${String(payment).toLowerCase()}">${escapeHtml(payment)}</span></td>
                <td>${formatCurrency(total)}</td>
                <td>
                    <div class="history-actions">
                        <button type="button" class="history-action view" data-action="view" data-id="${bill.id}" title="View Bill"><i class="fa-solid fa-eye"></i></button>
                        <button type="button" class="history-action edit" data-action="edit" data-id="${bill.id}" title="Edit Bill"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" class="history-action print" data-action="print" data-id="${bill.id}" title="Print Bill"><i class="fa-solid fa-print"></i></button>
                        <button type="button" class="history-action whatsapp" data-action="whatsapp" data-id="${bill.id}" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    table.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.id;
            const action = button.dataset.action;
            if (action === "view") viewBill(id);
            else if (action === "edit") editBill(id);
            else if (action === "print") printStoredBill(id);
            else if (action === "whatsapp") shareBillWhatsApp(id);
        });
    });
}

function getBillById(id) {
    const bills = readStorage(BILLING_CONFIG.billStorageKey, []);
    return bills.find(b => String(b.id) === String(id)) || null;
}

function viewBill(id) {
    const bill = getBillById(id);
    if (!bill) { showToast("Bill not found.", "error"); return; }
    const modal = getElement("billViewModal");
    if (!modal) {
        alert(`Invoice: ${bill.invoiceNo}\nCustomer: ${bill.customerName}\nTotal: ${formatCurrency(bill.grandTotal ?? bill.total)}`);
        return;
    }

    setText("viewInvoiceNo", bill.invoiceNo || bill.invoice || "-");
    setText("viewCustomer", bill.customerName || bill.customer || "Walk-in Customer");
    setText("viewMobile", bill.mobile || bill.phone || "-");
    setText("viewDate", formatDate(bill.billDate || bill.date));
    setText("viewPayment", bill.payment || bill.paymentMethod || "Cash");

    const itemsBody = getElement("viewBillItems");
    if (itemsBody) {
        itemsBody.innerHTML = (bill.items || []).map(item => `
            <tr>
                <td>${escapeHtml(item.product)}</td>
                <td>${item.qty}</td>
                <td>${formatCurrency(item.rate)}</td>
                <td>${formatCurrency(item.amount)}</td>
            </tr>
        `).join("");
    }

    setText("viewSubtotal", formatCurrency(bill.subtotal));
    setText("viewDiscount", formatCurrency(bill.discount));
    setText("viewGrandTotal", formatCurrency(bill.grandTotal ?? bill.total));

    modal.classList.add("active");

    getElement("closeBillView")?.addEventListener("click", closeBillView);
    getElement("viewPrintBill")?.addEventListener("click", () => printStoredBill(id));
    getElement("viewWhatsAppBill")?.addEventListener("click", () => shareBillWhatsApp(id));
}

function closeBillView() {
    getElement("billViewModal")?.classList.remove("active");
}

/* ========== EDIT BILL ========== */

function editBill(id) {
    const bill = getBillById(id);
    if (!bill) { showToast("Bill not found.", "error"); return; }
    localStorage.setItem("editingBill", JSON.stringify(bill));
    window.location.reload();
}

function loadEditingBill() {
    const raw = localStorage.getItem("editingBill");
    if (!raw) return;
    localStorage.removeItem("editingBill");

    try {
        const bill = JSON.parse(raw);
        editingBillId = bill.id;
        setValue("invoiceNo", bill.invoiceNo || bill.invoice);
        setValue("customerName", bill.customerName || bill.customer);
        setValue("customerMobile", bill.mobile || bill.phone || "");
        setValue("billDate", bill.billDate || bill.date || getToday());
        const tbody = getElement("billingTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";
        (bill.items || []).forEach(item => {
            addBillingRow();
            const row = tbody.lastElementChild;
            const select = row.querySelector(".product-select");
            const qty = row.querySelector(".qty");
            const rate = row.querySelector(".rate");
            const id = item.productId ?? item.product;
            select.value = String(id);
            if (qty) qty.value = item.qty || 1;
            if (rate) rate.value = item.rate ?? item.price ?? 0;
            calculateRow(row);
        });
        updateBillingSummary();
    } catch (error) {
        console.error("Editing bill load failed:", error);
    }
}

/* ========== PRINT / WHATSAPP ========== */

function printCurrentBill() {
    const totals = updateBillingSummary();
    if (!totals.items || totals.items.length === 0) { showToast("Add a product first.", "error"); return; }
    const bill = {
        invoiceNo: getValue("invoiceNo") || "",
        customerName: getValue("customerName") || "Walk-in Customer",
        mobile: getValue("customerMobile") || "",
        billDate: getValue("billDate") || "",
        payment: document.querySelector('input[name="payment"]:checked')?.value || "Cash",
        subtotal: totals.subtotal,
        discount: totals.discount,
        grandTotal: totals.grandTotal,
        items: totals.items
    };
    printBillDocument(bill);
}

function printStoredBill(id) {
    const bill = getBillById(id);
    if (!bill) { showToast("Bill not found.", "error"); return; }
    printBillDocument(bill);
}

function printBillDocument(bill) {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) { showToast("Please allow popup window for printing.", "error"); return; }
    const itemsHtml = (bill.items || []).map(item => `
        <tr>
            <td>${escapeHtml(item.product)}</td>
            <td>${item.qty}</td>
            <td>${formatCurrency(item.rate)}</td>
            <td>${formatCurrency(item.amount)}</td>
        </tr>
    `).join("");

    popup.document.write(`
        <!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(bill.invoiceNo || bill.invoice || "Invoice")}</title>
        <style>body{font-family:Arial;padding:30px;color:#0f172a}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f8f6}</style>
        </head><body>
        <h1>PranVeda</h1>
        <div><strong>Invoice:</strong> ${escapeHtml(bill.invoiceNo || bill.invoice || "-")}</div>
        <div><strong>Date:</strong> ${formatDate(bill.billDate || bill.date)}</div>
        <div><strong>Customer:</strong> ${escapeHtml(bill.customerName || bill.customer || "Walk-in Customer")}</div>
        <table><thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>
        <div style="margin-top:16px;"><strong>Subtotal:</strong> ${formatCurrency(bill.subtotal)}<br><strong>Discount:</strong> ${formatCurrency(bill.discount)}<br><strong>Grand Total:</strong> ${formatCurrency(bill.grandTotal ?? bill.total)}</div>
        <script>window.onload = function(){ window.print(); setTimeout(() => window.close(), 100); };</script>
        </body></html>
    `);
    popup.document.close();
}

function sendBillToWhatsApp() {
    const totals = updateBillingSummary();
    if (!totals.items || totals.items.length === 0) { showToast("Add a product first.", "error"); return; }
    const customer = getValue("customerName") || "Customer";
    const mobile = getValue("customerMobile") || "";
    const invoice = getValue("invoiceNo") || "";
    const items = totals.items.map(item => `${item.product} x ${item.qty} = ${formatCurrency(item.amount)}`).join("\n");
    const message = `Hello ${customer},\n\nThank you for shopping with PranVeda.\n\nInvoice: ${invoice}\n\n${items}\n\nSubtotal: ${formatCurrency(totals.subtotal)}\nDiscount: ${formatCurrency(totals.discount)}\nGrand Total: ${formatCurrency(totals.grandTotal)}\n\nRegards,\nPranVeda`;
    const cleanMobile = String(mobile).replace(/\D/g, "");
    const url = cleanMobile.length === 10 ? `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

function shareBillWhatsApp(id) {
    const bill = getBillById(id);
    if (!bill) { showToast("Bill not found.", "error"); return; }
    const itemsText = (bill.items || []).map(item => `${item.product} × ${item.qty} = ${formatCurrency(item.amount)}`).join("\n");
    const message = `🌿 PranVeda ERP\n\nInvoice: ${bill.invoiceNo || bill.invoice}\n\nCustomer: ${bill.customerName || bill.customer}\n\n${itemsText}\n\nGrand Total: ${formatCurrency(bill.grandTotal ?? bill.total)}\n\nThank you for shopping with PranVeda.`;
    const mobile = String(bill.mobile || bill.phone || "").replace(/\D/g, "");
    const url = mobile.length === 10 ? `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

/* ========== HEADER CARDS & FILTER ========== */

function updateHeaderCards() {
    const bills = readStorage(BILLING_CONFIG.billStorageKey, []);
    const today = getToday();
    const todayBills = bills.filter(bill => String(bill.billDate || bill.date || "") === today);
    const sales = todayBills.reduce((sum, bill) => sum + Number(bill.grandTotal ?? bill.total ?? 0), 0);
    const cash = todayBills.filter(bill => String(bill.payment || bill.paymentMethod || "").toLowerCase() === "cash").reduce((s, b) => s + Number(b.grandTotal ?? b.total ?? 0), 0);
    const upi = todayBills.filter(bill => String(b.payment || bill.paymentMethod || "").toLowerCase() === "upi").reduce((s, b) => s + Number(b.grandTotal ?? b.total ?? 0), 0);

    setText("todaySales", formatCurrency(sales));
    setText("todayBills", String(todayBills.length));
    setText("cashCollection", formatCurrency(cash));
    setText("upiCollection", formatCurrency(upi));
}

function filterBillingRows() {
    const search = getValue("productSearch").toLowerCase();
    document.querySelectorAll("#billingTableBody tr").forEach(row => {
        const select = row.querySelector(".product-select");
        if (!select) return;
        const text = select.selectedOptions[0]?.textContent.toLowerCase() || "";
        row.style.display = !search || text.includes(search) ? "" : "none";
    });
}

/* ========== NEW BILL ========== */

function createNewBill(askConfirmation = true) {
    if (askConfirmation && !confirm("Create a new bill?")) return;
    setValue("customerName", "");
    setValue("customerMobile", "");
    setValue("discount", "0");
    setValue("discountType", "amount");
    setCurrentDate();
    initializeInvoiceNumber();
    const tbody = getElement("billingTableBody");
    if (tbody) tbody.innerHTML = "";
    addBillingRow();
    updateBillingSummary();
}

/* ========== INVOICE COUNTER ================= */

function getInvoiceCounter() {
    let counter = Number(localStorage.getItem(BILLING_CONFIG.invoiceCounterKey));
    if (!Number.isFinite(counter) || counter < 1) {
        counter = 1;
    }
    return counter;
}

function initializeInvoiceNumber() {
    const counter = getInvoiceCounter();
    setValue("invoiceNo", BILLING_CONFIG.invoicePrefix + String(counter).padStart(4, "0"));
}

function getNextInvoiceNumber() {
    const counter = getInvoiceCounter();
    return BILLING_CONFIG.invoicePrefix + String(counter).padStart(4, "0");
}

function incrementInvoiceCounter() {
    const next = getInvoiceCounter() + 1;
    localStorage.setItem(BILLING_CONFIG.invoiceCounterKey, String(next));
}

/* ========== UTILITIES ========== */

function getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function setCurrentDate() {
    setValue("billDate", getToday());
}

function formatCurrency(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function generateId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showToast(message, type = "success") {
    const toast = getElement("toast");
    if (!toast) {
        console.log(message);
        return;
    }
    toast.textContent = message;
    toast.className = "";
    toast.classList.add("show");
    if (type === "error") toast.classList.add("error");
    clearTimeout(window.billingToastTimer);
    window.billingToastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* ========== CUSTOMER AUTOFILL ========== */

function autoFillCustomer() {
    const mobile = getValue("customerMobile").replace(/\D/g, "");
    if (mobile.length !== 10) {
        return;
    }
    const customers = readStorage(BILLING_CONFIG.customerStorageKey, []);
    const customer = customers.find(item => {
        const savedMobile = String(item.mobile ?? item.phone ?? "").replace(/\D/g, "");
        return savedMobile === mobile;
    });
    if (!customer) return;
    setValue("customerName", customer.name || "");
}
