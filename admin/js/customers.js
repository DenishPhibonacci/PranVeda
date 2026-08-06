"use strict";

/*==========================================
        CUSTOMERS MODULE
==========================================*/

let customers = [];

let editIndex = -1;

/*==========================================
        INIT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadCustomers();

    bindEvents();

    updateDateTime();

    setInterval(updateDateTime, 1000);

});

/*==========================================
        EVENTS
==========================================*/

function bindEvents() {

    document
        .getElementById("addCustomerBtn")
        ?.addEventListener("click", openModal);

    document
        .querySelectorAll(".close-modal")
        .forEach(btn => {

            btn.addEventListener("click", closeModal);

        });

    document
        .getElementById("customerForm")
        ?.addEventListener("submit", saveCustomer);

    document
        .getElementById("searchCustomer")
        ?.addEventListener("keyup", searchCustomers);

    document
        .getElementById("cityFilter")
        ?.addEventListener("change", filterCustomers);

}

/*==========================================
        MODAL
==========================================*/

function openModal() {

    document
        .getElementById("customerModal")
        .classList.add("show");

}

function closeModal() {

    document
        .getElementById("customerModal")
        .classList.remove("show");

    document
        .getElementById("customerForm")
        .reset();

    editIndex = -1;

}

/*==========================================
        SAVE CUSTOMER
==========================================*/

function saveCustomer(e) {

    e.preventDefault();

    const customer = {

        name: document.getElementById("customerName").value,

        mobile: document.getElementById("customerMobile").value,

        email: document.getElementById("customerEmail").value,

        dob: document.getElementById("customerDob").value,

        address: document.getElementById("customerAddress").value,

        city: document.getElementById("customerCity").value,

        state: document.getElementById("customerState").value,

        pincode: document.getElementById("customerPincode").value,

        status: document.getElementById("customerStatus").value,

        notes: document.getElementById("customerNotes").value,

        purchase: "₹0",

        lastPurchase: "-"

    };

    if (editIndex === -1) {

        customers.push(customer);

        showToast("Customer Added Successfully");

    }
    else {

        customers[editIndex] = customer;

        showToast("Customer Updated Successfully");

    }

    localStorage.setItem(

        "customers",

        JSON.stringify(customers)

    );

    renderCustomers();

    closeModal();

}

/*==========================================
        LOAD CUSTOMERS
==========================================*/

function loadCustomers() {

    const data = localStorage.getItem("customers");

    if (data) {

        customers = JSON.parse(data);

        renderCustomers();

    }

}
/*==========================================
        RENDER CUSTOMERS
==========================================*/

function renderCustomers() {

    const table = document.getElementById("customerTable");

    if (!table) return;

    table.innerHTML = "";

    customers.forEach((customer, index) => {

        const initials = customer.name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

        const statusClass =
            customer.status === "Active"
                ? "active"
                : "inactive";

        table.innerHTML += `

        <tr>

            <td>

                <div class="customer-info">

                    <div class="customer-avatar">

                        ${initials}

                    </div>

                    <div>

                        <strong>${customer.name}</strong>

                        <small>

                            Customer ID :
                            C${String(index + 1).padStart(3, "0")}

                        </small>

                    </div>

                </div>

            </td>

            <td>${customer.mobile}</td>

            <td>${customer.city}</td>

            <td>${customer.email || "-"}</td>

            <td>${customer.purchase}</td>

            <td>${customer.lastPurchase}</td>

            <td>

                <span class="status ${statusClass}">

                    ${customer.status}

                </span>

            </td>

            <td>

                <button
                class="icon-btn view"
                onclick="viewCustomer(${index})">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                class="icon-btn edit"
                onclick="editCustomer(${index})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                class="icon-btn delete"
                onclick="deleteCustomer(${index})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

    updateSummary();

}

/*==========================================
        VIEW CUSTOMER
==========================================*/

function viewCustomer(index) {

    const customer = customers[index];

    alert(

        `Customer Details

Name : ${customer.name}

Mobile : ${customer.mobile}

Email : ${customer.email || "-"}

City : ${customer.city}

State : ${customer.state}

Purchase : ${customer.purchase}

Last Purchase : ${customer.lastPurchase}`

    );

}

/*==========================================
        EDIT CUSTOMER
==========================================*/

function editCustomer(index) {

    editIndex = index;

    const customer = customers[index];

    document.getElementById("customerName").value = customer.name;
    document.getElementById("customerMobile").value = customer.mobile;
    document.getElementById("customerEmail").value = customer.email;
    document.getElementById("customerDob").value = customer.dob;
    document.getElementById("customerAddress").value = customer.address;
    document.getElementById("customerCity").value = customer.city;
    document.getElementById("customerState").value = customer.state;
    document.getElementById("customerPincode").value = customer.pincode;
    document.getElementById("customerStatus").value = customer.status;
    document.getElementById("customerNotes").value = customer.notes;

    openModal();

}

/*==========================================
        DELETE CUSTOMER
==========================================*/

function deleteCustomer(index) {

    if (!confirm("Delete this customer?"))

        return;

    customers.splice(index, 1);

    localStorage.setItem(

        "customers",

        JSON.stringify(customers)

    );

    renderCustomers();

    showToast("Customer Deleted");

}

/*==========================================
        SEARCH
==========================================*/

function searchCustomers() {

    const keyword = document
        .getElementById("searchCustomer")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#customerTable tr");

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

function filterCustomers() {

    const city = document
        .getElementById("cityFilter")
        .value;

    const rows = document.querySelectorAll("#customerTable tr");

    rows.forEach(row => {

        if (city === "") {

            row.style.display = "";

            return;

        }

        row.style.display =

            row.innerText.includes(city)

                ? ""

                : "none";

    });

}

/*==========================================
        SUMMARY
==========================================*/

function updateSummary() {

    const total = document.getElementById("totalCustomers");

    if (total) {

        total.innerHTML = customers.length;

    }

    const count = document.getElementById("customerCount");

    if (count) {

        count.innerHTML =

            `Total Customers : ${customers.length}`;

    }

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
        DEMO DATA
==========================================*/

if (customers.length === 0) {

    customers = [

        {
            name: "Denish Makadiya",
            mobile: "9876543210",
            email: "denish@email.com",
            dob: "",
            address: "Ahmedabad",
            city: "Ahmedabad",
            state: "Gujarat",
            pincode: "382481",
            status: "Active",
            notes: "",
            purchase: "₹12,450",
            lastPurchase: "05 Aug 2026"
        },

        {
            name: "Rahul Patel",
            mobile: "9988776655",
            email: "rahul@email.com",
            dob: "",
            address: "Rajkot",
            city: "Rajkot",
            state: "Gujarat",
            pincode: "360001",
            status: "Active",
            notes: "",
            purchase: "₹8,950",
            lastPurchase: "03 Aug 2026"
        }

    ];

    localStorage.setItem(

        "customers",

        JSON.stringify(customers)

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

        renderCustomers();

        showToast("Customers Loaded Successfully");

    }, 500);

});

/*==========================================
        AUTO SAVE
==========================================*/

window.addEventListener("beforeunload", () => {

    localStorage.setItem(

        "customers",

        JSON.stringify(customers)

    );

});

/*==========================================
        END OF FILE
==========================================*/