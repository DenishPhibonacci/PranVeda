"use strict";

/* ============================
   PRANVEDA ADMIN LOGIN
============================ */

// Demo Credentials
const DEMO_EMAIL = "admin@pranveda.in";
const DEMO_PASSWORD = "123456";

// Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberCheck = document.getElementById("remember");
const togglePassword = document.getElementById("togglePassword");

// ============================
// Load Remember Me
// ============================

window.addEventListener("load", () => {

    const remember = localStorage.getItem("rememberLogin");

    if (remember === "true") {

        emailInput.value = localStorage.getItem("rememberEmail") || "";
        rememberCheck.checked = true;

    }

});

// ============================
// Show / Hide Password
// ============================

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");

    } else {

        passwordInput.type = "password";

        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");

    }

});

// ============================
// Login
// ============================

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "") {

        alert("Please enter Email.");

        emailInput.focus();

        return;

    }

    if (password === "") {

        alert("Please enter Password.");

        passwordInput.focus();

        return;

    }

    // Demo Login

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {

        if (rememberCheck.checked) {

            localStorage.setItem("rememberLogin", "true");
            localStorage.setItem("rememberEmail", email);

        } else {

            localStorage.removeItem("rememberLogin");
            localStorage.removeItem("rememberEmail");

        }

        localStorage.setItem("isLoggedIn", "true");

        loginSuccess();

    } else {

        alert("Invalid Email or Password");

    }

});

// ============================
// Login Success
// ============================

function loginSuccess() {

    const btn = document.querySelector(".login-btn");

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging In...';

    btn.disabled = true;

    setTimeout(() => {

        window.location.href = "dashboard.html";

    }, 1500);

}