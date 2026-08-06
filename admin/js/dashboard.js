"use strict";

/*==========================================
    PRANVEDA ERP DASHBOARD
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});

/*==========================================
    INITIALIZE
==========================================*/

function initializeDashboard() {

    updateDateTime();

    setInterval(updateDateTime, 1000);

    initializeCharts();

    initializeSidebar();

    initializeDropdowns();

}

/*==========================================
    DATE & TIME
==========================================*/

function updateDateTime() {

    const now = new Date();

    const dateOptions = {

        weekday: 'long',

        day: 'numeric',

        month: 'long',

        year: 'numeric'

    };

    const timeOptions = {

        hour: '2-digit',

        minute: '2-digit',

        second: '2-digit'

    };

    const date = document.getElementById("currentDate");

    const time = document.getElementById("currentTime");

    if (date)

        date.innerHTML = now.toLocaleDateString("en-IN", dateOptions);

    if (time)

        time.innerHTML = now.toLocaleTimeString("en-IN", timeOptions);

}

/*==========================================
    SIDEBAR
==========================================*/

function initializeSidebar() {

    const button = document.querySelector(".menu-btn");

    const sidebar = document.querySelector(".sidebar");

    if (!button || !sidebar) return;

    button.addEventListener("click", () => {

        sidebar.classList.toggle("active");

    });

}

/*==========================================
    DROPDOWN
==========================================*/

function initializeDropdowns() {

    const notification = document.querySelector(".notification");

    const notificationDropdown = document.querySelector(".notification-dropdown");

    const profile = document.querySelector(".profile");

    const profileDropdown = document.querySelector(".profile-dropdown");

    if (notification && notificationDropdown) {

        notification.addEventListener("click", (e) => {

            e.stopPropagation();

            notificationDropdown.classList.toggle("show");

            if (profileDropdown)
                profileDropdown.classList.remove("show");

        });

    }

    if (profile && profileDropdown) {

        profile.addEventListener("click", (e) => {

            e.stopPropagation();

            profileDropdown.classList.toggle("show");

            if (notificationDropdown)
                notificationDropdown.classList.remove("show");

        });

    }

    document.addEventListener("click", () => {

        if (notificationDropdown)
            notificationDropdown.classList.remove("show");

        if (profileDropdown)
            profileDropdown.classList.remove("show");

    });

}

/*==========================================
    CHARTS
==========================================*/

function initializeCharts() {

    createRevenueChart();

    createSalesChart();

}

/*==========================================
    REVENUE CHART
==========================================*/

function createRevenueChart() {

    const canvas = document.getElementById("revenueChart");

    if (!canvas) return;

    new Chart(canvas, {

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

                label: "Revenue",

                data: [
                    12000,
                    18000,
                    15000,
                    24000,
                    22000,
                    28000,
                    32000
                ],

                borderColor: "#2E7D32",

                backgroundColor: "rgba(46,125,50,.15)",

                fill: true,

                borderWidth: 3,

                tension: .4,

                pointRadius: 5,

                pointBackgroundColor: "#2E7D32"

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                y: {
                    beginAtZero: true,
                    grid: {
                        color: "#ECEFF1"
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                }

            }

        }

    });

}

/*==========================================
    SALES CHART
==========================================*/

function createSalesChart() {

    const canvas = document.getElementById("salesChart");

    if (!canvas) return;

    new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [

                "Ayurvedic Oil",
                "Capsule",
                "Powder",
                "Juice"

            ],

            datasets: [{

                data: [

                    38,
                    22,
                    18,
                    22

                ],

                backgroundColor: [

                    "#2E7D32",
                    "#66BB6A",
                    "#81C784",
                    "#A5D6A7"

                ],

                borderWidth: 0

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
    CARD ANIMATION
==========================================*/

window.addEventListener("load", () => {

    const cards = document.querySelectorAll(".card");

    cards.forEach((card, index) => {

        card.style.opacity = "0";

        card.style.transform = "translateY(30px)";

        setTimeout(() => {

            card.style.transition = ".5s";

            card.style.opacity = "1";

            card.style.transform = "translateY(0)";

        }, index * 150);

    });

});

/*==========================================
    TOAST MESSAGE
==========================================*/

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.innerHTML = message;

    if (type === "success") {

        toast.style.background = "#2E7D32";

    } else if (type === "error") {

        toast.style.background = "#DC2626";

    } else {

        toast.style.background = "#2563EB";

    }

    toast.style.display = "block";

    toast.style.opacity = "1";

    toast.style.transform = "translateY(0)";

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform = "translateY(20px)";

        setTimeout(() => {

            toast.style.display = "none";

        }, 300);

    }, 3000);

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
    COUNTER ANIMATION
==========================================*/

function animateCounters() {

    const cards = document.querySelectorAll(".card h2");

    cards.forEach(card => {

        const text = card.innerText.replace(/[₹, ]/g, "");

        const target = parseInt(text);

        if (isNaN(target)) return;

        let count = 0;

        const step = Math.max(1, Math.ceil(target / 60));

        const timer = setInterval(() => {

            count += step;

            if (count >= target) {

                count = target;

                clearInterval(timer);

            }

            if (card.innerText.includes("₹")) {

                card.innerHTML = "₹ " + count.toLocaleString("en-IN");

            } else {

                card.innerHTML = count.toLocaleString("en-IN");

            }

        }, 20);

    });

}

window.addEventListener("load", animateCounters);

/*==========================================
    LOCAL STORAGE DEMO
==========================================*/

function saveDashboardState() {

    localStorage.setItem("lastDashboardVisit", new Date().toISOString());

}

saveDashboardState();

/*==========================================
    AUTO REFRESH TIME
==========================================*/

setInterval(() => {

    console.log("Dashboard refreshed at", new Date().toLocaleTimeString());

}, 60000);

/*==========================================
    DEMO NOTIFICATION
==========================================*/

setTimeout(() => {

    showToast("Welcome to PranVeda ERP Dashboard");

}, 1000);

/*==========================================
    LOGOUT CHECK
==========================================*/

const logoutLink = document.querySelector('a[href="login.html"]');

if (logoutLink) {

    logoutLink.addEventListener("click", () => {

        localStorage.removeItem("isLoggedIn");

    });

}

/*==========================================
    END
==========================================*/

"use strict";

/*==========================================
        DASHBOARD ERP V2
==========================================*/

let dashboardData = null;

let salesChart = null;

/*==========================================
        INIT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});

function initializeDashboard() {

    loadDashboard();

    bindEvents();

    updateDateTime();

    setInterval(updateDateTime, 1000);

    setInterval(refreshDashboard, 30000);

}

/*==========================================
        EVENTS
==========================================*/

function bindEvents() {

    window.addEventListener("focus", () => {

        refreshDashboard();

    });

}

/*==========================================
        LOAD DASHBOARD
==========================================*/

function loadDashboard() {

    dashboardData =

        ERP.getDashboardData();

    renderCards();

}

/*==========================================
        DASHBOARD CARDS
==========================================*/

function renderCards() {

    setText(

        "todaySales",

        formatCurrency(

            dashboardData.todaySales

        )

    );

    setText(

        "monthlySales",

        formatCurrency(

            dashboardData.monthlySales

        )

    );

    setText(

        "totalRevenue",

        formatCurrency(

            dashboardData.totalRevenue

        )

    );

    setText(

        "totalProducts",

        dashboardData.totalProducts

    );

    setText(

        "totalCustomers",

        dashboardData.totalCustomers

    );

    setText(

        "totalOrders",

        dashboardData.totalOrders

    );

    setText(

        "pendingOrders",

        dashboardData.pendingOrders

    );

    setText(

        "lowStockCount",

        dashboardData.lowStockCount

    );

}

/*==========================================
        REFRESH
==========================================*/

function refreshDashboard() {

    loadDashboard();

    if (typeof renderRecentOrders === "function") {

        renderRecentOrders();

    }

    if (typeof renderRecentCustomers === "function") {

        renderRecentCustomers();

    }

    if (typeof renderLatestBills === "function") {

        renderLatestBills();

    }

    if (typeof renderLowStock === "function") {

        renderLowStock();

    }

    if (typeof updateSalesChart === "function") {

        updateSalesChart();

    }

}

/*==========================================
        HELPERS
==========================================*/

function setText(id, value) {

    const el = document.getElementById(id);

    if (el) {

        el.textContent = value;

    }

}

function formatCurrency(amount) {

    return "₹" + Number(amount).toLocaleString(

        "en-IN",

        {

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        }

    );

}

/*==========================================
        SALES CHART
==========================================*/

function updateSalesChart() {

    const canvas = document.getElementById("salesChart");

    if (!canvas) {

        return;

    }

    const bills = ERP.getBills();

    const salesByDate = {};

    bills.forEach(bill => {

        const date = bill.date;

        const amount = Number(bill.total) || 0;

        if (!salesByDate[date]) {

            salesByDate[date] = 0;

        }

        salesByDate[date] += amount;

    });

    const labels = Object.keys(salesByDate).slice(-7);

    const values = labels.map(date => salesByDate[date]);

    if (salesChart) {

        salesChart.destroy();

    }

    salesChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Sales",

                data: values,

                borderColor: "#2E7D32",

                backgroundColor: "rgba(46,125,50,.15)",

                fill: true,

                tension: .35

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

}

/*==========================================
        RECENT ORDERS
==========================================*/

function renderRecentOrders() {

    const table = document.getElementById("recentOrders");

    if (!table) {

        return;

    }

    table.innerHTML = "";

    dashboardData.latestOrders.forEach(order => {

        table.innerHTML += `

        <tr>

            <td>${order.orderId}</td>

            <td>${order.customer}</td>

            <td>${formatCurrency(order.amount)}</td>

            <td>${order.status}</td>

        </tr>

        `;

    });

}

/*==========================================
        LOW STOCK
==========================================*/

function renderLowStock() {

    const table = document.getElementById("lowStockTable");

    if (!table) {

        return;

    }

    table.innerHTML = "";

    dashboardData.lowStockProducts.forEach(product => {

        table.innerHTML += `

        <tr>

            <td>${product.name}</td>

            <td>${product.stock}</td>

            <td>${product.unit}</td>

        </tr>

        `;

    });

}

/*==========================================
        CHART INIT
==========================================*/

window.addEventListener("load", () => {

    updateSalesChart();

    renderRecentOrders();

    renderLowStock();

});

/*==========================================
        RECENT CUSTOMERS
==========================================*/

function renderRecentCustomers() {

    const table = document.getElementById("recentCustomers");

    if (!table) {

        return;

    }

    table.innerHTML = "";

    dashboardData.latestCustomers.forEach(customer => {

        table.innerHTML += `

        <tr>

            <td>${customer.name}</td>

            <td>${customer.mobile}</td>

            <td>${formatCurrency(customer.totalPurchase || 0)}</td>

        </tr>

        `;

    });

}

/*==========================================
        LATEST BILLS
==========================================*/

function renderLatestBills() {

    const table = document.getElementById("latestBills");

    if (!table) {

        return;

    }

    table.innerHTML = "";

    dashboardData.latestBills.forEach(bill => {

        table.innerHTML += `

        <tr>

            <td>${bill.invoice}</td>

            <td>${bill.customer}</td>

            <td>${bill.payment}</td>

            <td>${formatCurrency(bill.total)}</td>

        </tr>

        `;

    });

}

/*==========================================
        QUICK STATS
==========================================*/

function renderQuickStats() {

    setText(

        "totalBills",

        dashboardData.totalBills

    );

}

/*==========================================
        DASHBOARD SUMMARY
==========================================*/

function renderDashboard() {

    renderCards();

    renderRecentOrders();

    renderRecentCustomers();

    renderLatestBills();

    renderLowStock();

    renderQuickStats();

    updateSalesChart();

}

/*==========================================
        REFRESH DASHBOARD
==========================================*/

function refreshDashboard() {

    dashboardData = ERP.getDashboardData();

    renderDashboard();

}

/*==========================================
        WINDOW LOAD
==========================================*/

window.addEventListener("load", () => {

    refreshDashboard();

});

/*==========================================
        AUTO REFRESH
==========================================*/

setInterval(() => {

    refreshDashboard();

}, 30000);
/*==========================================
        TOAST
==========================================*/

function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) {

        return;

    }

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
        ERROR HANDLING
==========================================*/

window.addEventListener("error", (e) => {

    console.error(

        "Dashboard Error:",

        e.message

    );

});

/*==========================================
        PAGE LOAD
==========================================*/

window.addEventListener("load", () => {

    showLoader();

    try {

        dashboardData = ERP.getDashboardData();

        renderDashboard();

        updateDateTime();

        showToast(

            "Dashboard Loaded Successfully"

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Failed to load dashboard"

        );

    }

    finally {

        hideLoader();

    }

});

/*==========================================
        AUTO REFRESH
==========================================*/

document.addEventListener(

    "visibilitychange",

    () => {

        if (!document.hidden) {

            refreshDashboard();

        }

    }

);

/*==========================================
        VERSION
==========================================*/

console.log(

    "PranVeda ERP Dashboard v2 Loaded"

);

/*==========================================
        END
==========================================*/