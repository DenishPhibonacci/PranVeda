"use strict";

/*=========================================
    PRANVEDA ERP
    LOGIN
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeLogin();

});

/*=========================================
    INITIALIZE
=========================================*/

function initializeLogin(){

    loadRememberMe();

    passwordToggle();

    loginForm();

}

/*=========================================
    PASSWORD TOGGLE
=========================================*/

function passwordToggle(){

    const password =
    document.getElementById("password");

    const toggle =
    document.getElementById("togglePassword");

    if(!password || !toggle) return;

    toggle.addEventListener("click",()=>{

        const icon =
        toggle.querySelector("i");

        if(password.type==="password"){

            password.type="text";

            icon.classList.remove("fa-eye");

            icon.classList.add("fa-eye-slash");

        }
        else{

            password.type="password";

            icon.classList.remove("fa-eye-slash");

            icon.classList.add("fa-eye");

        }

    });

}

/*=========================================
    LOGIN
=========================================*/

function loginForm(){

    const form =
    document.getElementById("loginForm");

    if(!form) return;

    form.addEventListener("submit",(e)=>{

        e.preventDefault();

        login();

    });

}

/*=========================================
    LOGIN FUNCTION
=========================================*/

function login(){

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value.trim();

    const remember =
    document.getElementById("rememberMe").checked;

    const button =
    document.getElementById("loginBtn");

    if(email===""){

        alert("Please enter Email.");

        return;

    }

    if(password===""){

        alert("Please enter Password.");

        return;

    }

    /* Demo Login */

    if(
        email==="admin@pranveda.com"
        &&
        password==="123456"
    ){

        if(remember){

            localStorage.setItem("rememberEmail",email);

        }
        else{

            localStorage.removeItem("rememberEmail");

        }

        localStorage.setItem("isLoggedIn","true");

        button.disabled=true;

        button.innerHTML=
        '<i class="fa-solid fa-spinner fa-spin"></i> Logging In...';

        setTimeout(()=>{

            window.location.href="dashboard.html";

        },1200);

    }
    else{

        alert("Invalid Email or Password");

    }

}

/*=========================================
    REMEMBER ME
=========================================*/

function loadRememberMe(){

    const email =
    localStorage.getItem("rememberEmail");

    if(email){

        document.getElementById("email").value=email;

        document.getElementById("rememberMe").checked=true;

    }

}