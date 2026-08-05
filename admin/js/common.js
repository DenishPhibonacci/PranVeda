/*=========================================================
    PRANVEDA ADMIN PANEL
    common.js
    Version : 2.0
==========================================================*/

"use strict";

/*=========================================================
    GLOBAL OBJECT
==========================================================*/

const App = {

    companyName: "PranVeda",

    version: "2.0",

    sidebar: null,

    menuToggle: null,

    notificationBtn: null,

    notificationDropdown: null,

    profileBtn: null,

    profileDropdown: null,

    loader: null,

    toast: null

};


/*=========================================================
    DOM READY
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeApp();

});


/*=========================================================
    INITIALIZE
==========================================================*/

function initializeApp(){

    cacheElements();

    sidebarToggle();

    dropdownEvents();

    activeMenu();

}


/*=========================================================
    CACHE ELEMENTS
==========================================================*/

function cacheElements(){

    App.sidebar=document.querySelector(".sidebar");

    App.menuToggle=document.querySelector(".menu-toggle");

    App.notificationBtn=document.querySelector(".notification");

    App.notificationDropdown=document.querySelector(".notification-dropdown");

    App.profileBtn=document.querySelector(".profile");

    App.profileDropdown=document.querySelector(".profile-dropdown");

    App.loader=document.querySelector(".loader");

    App.toast=document.querySelector(".toast");

}


/*=========================================================
    SIDEBAR
==========================================================*/

function sidebarToggle(){

    if(!App.menuToggle) return;

    App.menuToggle.addEventListener("click",()=>{

        App.sidebar.classList.toggle("active");

    });

}


/*=========================================================
    DROPDOWN EVENTS
==========================================================*/

function dropdownEvents(){

    /* Notification */

    if(App.notificationBtn && App.notificationDropdown){

        App.notificationBtn.addEventListener("click",(e)=>{

            e.stopPropagation();

            App.notificationDropdown.classList.toggle("active");

            if(App.profileDropdown){

                App.profileDropdown.classList.remove("active");

            }

        });

    }


    /* Profile */

    if(App.profileBtn && App.profileDropdown){

        App.profileBtn.addEventListener("click",(e)=>{

            e.stopPropagation();

            App.profileDropdown.classList.toggle("active");

            if(App.notificationDropdown){

                App.notificationDropdown.classList.remove("active");

            }

        });

    }


    /* Outside Click */

    document.addEventListener("click",()=>{

        if(App.notificationDropdown){

            App.notificationDropdown.classList.remove("active");

        }

        if(App.profileDropdown){

            App.profileDropdown.classList.remove("active");

        }

    });

}


/*=========================================================
    ACTIVE MENU
==========================================================*/

function activeMenu(){

    const currentPage = location.pathname.split("/").pop();

    const links=document.querySelectorAll(".menu a");

    links.forEach(link=>{

        link.parentElement.classList.remove("active");

        const href=link.getAttribute("href");

        if(href===currentPage){

            link.parentElement.classList.add("active");

        }

    });

}


/*=========================================================
    TOAST NOTIFICATION
=========================================================*/

function showToast(message, type = "success") {

    if (!App.toast) return;

    let icon = "fa-circle-check";
    let color = "#22C55E";

    switch (type) {

        case "error":
            icon = "fa-circle-xmark";
            color = "#EF4444";
            break;

        case "warning":
            icon = "fa-triangle-exclamation";
            color = "#F59E0B";
            break;

        case "info":
            icon = "fa-circle-info";
            color = "#3B82F6";
            break;
    }

    App.toast.innerHTML = `
        <i class="fa-solid ${icon}" style="color:${color}"></i>
        <span>${message}</span>
    `;

    App.toast.style.borderLeftColor = color;

    App.toast.classList.add("show");

    clearTimeout(App.toastTimer);

    App.toastTimer = setTimeout(() => {

        App.toast.classList.remove("show");

    }, 3000);

}


/*=========================================================
    LOADER
=========================================================*/

function showLoader() {

    if (App.loader) {

        App.loader.classList.add("active");

    }

}

function hideLoader() {

    if (App.loader) {

        App.loader.classList.remove("active");

    }

}


/*=========================================================
    LOCAL STORAGE
=========================================================*/

function saveStorage(key, value) {

    localStorage.setItem(

        key,

        JSON.stringify(value)

    );

}

function getStorage(key, defaultValue = []) {

    const data = localStorage.getItem(key);

    if (!data) return defaultValue;

    try {

        return JSON.parse(data);

    } catch {

        return defaultValue;

    }

}

function removeStorage(key) {

    localStorage.removeItem(key);

}


/*=========================================================
    DATE FORMAT
=========================================================*/

function formatDate(date = new Date()) {

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

function formatTime(date = new Date()) {

    return date.toLocaleTimeString("en-IN", {

        hour: "2-digit",

        minute: "2-digit"

    });

}


/*=========================================================
    LIVE DATE & TIME
=========================================================*/

function startClock() {

    const dateBox = document.getElementById("currentDate");

    const timeBox = document.getElementById("currentTime");

    if (!dateBox && !timeBox) return;

    function updateClock() {

        const now = new Date();

        if (dateBox)

            dateBox.textContent = formatDate(now);

        if (timeBox)

            timeBox.textContent = formatTime(now);

    }

    updateClock();

    setInterval(updateClock, 1000);

}

startClock();


/*=========================================================
    NUMBER FORMAT
=========================================================*/

function formatCurrency(value) {

    return "₹" + Number(value).toLocaleString("en-IN");

}


/*=========================================================
    RANDOM ID
=========================================================*/

function randomID(prefix = "PV") {

    return prefix +

        Date.now()

        .toString()

        .slice(-8);

}


/*=========================================================
    CONFIRM DIALOG
=========================================================*/

function confirmAction(message) {

    return confirm(message);

}


/*=========================================================
    SCROLL TOP
=========================================================*/

function scrollTopPage() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/*=========================================================
    NOTIFICATION MANAGER
=========================================================*/

const NotificationManager = {

    storageKey: "pranveda_notifications",

    notifications: [],

    init() {

        this.notifications = getStorage(this.storageKey, []);

        this.render();

    },

    save() {

        saveStorage(this.storageKey, this.notifications);

    },

    add(title, message, type = "info") {

        const item = {

            id: Date.now(),

            title,

            message,

            type,

            read: false,

            time: new Date().toISOString()

        };

        this.notifications.unshift(item);

        this.save();

        this.render();

        showToast(title, type);

    },

    remove(id) {

        this.notifications = this.notifications.filter(n => n.id !== id);

        this.save();

        this.render();

    },

    clear() {

        this.notifications = [];

        this.save();

        this.render();

    },

    markAllRead() {

        this.notifications.forEach(n => {

            n.read = true;

        });

        this.save();

        this.render();

    },

    getUnreadCount() {

        return this.notifications.filter(n => !n.read).length;

    },

    render() {

        const badge = document.querySelector(".notification-count");
        const body = document.querySelector(".dropdown-body");

        if (badge) {

            const unread = this.getUnreadCount();

            badge.textContent = unread;

            badge.style.display = unread > 0 ? "flex" : "none";

        }

        if (!body) return;

        body.innerHTML = "";

        if (this.notifications.length === 0) {

            body.innerHTML = `
                <div class="notification-item">
                    <div class="notification-text">
                        <h4>No Notifications</h4>
                        <p>Everything is up to date.</p>
                    </div>
                </div>
            `;

            return;

        }

        this.notifications.forEach(item => {

            body.innerHTML += `

            <div class="notification-item">

                <div class="notification-icon ${item.type}">

                    <i class="${this.getIcon(item.type)}"></i>

                </div>

                <div class="notification-text">

                    <h4>${item.title}</h4>

                    <p>${item.message}</p>

                    <div class="notification-time">

                        ${this.timeAgo(item.time)}

                    </div>

                </div>

            </div>

            `;

        });

    },

    getIcon(type) {

        switch(type){

            case "success":
                return "fas fa-circle-check";

            case "warning":
                return "fas fa-triangle-exclamation";

            case "danger":
                return "fas fa-circle-xmark";

            default:
                return "fas fa-circle-info";

        }

    },

    timeAgo(date) {

        const seconds = Math.floor(

            (new Date() - new Date(date)) / 1000

        );

        if(seconds < 60) return "Just Now";

        if(seconds < 3600)

            return Math.floor(seconds/60) + " min ago";

        if(seconds < 86400)

            return Math.floor(seconds/3600) + " hr ago";

        return Math.floor(seconds/86400) + " day ago";

    }

};


/*=========================================================
    DEFAULT NOTIFICATIONS
=========================================================*/

function seedNotifications(){

    if(NotificationManager.notifications.length>0) return;

    NotificationManager.add(

        "Welcome",

        "Welcome to PranVeda Admin Panel",

        "success"

    );

    NotificationManager.add(

        "Products",

        "Add your first product",

        "info"

    );

}


/*=========================================================
    INITIALIZE
=========================================================*/

document.addEventListener("DOMContentLoaded",()=>{

    NotificationManager.init();

    seedNotifications();

});
