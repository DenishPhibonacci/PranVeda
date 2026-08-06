"use strict";

/*==========================================
    PRANVEDA ERP COMMON LIBRARY
    Version : 2.0.0
==========================================*/

const App = {

    version: "2.0.0",

    selectors: {

        toast: "#toast",

        loader: ".loader",

        currentDate: "#currentDate",

        currentTime: "#currentTime"

    }

};

/*==========================================
    DOM HELPERS
==========================================*/

App.$ = function (selector) {

    return document.querySelector(selector);

};

App.$$ = function (selector) {

    return document.querySelectorAll(selector);

};

App.byId = function (id) {

    return document.getElementById(id);

};

/*==========================================
    VALUE HELPERS
==========================================*/

App.getValue = function (id) {

    const element = App.byId(id);

    if (!element) return "";

    return element.value.trim();

};

App.setValue = function (id, value) {

    const element = App.byId(id);

    if (!element) return;

    element.value = value ?? "";

};

App.setText = function (id, value) {

    const element = App.byId(id);

    if (!element) return;

    element.textContent = value;

};

/*==========================================
    VISIBILITY
==========================================*/

App.show = function (selector) {

    const el = App.$(selector);

    if (el) {

        el.style.display = "";

    }

};

App.hide = function (selector) {

    const el = App.$(selector);

    if (el) {

        el.style.display = "none";

    }

};

/*==========================================
    TOAST
==========================================*/

App.toast = function (message, type = "success") {

    const toast = App.$(App.selectors.toast);

    if (!toast) return;

    toast.textContent = message;

    toast.className = "toast " + type;

    toast.style.display = "block";

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.style.display = "none";

        }, 300);

    }, 2500);

};

/*==========================================
    LOADER
==========================================*/

App.showLoader = function () {

    const loader = App.$(App.selectors.loader);

    if (!loader) return;

    loader.style.display = "flex";

};

App.hideLoader = function () {

    const loader = App.$(App.selectors.loader);

    if (!loader) return;

    loader.style.display = "none";

};

/*==========================================
    DATE & TIME
==========================================*/

App.updateDateTime = function () {

    const now = new Date();

    const date = App.$(App.selectors.currentDate);

    const time = App.$(App.selectors.currentTime);

    if (date) {

        date.textContent = now.toLocaleDateString("en-IN", {

            weekday: "long",

            day: "numeric",

            month: "long",

            year: "numeric"

        });

    }

    if (time) {

        time.textContent = now.toLocaleTimeString("en-IN", {

            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit"

        });

    }

};

/*==========================================
    FORMATTERS
==========================================*/

App.currency = function (value) {

    return "₹" + Number(value || 0).toLocaleString("en-IN", {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2

    });

};

App.number = function (value) {

    return Number(value || 0).toLocaleString("en-IN");

};

/*==========================================
    VALIDATION
==========================================*/

App.isEmpty = function (value) {

    return value === null ||

           value === undefined ||

           value.toString().trim() === "";

};

App.isEmail = function (email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

};

App.isMobile = function (mobile) {

    return /^[6-9]\d{9}$/.test(mobile);

};

/*==========================================
    UUID
==========================================*/

App.uuid = function () {

    return Date.now().toString(36) +

        Math.random().toString(36).substring(2, 8);

};

/*==========================================
    LOCAL STORAGE
==========================================*/

App.save = function (key, value) {

    localStorage.setItem(

        key,

        JSON.stringify(value)

    );

};

App.load = function (key, defaultValue = null) {

    const data = localStorage.getItem(key);

    if (!data) return defaultValue;

    try {

        return JSON.parse(data);

    }

    catch {

        return defaultValue;

    }

};

App.remove = function (key) {

    localStorage.removeItem(key);

};

/*==========================================
    DEBOUNCE
==========================================*/

App.debounce = function (callback, delay = 300) {

    let timer;

    return function (...args) {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback.apply(this, args);

        }, delay);

    };

};

/*==========================================
    CONFIRM DIALOG
==========================================*/

App.confirm = function (message) {

    return window.confirm(message);

};

/*==========================================
    MODAL
==========================================*/

App.openModal = function (id) {

    const modal = App.byId(id);

    if (!modal) return;

    modal.classList.add("show");

};

App.closeModal = function (id) {

    const modal = App.byId(id);

    if (!modal) return;

    modal.classList.remove("show");

};

/*==========================================
    SIDEBAR
==========================================*/

App.toggleSidebar = function () {

    document.body.classList.toggle("sidebar-collapse");

};

/*==========================================
    DROPDOWNS
==========================================*/

App.toggleDropdown = function (id) {

    const dropdown = App.byId(id);

    if (!dropdown) return;

    dropdown.classList.toggle("show");

};

/*==========================================
    ACTIVE MENU
==========================================*/

App.setActiveMenu = function () {

    const page = location.pathname.split("/").pop();

    document.querySelectorAll(".sidebar a").forEach(link => {

        link.classList.remove("active");

        const href = link.getAttribute("href");

        if (href && href.endsWith(page)) {

            link.classList.add("active");

        }

    });

};

/*==========================================
    CLICK OUTSIDE DROPDOWN
==========================================*/

document.addEventListener("click", function (e) {

    document.querySelectorAll(".dropdown-menu.show").forEach(menu => {

        if (!menu.parentElement.contains(e.target)) {

            menu.classList.remove("show");

        }

    });

});

/*==========================================
    ESC KEY CLOSE MODAL
==========================================*/

document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {

        document.querySelectorAll(".modal.show").forEach(modal => {

            modal.classList.remove("show");

        });

    }

});

/*==========================================
    COPY TO CLIPBOARD
==========================================*/

App.copy = async function (text) {

    try {

        await navigator.clipboard.writeText(text);

        App.toast("Copied Successfully");

    }

    catch {

        App.toast("Copy Failed", "error");

    }

};

/*==========================================
    DOWNLOAD JSON
==========================================*/

App.downloadJson = function (filename, data) {

    const blob = new Blob(

        [JSON.stringify(data, null, 2)],

        {

            type: "application/json"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);

};

/*==========================================
    EXPORT CSV
==========================================*/

App.exportCSV = function (filename, rows) {

    if (!rows || rows.length === 0) {

        App.toast("No Data Found", "error");

        return;

    }

    const headers = Object.keys(rows[0]);

    const csv = [

        headers.join(","),

        ...rows.map(row =>

            headers.map(h => `"${row[h] ?? ""}"`).join(",")

        )

    ].join("\n");

    const blob = new Blob(

        [csv],

        {

            type: "text/csv"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);

};

/*==========================================
    PRINT
==========================================*/

App.print = function () {

    window.print();

};

/*==========================================
    GLOBAL ERROR HANDLER
==========================================*/

window.addEventListener("error", function (event) {

    console.error(event.error);

});

/*==========================================
    INITIALIZE APP
==========================================*/

App.init = function () {

    App.setActiveMenu();

    App.updateDateTime();

    setInterval(App.updateDateTime, 1000);

    console.log(

        "%cPranVeda ERP v2.0 Loaded",

        "color:#2E7D32;font-size:14px;font-weight:bold;"

    );

};

/*==========================================
    START APP
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    App.init();

});

/*==========================================
    END OF FILE
==========================================*/