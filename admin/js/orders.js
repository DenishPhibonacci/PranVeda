"use strict";

/*==========================================
            ORDERS MODULE
==========================================*/

let orders = [];

let selectedOrder = null;

/*==========================================
            INIT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadOrders();

    bindEvents();

    updateDateTime();

    setInterval(updateDateTime, 1000);

});

/*==========================================
            EVENTS
==========================================*/

function bindEvents() {

    document
        .getElementById("searchOrder")
        ?.addEventListener("keyup", searchOrders);

    document
        .getElementById("statusFilter")
        ?.addEventListener("change", filterOrders);

    document
        .getElementById("paymentFilter")
        ?.addEventListener("change", filterOrders);

    document
        .getElementById("dateFilter")
        ?.addEventListener("change", filterOrders);

    document
        .querySelectorAll(".close-modal")
        .forEach(btn => {

            btn.addEventListener("click", closeModal);

        });

    document
        .getElementById("updateOrderStatus")
        ?.addEventListener("click", saveOrderStatus);

}

/*==========================================
            LOAD ORDERS
==========================================*/

function loadOrders() {

    const data = localStorage.getItem("orders");

    if (data) {

        orders = JSON.parse(data);

    }
    else {

        orders = [];

    }

    renderOrders();

}

/*==========================================
            MODAL
==========================================*/

function openModal() {

    document
        .getElementById("orderModal")
        .classList.add("show");

}

function closeModal() {

    document
        .getElementById("orderModal")
        .classList.remove("show");

}

/*==========================================
            GENERATE ORDER ID
==========================================*/

function generateOrderId() {

    return "ORD-" +

        String(orders.length + 1).padStart(4, "0");

}
/*==========================================
            RENDER ORDERS
==========================================*/

function renderOrders() {

    const table = document.getElementById("orderTable");

    if (!table) return;

    table.innerHTML = "";

    orders.forEach((order, index) => {

        const paymentClass = order.payment.toLowerCase();

        const statusClass = order.status.toLowerCase();

        table.innerHTML += `

        <tr>

            <td>${order.orderId}</td>

            <td>${order.invoice}</td>

            <td>${order.customer}</td>

            <td>${order.mobile}</td>

            <td>₹${order.amount}</td>

            <td>

                <span class="payment ${paymentClass}">

                    ${order.payment}

                </span>

            </td>

            <td>

                <span class="status ${statusClass}">

                    ${order.status}

                </span>

            </td>

            <td>${order.date}</td>

            <td>

                <button
                class="icon-btn view"
                onclick="viewOrder(${index})">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                class="icon-btn edit"
                onclick="editOrder(${index})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                class="icon-btn print"
                onclick="printOrder(${index})">

                    <i class="fa-solid fa-print"></i>

                </button>

            </td>

        </tr>

        `;

    });

    updateSummary();

}

/*==========================================
            VIEW ORDER
==========================================*/

function viewOrder(index) {

    selectedOrder = index;

    const order = orders[index];

    document.getElementById("orderId").value = order.orderId;
    document.getElementById("invoiceId").value = order.invoice;
    document.getElementById("customerName").value = order.customer;
    document.getElementById("customerMobile").value = order.mobile;
    document.getElementById("orderDate").value = order.date;
    document.getElementById("paymentMethod").value = order.payment;
    document.getElementById("orderStatus").value = order.status;

    openModal();

}

/*==========================================
            EDIT ORDER
==========================================*/

function editOrder(index) {

    viewOrder(index);

}

/*==========================================
            PRINT ORDER
==========================================*/

function printOrder(index) {

    viewOrder(index);

    setTimeout(() => {

        window.print();

    }, 300);

}

/*==========================================
            SEARCH
==========================================*/

function searchOrders() {

    const keyword = document
        .getElementById("searchOrder")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#orderTable tr");

    rows.forEach(row => {

        row.style.display =

            row.innerText.toLowerCase().includes(keyword)

                ? ""

                : "none";

    });

}

/*==========================================
            FILTER
==========================================*/

function filterOrders() {

    const status = document
        .getElementById("statusFilter")
        .value;

    const payment = document
        .getElementById("paymentFilter")
        .value;

    const date = document
        .getElementById("dateFilter")
        .value;

    const rows = document.querySelectorAll("#orderTable tr");

    rows.forEach(row => {

        const text = row.innerText;

        const statusMatch = !status || text.includes(status);

        const paymentMatch = !payment || text.includes(payment);

        const dateMatch = !date || text.includes(date);

        row.style.display =

            statusMatch && paymentMatch && dateMatch

                ? ""

                : "none";

    });

}

/*==========================================
            SUMMARY
==========================================*/

function updateSummary() {

    document.getElementById("totalOrders").innerHTML =

        orders.length;

    const count = document.getElementById("orderCount");

    if (count) {

        count.innerHTML =

            `Total Orders : ${orders.length}`;

    }

}
/*==========================================
            SAVE ORDER STATUS
==========================================*/

function saveOrderStatus() {

    if (selectedOrder === null) return;

    orders[selectedOrder].status =

        document.getElementById("orderStatus").value;

    localStorage.setItem(

        "orders",

        JSON.stringify(orders)

    );

    renderOrders();

    closeModal();

    showToast("Order Status Updated");

}

/*==========================================
            TOAST
==========================================*/

function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.innerHTML = message;

    toast.style.display = "block";

    toast.style.opacity = "1";

    setTimeout(() => {

        toast.style.opacity = "0";

        setTimeout(() => {

            toast.style.display = "none";

        }, 300);

    }, 2500);

}

/*==========================================
            DATE & TIME
==========================================*/

function updateDateTime() {

    const now = new Date();

    const date = document.getElementById("currentDate");

    const time = document.getElementById("currentTime");

    if (date) {

        date.innerHTML = now.toLocaleDateString(

            "en-IN",

            {

                weekday: "long",

                day: "numeric",

                month: "long",

                year: "numeric"

            }

        );

    }

    if (time) {

        time.innerHTML = now.toLocaleTimeString(

            "en-IN",

            {

                hour: "2-digit",

                minute: "2-digit",

                second: "2-digit"

            }

        );

    }

}

/*==========================================
            DEMO ORDERS
==========================================*/

if (orders.length === 0) {

    orders = [

        {

            orderId: "ORD-0001",

            invoice: "INV-0001",

            customer: "Denish Makadiya",

            mobile: "9876543210",

            amount: 1250,

            payment: "Cash",

            status: "Pending",

            date: "06 Aug 2026"

        },

        {

            orderId: "ORD-0002",

            invoice: "INV-0002",

            customer: "Rahul Patel",

            mobile: "9988776655",

            amount: 850,

            payment: "UPI",

            status: "Delivered",

            date: "05 Aug 2026"

        },

        {

            orderId: "ORD-0003",

            invoice: "INV-0003",

            customer: "Amit Shah",

            mobile: "9876501234",

            amount: 2199,

            payment: "Card",

            status: "Shipped",

            date: "04 Aug 2026"

        }

    ];

    localStorage.setItem(

        "orders",

        JSON.stringify(orders)

    );

}

/*==========================================
            LOADER
==========================================*/

function showLoader() {

    const loader = document.querySelector(".loader");

    if (loader) {

        loader.style.display = "flex";

    }

}

function hideLoader() {

    const loader = document.querySelector(".loader");

    if (loader) {

        loader.style.display = "none";

    }

}

/*==========================================
            PAGE LOAD
==========================================*/

window.addEventListener("load", () => {

    showLoader();

    setTimeout(() => {

        hideLoader();

        renderOrders();

        showToast("Orders Loaded Successfully");

    }, 500);

});

/*==========================================
            AUTO SAVE
==========================================*/

window.addEventListener("beforeunload", () => {

    localStorage.setItem(

        "orders",

        JSON.stringify(orders)

    );

});

/*==========================================
            END OF FILE
==========================================*/