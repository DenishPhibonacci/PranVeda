"use strict";

/* =========================================================
   PRANVEDA ERP - BILLING.JS
   SINGLE CLEAN VERSION
========================================================= */

const BILLING_CONFIG = {
    billStorageKey: "bills",
    orderStorageKey: "pranvedaOrders",
    productStorageKey: "erp_products",
    customerStorageKey: "customers",
    invoiceCounterKey: "invoiceCounter",
    invoicePrefix: "INV-"
};

let editingBillId = null;
let billingCustomers = [];

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initBilling();
});


function initializeBilling() {

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

}
function bindBillingEvents() {

    getElement("addItemBtn")
        ?.addEventListener(
            "click",
            addBillingRow
        );

    getElement("saveBill")
        ?.addEventListener(
            "click",
            saveBill
        );

    getElement("newBill")
        ?.addEventListener(
            "click",
            () => createNewBill(true)
        );

    getElement("printBill")
        ?.addEventListener(
            "click",
            printCurrentBill
        );

    getElement("whatsappBill")
        ?.addEventListener(
            "click",
            sendBillToWhatsApp
        );

    getElement("discount")
        ?.addEventListener(
            "input",
            updateBillingSummary
        );

    getElement("discountType")
        ?.addEventListener(
            "change",
            updateBillingSummary
        );

    getElement("customerMobile")
        ?.addEventListener(
            "input",
            autoFillCustomer
        );

}

/* =========================================================
   DOM HELPERS
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function getValue(id) {

    const el = getElement(id);

    return el
        ? String(el.value || "").trim()
        : "";
}


function setValue(id, value) {

    const el = getElement(id);

    if (el) {
        el.value = value ?? "";
    }
}


/* =========================================================
   STORAGE
========================================================= */

function readStorage(key, fallback = []) {

    try {

        const value =
            localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        const parsed =
            JSON.parse(value);

        return parsed;

    }
    catch (error) {

        console.error(
            `Storage read error: ${key}`,
            error
        );

        return fallback;
    }
}


function writeStorage(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    }
    catch (error) {

        console.error(
            `Storage write error: ${key}`,
            error
        );

        showToast(
            "Unable to save data.",
            "error"
        );

        return false;
    }
}


/* =========================================================
   PRODUCTS
========================================================= */

function loadProducts() {

    billingProducts =
        readStorage(
            BILLING_CONFIG.productStorageKey,
            []
        );

    populateAllProductSelects();
}


function populateAllProductSelects() {

    document
        .querySelectorAll(
            "#billingTableBody .product-select"
        )
        .forEach(select => {

            populateProductSelect(
                select
            );

        });
}


function populateProductSelect(select) {

    if (!select) return;

    const currentValue =
        select.value;

    select.innerHTML = `
        <option value="">
            Select Product
        </option>
    `;

    billingProducts.forEach(product => {

        const id =
            product.id ??
            product._id ??
            product.name;

        const name =
            product.name ??
            product.productName ??
            "Product";

        const price =
            Number(
                product.sellingPrice ??
                product.price ??
                product.salePrice ??
                0
            );

        const stock =
            Number(
                product.stock ??
                product.quantity ??
                0
            );

        const option =
            document.createElement(
                "option"
            );

        option.value =
            String(id);

        option.textContent =
            `${name} — ₹${price} | Stock: ${stock}`;

        select.appendChild(option);

    });

    if (currentValue) {
        select.value = currentValue;
    }
}


function findProduct(id) {

    return billingProducts.find(
        product => {

            const productId =
                product.id ??
                product._id ??
                product.name;

            return (
                String(productId) ===
                String(id)
            );

        }
    ) || null;
}


function getProductPrice(product) {

    return Number(
        product?.sellingPrice ??
        product?.price ??
        product?.salePrice ??
        0
    ) || 0;
}


function getProductStock(product) {

    return Math.max(
        0,
        Number(
            product?.stock ??
            product?.quantity ??
            0
        ) || 0
    );
}


/* =========================================================
   CUSTOMERS
========================================================= */

function loadCustomers() {

    billingCustomers =
        readStorage(
            BILLING_CONFIG.customerStorageKey,
            []
        );

}


function autoFillCustomer() {

    const mobile =
        getValue("customerMobile")
            .replace(/\D/g, "");

    if (mobile.length !== 10) {
        return;
    }

    const customer =
        billingCustomers.find(
            item => {

                const savedMobile =
                    String(
                        item.mobile ??
                        item.phone ??
                        ""
                    ).replace(/\D/g, "");

                return (
                    savedMobile === mobile
                );

            }
        );

    if (!customer) {
        return;
    }

    setValue(
        "customerName",
        customer.name || ""
    );

}


/* =========================================================
   DATE
========================================================= */

function getToday() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function setCurrentDate() {

    setValue(
        "billDate",
        getToday()
    );

}


/* =========================================================
   INVOICE NUMBER
========================================================= */

function getInvoiceCounter() {

    let counter =
        Number(
            localStorage.getItem(
                BILLING_CONFIG.invoiceCounterKey
            )
        );

    if (
        !Number.isFinite(counter) ||
        counter < 1
    ) {

        counter = 1;
    }

    return counter;
}


function initializeInvoiceNumber() {

    const counter =
        getInvoiceCounter();

    setValue(
        "invoiceNo",
        BILLING_CONFIG.invoicePrefix +
        String(counter).padStart(4, "0")
    );

}


function incrementInvoiceCounter() {

    const next =
        getInvoiceCounter() + 1;

    localStorage.setItem(
        BILLING_CONFIG.invoiceCounterKey,
        String(next)
    );

}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    getElement("addItemBtn")
        ?.addEventListener(
            "click",
            () => addBillingRow()
        );


    getElement("saveBill")
        ?.addEventListener(
            "click",
            saveBill
        );


    getElement("newBill")
        ?.addEventListener(
            "click",
            () => createNewBill(true)
        );


    getElement("printBill")
        ?.addEventListener(
            "click",
            printCurrentBill
        );


    getElement("whatsappBill")
        ?.addEventListener(
            "click",
            sendBillToWhatsApp
        );


    getElement("discount")
        ?.addEventListener(
            "input",
            updateBillingSummary
        );


    getElement("discountType")
        ?.addEventListener(
            "change",
            updateBillingSummary
        );


    getElement("customerMobile")
        ?.addEventListener(
            "input",
            autoFillCustomer
        );


    getElement("productSearch")
        ?.addEventListener(
            "input",
            filterBillingRows
        );


    getElement("billingTableBody")
        ?.addEventListener(
            "click",
            handleTableClick
        );

}


/* =========================================================
   TABLE EVENTS
========================================================= */

function handleTableClick(event) {

    const deleteButton =
        event.target.closest(
            ".delete-row, .delete"
        );

    if (!deleteButton) {
        return;
    }

    const row =
        deleteButton.closest("tr");

    if (!row) {
        return;
    }

    row.remove();

    if (
        document.querySelectorAll(
            "#billingTableBody tr"
        ).length === 0
    ) {

        addBillingRow();

    }

    updateBillingSummary();

}


/* =========================================================
   PRODUCT ROW
========================================================= */

function clearProductTable() {

    const tbody =
        getElement(
            "billingTableBody"
        );

    if (tbody) {
        tbody.innerHTML = "";
    }

}


function addBillingRow() {

    const tbody =
        getElement(
            "billingTableBody"
        );

    if (!tbody) {
        return;
    }

    const row =
        document.createElement("tr");

    row.innerHTML = `

        <td>

            <select class="product-select">

                <option value="">
                    Select Product
                </option>

            </select>

        </td>

        <td>

            <input
                type="number"
                class="qty"
                value="1"
                min="1"
                step="1"
            >

        </td>

        <td>

            <input
                type="number"
                class="rate"
                value="0"
                min="0"
                step="0.01"
            >

        </td>

        <td class="amount">
            ₹0.00
        </td>

        <td>

            <button
                type="button"
                class="icon-btn delete delete-row"
                title="Remove Product"
            >

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

    `;

    tbody.appendChild(row);

    const select =
        row.querySelector(
            ".product-select"
        );

    populateProductSelect(
        select
    );

    bindRowEvents(row);

}


function bindRowEvents(row) {

    const select =
        row.querySelector(
            ".product-select"
        );

    const qty =
        row.querySelector(".qty");

    const rate =
        row.querySelector(".rate");


    select?.addEventListener(
        "change",
        () => {

            const product =
                findProduct(
                    select.value
                );

            if (!product) {

                rate.value = "0";

                calculateRow(
                    row
                );

                return;
            }

            rate.value =
                getProductPrice(
                    product
                );

            const stock =
                getProductStock(
                    product
                );

            qty.max =
                String(stock);

            if (
                Number(qty.value) >
                stock
            ) {

                qty.value =
                    stock > 0
                        ? stock
                        : 1;

            }

            calculateRow(
                row
            );

        }
    );


    qty?.addEventListener(
        "input",
        () => {

            validateQuantity(
                row
            );

            calculateRow(
                row
            );

        }
    );


    rate?.addEventListener(
        "input",
        () => {

            calculateRow(
                row
            );

        }
    );

}


function validateQuantity(row) {

    const select =
        row.querySelector(
            ".product-select"
        );

    const qty =
        row.querySelector(
            ".qty"
        );

    if (
        !select ||
        !qty ||
        !select.value
    ) {
        return;
    }

    const product =
        findProduct(
            select.value
        );

    if (!product) {
        return;
    }

    const stock =
        getProductStock(
            product
        );

    let quantity =
        Number(qty.value) || 1;

    if (quantity < 1) {
        quantity = 1;
    }

    if (
        stock >= 0 &&
        quantity > stock
    ) {

        quantity = stock;

        showToast(
            `Only ${stock} unit(s) available.`,
            "error"
        );

    }

    qty.value =
        quantity;

}


/* =========================================================
   CALCULATIONS
========================================================= */

function calculateRow(row) {

    if (!row) return;

    const qty =
        Number(
            row.querySelector(
                ".qty"
            )?.value
        ) || 0;

    const rate =
        Number(
            row.querySelector(
                ".rate"
            )?.value
        ) || 0;

    const amount =
        qty * rate;

    const amountCell =
        row.querySelector(
            ".amount"
        );

    if (amountCell) {

        amountCell.textContent =
            formatCurrency(
                amount
            );

    }

    updateBillingSummary();

}


function collectItems() {

    const rows =
        document.querySelectorAll(
            "#billingTableBody tr"
        );

    const items = [];


    rows.forEach(row => {

        const select =
            row.querySelector(
                ".product-select"
            );

        const qty =
            Number(
                row.querySelector(
                    ".qty"
                )?.value
            ) || 0;

        const rate =
            Number(
                row.querySelector(
                    ".rate"
                )?.value
            ) || 0;

        if (
            !select ||
            !select.value ||
            qty <= 0
        ) {
            return;
        }

        const product =
            findProduct(
                select.value
            );

        if (!product) {
            return;
        }

        items.push({

            productId:
                product.id ??
                product._id ??
                product.name,

            product:
                product.name ??
                product.productName ??
                "Product",

            qty,

            rate,

            amount:
                qty * rate

        });

    });

    return items;

}


function calculateTotals() {

    const items =
        collectItems();

    const subtotal =
        items.reduce(
            (total, item) =>
                total +
                item.amount,
            0
        );


    const discount =
        Number(
            getElement(
                "discount"
            )?.value
        ) || 0;


    const discountType =
        getElement(
            "discountType"
        )?.value || "amount";


    let discountAmount = 0;


    if (
        discountType ===
        "percent"
    ) {

        discountAmount =
            subtotal *
            discount /
            100;

    }
    else {

        discountAmount =
            discount;

    }


    discountAmount =
        Math.min(
            Math.max(
                discountAmount,
                0
            ),
            subtotal
        );


    const grandTotal =
        Math.max(
            subtotal -
            discountAmount,
            0
        );


    return {

        items,

        subtotal,

        discount:
            discountAmount,

        grandTotal

    };

}


function updateBillingSummary() {

    const items =
        collectItems();

    const subtotal =
        items.reduce(
            (sum, item) =>
                sum + item.amount,
            0
        );

    const discountValue =
        Number(
            getElement("discount")?.value
        ) || 0;

    const discountType =
        getElement("discountType")?.value ||
        "amount";

    let discountAmount = 0;

    if (
        discountType === "percent"
    ) {

        discountAmount =
            subtotal *
            discountValue /
            100;

    }
    else {

        discountAmount =
            discountValue;

    }

    discountAmount =
        Math.min(
            Math.max(
                discountAmount,
                0
            ),
            subtotal
        );

    const grandTotal =
        Math.max(
            subtotal -
            discountAmount,
            0
        );

    const subtotalElement =
        getElement("subTotal");

    const grandTotalElement =
        getElement("grandTotal");

    if (subtotalElement) {

        subtotalElement.textContent =
            formatCurrency(
                subtotal
            );

    }

    if (grandTotalElement) {

        grandTotalElement.textContent =
            formatCurrency(
                grandTotal
            );

    }

    return {

        subtotal,

        discount:
            discountAmount,

        grandTotal

    };

}


/* =========================================================
   SAVE BILL
========================================================= */

function saveBill() {

    const totals =
        updateBillingSummary();

    if (
        totals.items.length === 0
    ) {

        showToast(
            "Please add at least one product.",
            "error"
        );

        return;

    }

    const customerName =
        getValue("customerName") ||
        "Walk-in Customer";

    const mobile =
        getValue("customerMobile");

    const payment =
        document.querySelector(
            'input[name="payment"]:checked'
        )?.value ||
        "Cash";

    const invoiceNo =
        getValue("invoiceNo");

    const billDate =
        getValue("billDate") ||
        getToday();

    const bill = {

        id:
            generateId(),

        invoiceNo,

        invoice:
            invoiceNo,

        customer:
            customerName,

        customerName,

        mobile,

        billDate,

        date:
            billDate,

        payment,

        subtotal:
            totals.subtotal,

        discount:
            totals.discount,

        total:
            totals.grandTotal,

        grandTotal:
            totals.grandTotal,

        status:
            "Paid",

        items:
            totals.items,

        createdAt:
            new Date().toISOString()

    };

    const bills =
        readStorage(
            BILLING_CONFIG.billStorageKey,
            []
        );

    bills.push(
        bill
    );

    if (
        !writeStorage(
            BILLING_CONFIG.billStorageKey,
            bills
        )
    ) {

        return;

    }

    reduceStock(
        totals.items
    );

    saveCustomer(
        customerName,
        mobile,
        billDate,
        totals.grandTotal
    );

    incrementInvoiceCounter();

    loadBillingHistory();

    updateHeaderCards();

    showToast(
        `${invoiceNo} saved successfully.`
    );

    createNewBill(false);

}


/* =========================================================
   STOCK
========================================================= */

function reduceStock(items) {

    if (!Array.isArray(items)) {
        return;
    }


    let products =
        readStorage(
            BILLING_CONFIG.productStorageKey,
            []
        );


    items.forEach(item => {

        const index =
            products.findIndex(
                product => {

                    const id =
                        product.id ??
                        product._id ??
                        product.name;

                    return (
                        String(id) ===
                        String(
                            item.productId
                        )
                    );

                }
            );


        if (index === -1) {
            return;
        }


        const product =
            products[index];


        const currentStock =
            Number(
                product.stock ??
                product.quantity ??
                0
            ) || 0;


        const newStock =
            Math.max(
                currentStock -
                Number(item.qty),
                0
            );


        if (
            Object.prototype.hasOwnProperty.call(
                product,
                "stock"
            )
        ) {

            product.stock =
                newStock;

        }
        else {

            product.quantity =
                newStock;

        }

    });


    writeStorage(
        BILLING_CONFIG.productStorageKey,
        products
    );


    billingProducts =
        products;

}


/* =========================================================
   CUSTOMER SAVE
========================================================= */

function saveCustomer(
    name,
    mobile,
    billDate,
    amount
) {

    const cleanMobile =
        String(
            mobile || ""
        ).replace(/\D/g, "");


    if (!cleanMobile) {
        return;
    }


    const customers =
        readStorage(
            BILLING_CONFIG.customerStorageKey,
            []
        );


    const index =
        customers.findIndex(
            customer => {

                const saved =
                    String(
                        customer.mobile ??
                        customer.phone ??
                        ""
                    ).replace(
                        /\D/g,
                        ""
                    );

                return (
                    saved ===
                    cleanMobile
                );

            }
        );


    if (index >= 0) {

        const customer =
            customers[index];

        customer.name =
            name ||
            customer.name;

        customer.mobile =
            cleanMobile;

        customer.phone =
            cleanMobile;

        customer.orders =
            Number(
                customer.orders || 0
            ) + 1;

        customer.purchase =
            Number(
                customer.purchase || 0
            ) +
            Number(amount || 0);

        customer.lastPurchase =
            billDate;

    }
    else {

        customers.push({

            id:
                generateId(),

            name,

            mobile:
                cleanMobile,

            phone:
                cleanMobile,

            orders:
                1,

            purchase:
                Number(
                    amount || 0
                ),

            lastPurchase:
                billDate,

            createdAt:
                new Date().toISOString()

        });

    }


    writeStorage(
        BILLING_CONFIG.customerStorageKey,
        customers
    );


    billingCustomers =
        customers;

}


/* =========================================================
   HISTORY
========================================================= */

function loadBillingHistory() {

    const table =
        getElement(
            "historyTable"
        );

    if (!table) {
        return;
    }


    const bills =
        readStorage(
            BILLING_CONFIG.billStorageKey,
            []
        );


    const sorted =
        [...bills].sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.createdAt ||
                        a.billDate ||
                        0
                    );

                const dateB =
                    new Date(
                        b.createdAt ||
                        b.billDate ||
                        0
                    );

                return (
                    dateB - dateA
                );

            }
        );


    if (!sorted.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    No billing history found.
                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        sorted
            .map(
                bill => {

                    const payment =
                        bill.payment ||
                        bill.paymentMethod ||
                        "Cash";

                    const total =
                        bill.grandTotal ??
                        bill.total ??
                        0;

                    return `

                        <tr>

                            <td>
                                ${escapeHtml(
                                    bill.invoiceNo ||
                                    bill.invoice ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    bill.customerName ||
                                    bill.customer ||
                                    "Walk-in Customer"
                                )}
                            </td>

                            <td>
                                ${formatDate(
                                    bill.billDate ||
                                    bill.date
                                )}
                            </td>

                            <td>

                                <span class="payment ${String(
                                    payment
                                ).toLowerCase()}">

                                    ${escapeHtml(
                                        payment
                                    )}

                                </span>

                            </td>

                            <td>
                                ${formatCurrency(
                                    total
                                )}
                            </td>

                            <td>

                                <div class="history-actions">

                                    <button
                                        type="button"
                                        class="history-action view"
                                        data-action="view"
                                        data-id="${bill.id}"
                                        title="View Bill"
                                    >
                                        <i class="fa-solid fa-eye"></i>
                                    </button>

                                    <button
                                        type="button"
                                        class="history-action edit"
                                        data-action="edit"
                                        data-id="${bill.id}"
                                        title="Edit Bill"
                                    >
                                        <i class="fa-solid fa-pen"></i>
                                    </button>

                                    <button
                                        type="button"
                                        class="history-action print"
                                        data-action="print"
                                        data-id="${bill.id}"
                                        title="Print Bill"
                                    >
                                        <i class="fa-solid fa-print"></i>
                                    </button>

                                    <button
                                        type="button"
                                        class="history-action whatsapp"
                                        data-action="whatsapp"
                                        data-id="${bill.id}"
                                        title="WhatsApp"
                                    >
                                        <i class="fa-brands fa-whatsapp"></i>
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    table
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    const action =
                        button.dataset.action;


                    if (
                        action === "view"
                    ) {

                        viewBill(id);

                    }
                    else if (
                        action === "edit"
                    ) {

                        editBill(id);

                    }
                    else if (
                        action === "print"
                    ) {

                        printStoredBill(id);

                    }
                    else if (
                        action === "whatsapp"
                    ) {

                        shareBillWhatsApp(id);

                    }

                }
            );

        });

}


/* =========================================================
   HEADER CARDS
========================================================= */

function updateHeaderCards() {

    const bills =
        readStorage(
            BILLING_CONFIG.billStorageKey,
            []
        );


    const today =
        getToday();


    const todayBills =
        bills.filter(
            bill =>
                String(
                    bill.billDate ||
                    bill.date ||
                    ""
                ) === today
        );


    const sales =
        todayBills.reduce(
            (sum, bill) =>
                sum +
                Number(
                    bill.grandTotal ??
                    bill.total ??
                    0
                ),
            0
        );


    const cash =
        todayBills
            .filter(
                bill =>
                    String(
                        bill.payment ||
                        bill.paymentMethod ||
                        ""
                    ).toLowerCase() ===
                    "cash"
            )
            .reduce(
                (sum, bill) =>
                    sum +
                    Number(
                        bill.grandTotal ??
                        bill.total ??
                        0
                    ),
                0
            );


    const upi =
        todayBills
            .filter(
                bill =>
                    String(
                        bill.payment ||
                        bill.paymentMethod ||
                        ""
                    ).toLowerCase() ===
                    "upi"
            )
            .reduce(
                (sum, bill) =>
                    sum +
                    Number(
                        bill.grandTotal ??
                        bill.total ??
                        0
                    ),
                0
            );


    setText(
        "todaySales",
        formatCurrency(
            sales
        )
    );


    setText(
        "todayBills",
        String(
            todayBills.length
        )
    );


    setText(
        "cashCollection",
        formatCurrency(
            cash
        )
    );


    setText(
        "upiCollection",
        formatCurrency(
            upi
        )
    );

}


function setText(
    id,
    value
) {

    const el =
        getElement(id);

    if (el) {
        el.textContent =
            value;
    }

}


/* =========================================================
   PRODUCT SEARCH
========================================================= */

function filterBillingRows() {

    const search =
        getValue(
            "productSearch"
        ).toLowerCase();


    document
        .querySelectorAll(
            "#billingTableBody tr"
        )
        .forEach(row => {

            const select =
                row.querySelector(
                    ".product-select"
                );

            if (!select) {
                return;
            }

            const text =
                select
                    .selectedOptions[0]
                    ?.textContent
                    .toLowerCase() ||
                "";

            row.style.display =
                !search ||
                text.includes(search)
                    ? ""
                    : "none";

        });

}


/* =========================================================
   NEW BILL
========================================================= */

function createNewBill(
    ask = true
) {

    if (
        ask &&
        !window.confirm(
            "Create a new bill?"
        )
    ) {

        return;

    }


    editingBillId =
        null;


    setValue(
        "customerName",
        ""
    );

    setValue(
        "customerMobile",
        ""
    );

    setValue(
        "discount",
        "0"
    );


    const discountType =
        getElement(
            "discountType"
        );

    if (discountType) {
        discountType.value =
            "amount";
    }


    setCurrentDate();
    initializeInvoiceNumber();

    clearProductTable();

    addBillingRow();

    updateBillingSummary();

}


/* =========================================================
   PRINT
========================================================= */

function printCurrentBill() {

    const totals =
        calculateTotals();


    if (!totals.items.length) {

        showToast(
            "Add a product first.",
            "error"
        );

        return;

    }


    printBillDocument({

        invoiceNo:
            getValue(
                "invoiceNo"
            ),

        customerName:
            getValue(
                "customerName"
            ) ||
            "Walk-in Customer",

        mobile:
            getValue(
                "customerMobile"
            ),

        billDate:
            getValue(
                "billDate"
            ),

        payment:
            document.querySelector(
                'input[name="payment"]:checked'
            )?.value ||
            "Cash",

        subtotal:
            totals.subtotal,

        discount:
            totals.discount,

        grandTotal:
            totals.grandTotal,

        items:
            totals.items

    });

}


function printStoredBill(id) {

    const bill =
        getBillById(id);

    if (!bill) {

        showToast(
            "Bill not found.",
            "error"
        );

        return;

    }

    printBillDocument(
        bill
    );

}


function printBillDocument(
    bill
) {

    const popup =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!popup) {

        showToast(
            "Please allow popup window for printing.",
            "error"
        );

        return;

    }


    const itemsHtml =
        (bill.items || [])
            .map(
                item => `

                    <tr>

                        <td>
                            ${escapeHtml(
                                item.product
                            )}
                        </td>

                        <td>
                            ${item.qty}
                        </td>

                        <td>
                            ${formatCurrency(
                                item.rate
                            )}
                        </td>

                        <td>
                            ${formatCurrency(
                                item.amount
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");


    popup.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ${escapeHtml(
                    bill.invoiceNo ||
                    bill.invoice ||
                    "Invoice"
                )}
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    color: #1E293B;
                }

                h1 {
                    color: #2E7D32;
                    margin: 0;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 2px solid #2E7D32;
                    padding-bottom: 20px;
                    margin-bottom: 25px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th,
                td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }

                th {
                    background: #E8F5E9;
                }

                .summary {
                    width: 320px;
                    margin-left: auto;
                    margin-top: 25px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 7px 0;
                }

                .grand {
                    border-top: 2px solid #2E7D32;
                    color: #2E7D32;
                    font-size: 20px;
                    font-weight: bold;
                    padding-top: 12px;
                }

            </style>

        </head>

        <body>

            <div class="header">

                <div>

                    <h1>
                        PranVeda
                    </h1>

                    <div>
                        ERP Invoice
                    </div>

                </div>

                <div>

                    <strong>
                        Invoice:
                    </strong>

                    ${escapeHtml(
                        bill.invoiceNo ||
                        bill.invoice ||
                        "-"
                    )}

                    <br>

                    <strong>
                        Date:
                    </strong>

                    ${formatDate(
                        bill.billDate ||
                        bill.date
                    )}

                </div>

            </div>


            <p>
                <strong>
                    Customer:
                </strong>

                ${escapeHtml(
                    bill.customerName ||
                    bill.customer ||
                    "Walk-in Customer"
                )}

            </p>


            <p>
                <strong>
                    Mobile:
                </strong>

                ${escapeHtml(
                    bill.mobile ||
                    bill.phone ||
                    "-"
                )}

            </p>


            <p>
                <strong>
                    Payment:
                </strong>

                ${escapeHtml(
                    bill.payment ||
                    bill.paymentMethod ||
                    "Cash"
                )}

            </p>


            <table>

                <thead>

                    <tr>

                        <th>
                            Product
                        </th>

                        <th>
                            Qty
                        </th>

                        <th>
                            Rate
                        </th>

                        <th>
                            Amount
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${itemsHtml}

                </tbody>

            </table>


            <div class="summary">

                <div class="summary-row">

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${formatCurrency(
                            bill.subtotal
                        )}
                    </strong>

                </div>


                <div class="summary-row">

                    <span>
                        Discount
                    </span>

                    <strong>
                        ${formatCurrency(
                            bill.discount
                        )}
                    </strong>

                </div>


                <div class="summary-row grand">

                    <span>
                        Grand Total
                    </span>

                    <strong>
                        ${formatCurrency(
                            bill.grandTotal ??
                            bill.total
                        )}
                    </strong>

                </div>

            </div>

        </body>

        </html>

    `);


    popup.document.close();

    popup.focus();

    setTimeout(
        () => popup.print(),
        300
    );

}


/* =========================================================
   WHATSAPP
========================================================= */

function sendBillToWhatsApp() {

    const totals =
        calculateTotals();


    if (!totals.items.length) {

        showToast(
            "Add a product first.",
            "error"
        );

        return;

    }


    const customer =
        getValue(
            "customerName"
        ) ||
        "Customer";


    const mobile =
        getValue(
            "customerMobile"
        );


    const invoice =
        getValue(
            "invoiceNo"
        );


    const itemsText =
        totals.items
            .map(
                item =>
                    `${item.product} × ${item.qty} = ${formatCurrency(item.amount)}`
            )
            .join("\n");


    const message =

`Hello ${customer},

Thank you for shopping with PranVeda.

Invoice: ${invoice}

${itemsText}

Subtotal: ${formatCurrency(
    totals.subtotal
)}

Discount: ${formatCurrency(
    totals.discount
)}

Grand Total: ${formatCurrency(
    totals.grandTotal
)}

Regards,
PranVeda`;


    const cleanMobile =
        mobile.replace(
            /\D/g,
            ""
        );


    const url =
        cleanMobile.length === 10

            ? `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(message)}`

            : `https://wa.me/?text=${encodeURIComponent(message)}`;


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   HISTORY / VIEW
========================================================= */

function getBillById(id) {

    const bills =
        readStorage(
            BILLING_CONFIG.billStorageKey,
            []
        );

    return (
        bills.find(
            bill =>
                String(
                    bill.id
                ) ===
                String(id)
        ) || null
    );

}


function viewBill(id) {

    const bill =
        getBillById(id);


    if (!bill) {

        showToast(
            "Bill not found.",
            "error"
        );

        return;

    }


    const modal =
        getElement(
            "billViewModal"
        );


    if (!modal) {

        alert(
`Invoice: ${bill.invoiceNo}

Customer: ${
    bill.customerName ||
    bill.customer ||
    "Walk-in Customer"
}

Total: ${formatCurrency(
    bill.grandTotal ??
    bill.total
)}`
        );

        return;

    }


    setText(
        "viewInvoiceNo",
        bill.invoiceNo ||
        bill.invoice ||
        "-"
    );


    setText(
        "viewCustomer",
        bill.customerName ||
        bill.customer ||
        "Walk-in Customer"
    );


    setText(
        "viewMobile",
        bill.mobile ||
        bill.phone ||
        "-"
    );


    setText(
        "viewDate",
        formatDate(
            bill.billDate ||
            bill.date
        )
    );


    setText(
        "viewPayment",
        bill.payment ||
        bill.paymentMethod ||
        "Cash"
    );


    const itemsBody =
        getElement(
            "viewBillItems"
        );


    if (itemsBody) {

        itemsBody.innerHTML =
            (bill.items || [])
                .map(
                    item => `

                        <tr>

                            <td>
                                ${escapeHtml(
                                    item.product
                                )}
                            </td>

                            <td>
                                ${item.qty}
                            </td>

                            <td>
                                ${formatCurrency(
                                    item.rate
                                )}
                            </td>

                            <td>
                                ${formatCurrency(
                                    item.amount
                                )}
                            </td>

                        </tr>

                    `
                )
                .join("");

    }


    setText(
        "viewSubtotal",
        formatCurrency(
            bill.subtotal
        )
    );


    setText(
        "viewDiscount",
        formatCurrency(
            bill.discount
        )
    );


    setText(
        "viewGrandTotal",
        formatCurrency(
            bill.grandTotal ??
            bill.total
        )
    );


    modal.classList.add(
        "active"
    );


    getElement(
        "closeBillView"
    )?.addEventListener(
        "click",
        closeBillView
    );


    getElement(
        "viewPrintBill"
    )?.addEventListener(
        "click",
        () =>
            printStoredBill(id)
    );


    getElement(
        "viewWhatsAppBill"
    )?.addEventListener(
        "click",
        () =>
            shareBillWhatsApp(id)
    );

}


function closeBillView() {

    getElement(
        "billViewModal"
    )?.classList.remove(
        "active"
    );

}


/* =========================================================
   EDIT BILL
========================================================= */

function editBill(id) {

    const bill =
        getBillById(id);


    if (!bill) {

        showToast(
            "Bill not found.",
            "error"
        );

        return;

    }


    localStorage.setItem(
        "editingBill",
        JSON.stringify(
            bill
        )
    );


    window.location.href =
        "billing.html";

}


/* =========================================================
   WHATSAPP SAVED BILL
========================================================= */

function shareBillWhatsApp(id) {

    const bill =
        getBillById(id);


    if (!bill) {

        showToast(
            "Bill not found.",
            "error"
        );

        return;

    }


    const itemsText =
        (bill.items || [])
            .map(
                item =>
                    `${item.product} × ${item.qty} = ${formatCurrency(item.amount)}`
            )
            .join("\n");


    const message =

`🌿 PranVeda ERP

Invoice: ${
    bill.invoiceNo ||
    bill.invoice
}

Customer: ${
    bill.customerName ||
    bill.customer
}

${itemsText}

Grand Total: ${
    formatCurrency(
        bill.grandTotal ??
        bill.total
    )
}

Thank you for shopping with PranVeda.`;


    const mobile =
        String(
            bill.mobile ||
            bill.phone ||
            ""
        ).replace(
            /\D/g,
            ""
        );


    const url =
        mobile.length === 10
            ? `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`
            : `https://wa.me/?text=${encodeURIComponent(message)}`;


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   EDIT LOAD
========================================================= */

function loadEditingBill() {

    const raw =
        localStorage.getItem(
            "editingBill"
        );


    if (!raw) {
        return;
    }


    localStorage.removeItem(
        "editingBill"
    );


    try {

        const bill =
            JSON.parse(raw);


        editingBillId =
            bill.id;


        setValue(
            "invoiceNo",
            bill.invoiceNo ||
            bill.invoice
        );


        setValue(
            "customerName",
            bill.customerName ||
            bill.customer
        );


        setValue(
            "customerMobile",
            bill.mobile ||
            bill.phone ||
            ""
        );


        setValue(
            "billDate",
            bill.billDate ||
            bill.date ||
            getToday()
        );


        const tbody =
            getElement(
                "billingTableBody"
            );


        if (!tbody) {
            return;
        }


        tbody.innerHTML = "";


        (bill.items || [])
            .forEach(item => {

                addBillingRow();

                const row =
                    tbody.lastElementChild;


                const select =
                    row.querySelector(
                        ".product-select"
                    );


                const qty =
                    row.querySelector(
                        ".qty"
                    );


                const rate =
                    row.querySelector(
                        ".rate"
                    );


                const id =
                    item.productId ??
                    item.product;


                select.value =
                    String(id);


                if (qty) {
                    qty.value =
                        item.qty || 1;
                }


                if (rate) {
                    rate.value =
                        item.rate ??
                        item.price ??
                        0;
                }


                calculateRow(
                    row
                );

            });


        updateBillingSummary();

    }
    catch (error) {

        console.error(
            "Editing bill load failed:",
            error
        );

    }

}


/* =========================================================
   FORMAT
========================================================= */

function formatCurrency(
    value
) {

    return (
        "₹" +
        Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}


function formatDate(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


function generateId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        getElement(
            "toast"
        );


    if (!toast) {

        console.log(
            message
        );

        return;

    }


    toast.textContent =
        message;


    toast.className =
        "";


    toast.classList.add(
        "show"
    );


    if (type === "error") {

        toast.classList.add(
            "error"
        );

    }


    clearTimeout(
        window.billingToastTimer
    );


    window.billingToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   FINAL EDIT INIT
========================================================= */

window.addEventListener(
    "load",
    () => {

        loadEditingBill();

    }
);
