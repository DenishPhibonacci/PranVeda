"use strict";

/* ==========================================
   PRANVEDA ADMIN AUTH
========================================== */

// Check Login

(function () {

    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {

        window.location.replace("login.html");

    }

})();


// Logout

function logout() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    localStorage.removeItem("isLoggedIn");

    window.location.replace("login.html");

}