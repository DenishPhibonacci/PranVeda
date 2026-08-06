"use strict";

/*==========================================
            SETTINGS MODULE
==========================================*/

let settings = {};

/*==========================================
            INIT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadSettings();

    bindEvents();

    updateDateTime();

    setInterval(updateDateTime, 1000);

});

/*==========================================
            EVENTS
==========================================*/

function bindEvents() {

    document
        .getElementById("settingsForm")
        ?.addEventListener("submit", saveSettings);

    document
        .querySelector(".btn-secondary")
        ?.addEventListener("click", resetSettings);

}

/*==========================================
            LOAD SETTINGS
==========================================*/

function loadSettings() {

    const data = localStorage.getItem("erp_settings");

    if (data) {

        settings = JSON.parse(data);

        fillForm();

    }

}

/*==========================================
            FILL FORM
==========================================*/

function fillForm() {

    setValue("companyName");
    setValue("brandName");
    setValue("ownerName");
    setValue("mobileNumber");
    setValue("whatsappNumber");
    setValue("companyEmail");
    setValue("companyWebsite");
    setValue("companyAddress");
    setValue("companyCity");
    setValue("companyState");
    setValue("companyPincode");
    setValue("companyCountry");
    setValue("businessType");
    setValue("financialYear");
    setValue("timeZone");
    setValue("dateFormat");
    setValue("invoicePrefix");
    setValue("invoiceNumber");
    setValue("currency");
    setValue("currencyPosition");
    setValue("businessWhatsapp");
    setValue("defaultMessage");

    const invoiceCheckbox = document.getElementById("shareInvoice");

    if (invoiceCheckbox) {

        invoiceCheckbox.checked =

            settings.shareInvoice ?? true;

    }

}

/*==========================================
            HELPER
==========================================*/

function setValue(id) {

    const el = document.getElementById(id);

    if (el && settings[id] !== undefined) {

        el.value = settings[id];

    }

}

/*==========================================
            SAVE SETTINGS
==========================================*/

function saveSettings(e) {

    e.preventDefault();

    settings = {

        companyName: getValue("companyName"),
        brandName: getValue("brandName"),
        ownerName: getValue("ownerName"),
        mobileNumber: getValue("mobileNumber"),
        whatsappNumber: getValue("whatsappNumber"),
        companyEmail: getValue("companyEmail"),
        companyWebsite: getValue("companyWebsite"),

        companyAddress: getValue("companyAddress"),
        companyCity: getValue("companyCity"),
        companyState: getValue("companyState"),
        companyPincode: getValue("companyPincode"),
        companyCountry: getValue("companyCountry"),

        businessType: getValue("businessType"),
        financialYear: getValue("financialYear"),
        timeZone: getValue("timeZone"),
        dateFormat: getValue("dateFormat"),

        invoicePrefix: getValue("invoicePrefix"),
        invoiceNumber: getValue("invoiceNumber"),
        currency: getValue("currency"),
        currencyPosition: getValue("currencyPosition"),

        businessWhatsapp: getValue("businessWhatsapp"),
        defaultMessage: getValue("defaultMessage"),

        shareInvoice:
            document.getElementById("shareInvoice").checked

    };

    if (!validatePasswords()) {

        return;

    }

    localStorage.setItem(

        "erp_settings",

        JSON.stringify(settings)

    );

    showToast("Settings Saved Successfully");

}

/*==========================================
            RESET SETTINGS
==========================================*/

function resetSettings(e) {

    e.preventDefault();

    if (!confirm("Reset all settings?")) {

        return;

    }

    document
        .getElementById("settingsForm")
        .reset();

    showToast("Settings Reset");

}

/*==========================================
            PASSWORD VALIDATION
==========================================*/

function validatePasswords() {

    const current = getValue("currentPassword");

    const password = getValue("newPassword");

    const confirmPassword = getValue("confirmPassword");

    if (password === "" && confirmPassword === "") {

        return true;

    }

    if (current === "") {

        showToast("Enter Current Password");

        return false;

    }

    if (password.length < 6) {

        showToast("Password must be at least 6 characters");

        return false;

    }

    if (password !== confirmPassword) {

        showToast("Passwords do not match");

        return false;

    }

    return true;

}

/*==========================================
            HELPERS
==========================================*/

function getValue(id) {

    const el = document.getElementById(id);

    return el ? el.value.trim() : "";

}
/*==========================================
            TOAST
==========================================*/

function showToast(message){

    const toast=document.getElementById("toast");

    if(!toast) return;

    toast.innerHTML=message;

    toast.style.display="block";

    toast.style.opacity="1";

    setTimeout(()=>{

        toast.style.opacity="0";

        setTimeout(()=>{

            toast.style.display="none";

        },300);

    },2500);

}

/*==========================================
            DATE & TIME
==========================================*/

function updateDateTime(){

    const now=new Date();

    const date=document.getElementById("currentDate");

    const time=document.getElementById("currentTime");

    if(date){

        date.innerHTML=now.toLocaleDateString(

            "en-IN",

            {

                weekday:"long",

                day:"numeric",

                month:"long",

                year:"numeric"

            }

        );

    }

    if(time){

        time.innerHTML=now.toLocaleTimeString(

            "en-IN",

            {

                hour:"2-digit",

                minute:"2-digit",

                second:"2-digit"

            }

        );

    }

}

/*==========================================
            LOADER
==========================================*/

function showLoader(){

    const loader=document.querySelector(".loader");

    if(loader){

        loader.style.display="flex";

    }

}

function hideLoader(){

    const loader=document.querySelector(".loader");

    if(loader){

        loader.style.display="none";

    }

}

/*==========================================
            DEFAULT SETTINGS
==========================================*/

if(Object.keys(settings).length===0){

    settings={

        companyName:"PranVeda",

        brandName:"PranVeda",

        ownerName:"Denish Makadiya",

        mobileNumber:"+91 9876543210",

        whatsappNumber:"+91 9876543210",

        companyEmail:"support@pranveda.com",

        companyWebsite:"https://www.pranveda.com",

        companyAddress:"Ahmedabad, Gujarat",

        companyCity:"Ahmedabad",

        companyState:"Gujarat",

        companyPincode:"382481",

        companyCountry:"India",

        businessType:"Ayurvedic Products",

        financialYear:"2026 - 2027",

        timeZone:"(GMT +05:30) India",

        dateFormat:"DD/MM/YYYY",

        invoicePrefix:"INV-",

        invoiceNumber:"1001",

        currency:"INR",

        currencyPosition:"left",

        businessWhatsapp:"+91 9876543210",

        defaultMessage:"Thank you for shopping with PranVeda.",

        shareInvoice:true

    };

    localStorage.setItem(

        "erp_settings",

        JSON.stringify(settings)

    );

}

/*==========================================
            PAGE LOAD
==========================================*/

window.addEventListener("load",()=>{

    showLoader();

    setTimeout(()=>{

        hideLoader();

        fillForm();

        showToast("Settings Loaded Successfully");

    },500);

});

/*==========================================
            AUTO SAVE
==========================================*/

window.addEventListener("beforeunload",()=>{

    localStorage.setItem(

        "erp_settings",

        JSON.stringify(settings)

    );

});

/*==========================================
            END OF FILE
==========================================*/