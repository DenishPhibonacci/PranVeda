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