"use strict";

/*==========================================
            REPORTS MODULE
==========================================*/

let reportData = [];

/*==========================================
            INIT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadReports();

    initializeCharts();

    bindEvents();

    updateDateTime();

    setInterval(updateDateTime, 1000);

});

/*==========================================
            EVENTS
==========================================*/

function bindEvents() {

    document
        .getElementById("generateReport")
        ?.addEventListener("click", generateReport);

    document
        .getElementById("searchReport")
        ?.addEventListener("keyup", searchReports);

    document
        .getElementById("exportExcel")
        ?.addEventListener("click", exportExcel);

    document
        .getElementById("exportPDF")
        ?.addEventListener("click", exportPDF);

    document
        .getElementById("printReport")
        ?.addEventListener("click", printReport);

}

/*==========================================
            LOAD REPORTS
==========================================*/

function loadReports() {

    const data = localStorage.getItem("reports");

    if (data) {

        reportData = JSON.parse(data);

    }
    else {

        reportData = [];

    }

    renderSalesTable();

}

/*==========================================
            GENERATE REPORT
==========================================*/

function generateReport() {

    showToast("Report Generated Successfully");

    renderSalesTable();

}

/*==========================================
            SEARCH REPORT
==========================================*/

function searchReports() {

    const keyword = document
        .getElementById("searchReport")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#salesTable tr");

    rows.forEach(row => {

        row.style.display =

            row.innerText.toLowerCase().includes(keyword)

                ? ""

                : "none";

    });

}

/*==========================================
            SALES TABLE
==========================================*/

function renderSalesTable() {

    const table = document.getElementById("salesTable");

    if (!table) return;

    table.innerHTML = "";

    reportData.forEach(item => {

        table.innerHTML += `

        <tr>

            <td>${item.invoice}</td>

            <td>${item.customer}</td>

            <td>${item.date}</td>

            <td>

                <span class="payment ${item.payment.toLowerCase()}">

                    ${item.payment}

                </span>

            </td>

            <td>

                ₹${item.amount}

            </td>

            <td>

                <span class="status success">

                    Completed

                </span>

            </td>

        </tr>

        `;

    });

}
/*==========================================
            CHARTS
==========================================*/

let salesChart = null;
let paymentChart = null;

function initializeCharts() {

    createSalesChart();

    createPaymentChart();

}

function createSalesChart() {

    const canvas = document.getElementById("salesChart");

    if (!canvas) return;

    salesChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun"
            ],

            datasets: [{

                label: "Sales",

                data: [
                    12000,
                    18000,
                    15000,
                    25000,
                    21000,
                    30000,
                    27000
                ],

                borderColor: "#2E7D32",

                backgroundColor: "rgba(46,125,50,.15)",

                fill: true,

                tension: .4

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: true

                }

            }

        }

    });

}

function createPaymentChart() {

    const canvas = document.getElementById("paymentChart");

    if (!canvas) return;

    paymentChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [

                "Cash",

                "UPI",

                "Card"

            ],

            datasets: [{

                data: [

                    35,

                    50,

                    15

                ],

                backgroundColor: [

                    "#4CAF50",

                    "#2196F3",

                    "#FFC107"

                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

/*==========================================
            UPDATE SUMMARY
==========================================*/

function updateSummary() {

    document.getElementById("todaySales").innerHTML = "₹25,480";

    document.getElementById("monthlySales").innerHTML = "₹6.85L";

    document.getElementById("totalOrders").innerHTML = "125";

    document.getElementById("totalCustomers").innerHTML = "150";

}

/*==========================================
            DATE FILTER
==========================================*/

function applyDateFilter() {

    const from = document.getElementById("fromDate").value;

    const to = document.getElementById("toDate").value;

    console.log("From :", from);

    console.log("To :", to);

    showToast("Date Filter Applied");

}

/*==========================================
            DEMO REPORT DATA
==========================================*/

if (reportData.length === 0) {

    reportData = [

        {

            invoice: "INV-0001",

            customer: "Denish Makadiya",

            date: "06 Aug 2026",

            payment: "Cash",

            amount: 1250

        },

        {

            invoice: "INV-0002",

            customer: "Rahul Patel",

            date: "05 Aug 2026",

            payment: "UPI",

            amount: 850

        },

        {

            invoice: "INV-0003",

            customer: "Amit Shah",

            date: "04 Aug 2026",

            payment: "Card",

            amount: 1999

        }

    ];

    localStorage.setItem(

        "reports",

        JSON.stringify(reportData)

    );

}

updateSummary();
/*==========================================
            EXPORT FUNCTIONS
==========================================*/

function exportExcel() {

    showToast("Excel Export Started");

    console.log("Export Excel");

}

function exportPDF() {

    showToast("PDF Export Started");

    console.log("Export PDF");

}

function printReport() {

    window.print();

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

        renderSalesTable();

        initializeCharts();

        showToast("Reports Loaded Successfully");

    }, 500);

});

/*==========================================
            AUTO SAVE
==========================================*/

window.addEventListener("beforeunload", () => {

    localStorage.setItem(

        "reports",

        JSON.stringify(reportData)

    );

});

/*==========================================
            END OF FILE
==========================================*/