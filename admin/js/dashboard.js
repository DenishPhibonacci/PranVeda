"use strict";

/*==========================================
    PRANVEDA ERP
    Dashboard.js
==========================================*/

// Dashboard Data

const Dashboard = {

    sales: 0,

    orders: 0,

    customers: 0,

    products: 0

};


/*==========================================
    DOM Ready
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});


/*==========================================
    Initialize
==========================================*/

function initializeDashboard() {

    loadDashboard();

    loadChart();

    loadRecentOrders();

    loadLowStock();

    loadRecentCustomers();

}


/*==========================================
    Dashboard Cards
==========================================*/

function loadDashboard() {

    const orders =
        getStorage("orders", []);

    const customers =
        getStorage("customers", []);

    const products =
        getStorage("products", []);

    let totalSales = 0;

    orders.forEach(item => {

        totalSales += Number(item.total || 0);

    });

    Dashboard.sales = totalSales;

    Dashboard.orders = orders.length;

    Dashboard.customers = customers.length;

    Dashboard.products = products.length;

    document.getElementById("todaySales").innerHTML =
        formatCurrency(totalSales);

    document.getElementById("totalOrders").innerHTML =
        orders.length;

    document.getElementById("totalCustomers").innerHTML =
        customers.length;

    document.getElementById("totalProducts").innerHTML =
        products.length;

}


/*==========================================
    Chart
==========================================*/

let salesChart;

function loadChart() {

    const ctx =
        document.getElementById("salesChart");

    if (!ctx) return;

    salesChart = new Chart(ctx, {

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
                    1500,
                    2500,
                    1800,
                    3500,
                    4200,
                    3100,
                    Dashboard.sales
                ],

                borderWidth: 3,

                tension: .35,

                fill: true

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    display: false
                }

            }

        }

    });

}

/*==========================================
    Recent Orders
==========================================*/

function loadRecentOrders() {

    const tbody = document.getElementById("recentOrders");

    if (!tbody) return;

    const orders = getStorage("orders", []);

    tbody.innerHTML = "";

    if (orders.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    No Orders Found
                </td>
            </tr>
        `;

        return;
    }

    orders
        .slice(-5)
        .reverse()
        .forEach(order => {

            tbody.innerHTML += `
                <tr>

                    <td>${order.invoice || "-"}</td>

                    <td>${order.customer || "-"}</td>

                    <td>${formatCurrency(order.total || 0)}</td>

                    <td>

                        <span class="badge badge-success">

                            ${order.status || "Paid"}

                        </span>

                    </td>

                </tr>
            `;

        });

}


/*==========================================
    Low Stock Products
==========================================*/

function loadLowStock() {

    const tbody = document.getElementById("lowStockProducts");

    if (!tbody) return;

    const products = getStorage("products", []);

    tbody.innerHTML = "";

    const lowStock = products.filter(product => {

        return Number(product.stock) <= 10;

    });

    if (lowStock.length === 0) {

        tbody.innerHTML = `
            <tr>

                <td colspan="3" class="text-center">

                    No Low Stock Products

                </td>

            </tr>
        `;

        return;

    }

    lowStock.forEach(product => {

        tbody.innerHTML += `

            <tr>

                <td>${product.name}</td>

                <td>${product.stock}</td>

                <td>

                    <span class="badge badge-danger">

                        Low Stock

                    </span>

                </td>

            </tr>

        `;

    });

}


/*==========================================
    Recent Customers
==========================================*/

function loadRecentCustomers() {

    const tbody = document.getElementById("recentCustomers");

    if (!tbody) return;

    const customers = getStorage("customers", []);

    tbody.innerHTML = "";

    if (customers.length === 0) {

        tbody.innerHTML = `
            <tr>

                <td colspan="4" class="text-center">

                    No Customers Found

                </td>

            </tr>
        `;

        return;

    }

    customers
        .slice(-5)
        .reverse()
        .forEach(customer => {

            tbody.innerHTML += `

                <tr>

                    <td>${customer.name || "-"}</td>

                    <td>${customer.mobile || "-"}</td>

                    <td>${customer.city || "-"}</td>

                    <td>${customer.orders || 0}</td>

                </tr>

            `;

        });

}

/*==========================================
    CARD ANIMATION
==========================================*/

function animateValue(elementId, start, end, duration = 1000) {

    const element = document.getElementById(elementId);

    if (!element) return;

    let startTime = null;

    function animation(currentTime) {

        if (!startTime) startTime = currentTime;

        const progress = Math.min((currentTime - startTime) / duration, 1);

        const value = Math.floor(progress * (end - start) + start);

        if (elementId === "todaySales") {

            element.innerHTML = formatCurrency(value);

        } else {

            element.innerHTML = value;

        }

        if (progress < 1) {

            requestAnimationFrame(animation);

        }

    }

    requestAnimationFrame(animation);

}


/*==========================================
    ANIMATE DASHBOARD
==========================================*/

function animateDashboardCards() {

    animateValue("todaySales", 0, Dashboard.sales);

    animateValue("totalOrders", 0, Dashboard.orders);

    animateValue("totalCustomers", 0, Dashboard.customers);

    animateValue("totalProducts", 0, Dashboard.products);

}


/*==========================================
    TODAY ACTIVITY
==========================================*/

function loadTodayActivity() {

    const list = document.querySelector(".activity-list");

    if (!list) return;

    const orders = Dashboard.orders;

    const customers = Dashboard.customers;

    const products = Dashboard.products;

    list.innerHTML = "";

    list.innerHTML += `
        <li>
            <i class="fas fa-cart-shopping text-success"></i>
            ${orders} Orders Available
        </li>
    `;

    list.innerHTML += `
        <li>
            <i class="fas fa-users text-primary"></i>
            ${customers} Customers Available
        </li>
    `;

    list.innerHTML += `
        <li>
            <i class="fas fa-box-open text-warning"></i>
            ${products} Products Available
        </li>
    `;

    list.innerHTML += `
        <li>
            <i class="fas fa-chart-line text-danger"></i>
            Today's Sales ${formatCurrency(Dashboard.sales)}
        </li>
    `;

}


/*==========================================
    DASHBOARD REFRESH
==========================================*/

function refreshDashboard() {

    loadDashboard();

    loadRecentOrders();

    loadLowStock();

    loadRecentCustomers();

    loadTodayActivity();

    animateDashboardCards();

}


/*==========================================
    AUTO REFRESH
==========================================*/

setInterval(() => {

    refreshDashboard();

}, 30000);


/*==========================================
    WELCOME MESSAGE
==========================================*/

window.addEventListener("load", () => {

    setTimeout(() => {

        showToast(

            "Welcome to PranVeda Dashboard",

            "success"

        );

    }, 700);

});


/*==========================================
    INITIAL CALL
==========================================*/

window.addEventListener("load", () => {

    refreshDashboard();

});

/*==========================================
    CARD ANIMATION
==========================================*/

function animateValue(elementId, start, end, duration = 1000) {

    const element = document.getElementById(elementId);

    if (!element) return;

    let startTime = null;

    function animation(currentTime) {

        if (!startTime) startTime = currentTime;

        const progress = Math.min((currentTime - startTime) / duration, 1);

        const value = Math.floor(progress * (end - start) + start);

        if (elementId === "todaySales") {

            element.innerHTML = formatCurrency(value);

        } else {

            element.innerHTML = value;

        }

        if (progress < 1) {

            requestAnimationFrame(animation);

        }

    }

    requestAnimationFrame(animation);

}


/*==========================================
    ANIMATE DASHBOARD
==========================================*/

function animateDashboardCards() {

    animateValue("todaySales", 0, Dashboard.sales);

    animateValue("totalOrders", 0, Dashboard.orders);

    animateValue("totalCustomers", 0, Dashboard.customers);

    animateValue("totalProducts", 0, Dashboard.products);

}


/*==========================================
    TODAY ACTIVITY
==========================================*/

function loadTodayActivity() {

    const list = document.querySelector(".activity-list");

    if (!list) return;

    const orders = Dashboard.orders;

    const customers = Dashboard.customers;

    const products = Dashboard.products;

    list.innerHTML = "";

    list.innerHTML += `
        <li>
            <i class="fas fa-cart-shopping text-success"></i>
            ${orders} Orders Available
        </li>
    `;

    list.innerHTML += `
        <li>
            <i class="fas fa-users text-primary"></i>
            ${customers} Customers Available
        </li>
    `;

    list.innerHTML += `
        <li>
            <i class="fas fa-box-open text-warning"></i>
            ${products} Products Available
        </li>
    `;

    list.innerHTML += `
        <li>
            <i class="fas fa-chart-line text-danger"></i>
            Today's Sales ${formatCurrency(Dashboard.sales)}
        </li>
    `;

}


/*==========================================
    DASHBOARD REFRESH
==========================================*/

function refreshDashboard() {

    loadDashboard();

    loadRecentOrders();

    loadLowStock();

    loadRecentCustomers();

    loadTodayActivity();

    animateDashboardCards();

}


/*==========================================
    AUTO REFRESH
==========================================*/

setInterval(() => {

    refreshDashboard();

}, 30000);


/*==========================================
    WELCOME MESSAGE
==========================================*/

window.addEventListener("load", () => {

    setTimeout(() => {

        showToast(

            "Welcome to PranVeda Dashboard",

            "success"

        );

    }, 700);

});


/*==========================================
    INITIAL CALL
==========================================*/

window.addEventListener("load", () => {

    refreshDashboard();

});