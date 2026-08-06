"use strict";

/*==========================================
        PRODUCTS MODULE
==========================================*/

let products = [];

let editIndex = -1;

/*==========================================
        INIT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

    bindEvents();

    updateDateTime();

    setInterval(updateDateTime,1000);

});

/*==========================================
        EVENTS
==========================================*/

function bindEvents(){

    document
        .getElementById("addProductBtn")
        ?.addEventListener("click",openModal);

    document
        .querySelectorAll(".close-modal")
        .forEach(btn=>{

            btn.addEventListener("click",closeModal);

        });

    document
        .getElementById("productForm")
        ?.addEventListener("submit",saveProduct);

    document
        .getElementById("searchProduct")
        ?.addEventListener("keyup",searchProducts);

    document
        .getElementById("categoryFilter")
        ?.addEventListener("change",filterProducts);

    document
        .getElementById("statusFilter")
        ?.addEventListener("change",filterProducts);

}

/*==========================================
        MODAL
==========================================*/

function openModal(){

    document
        .getElementById("productModal")
        .classList.add("show");

}

function closeModal(){

    document
        .getElementById("productModal")
        .classList.remove("show");

    document
        .getElementById("productForm")
        .reset();

    editIndex = -1;

}

/*==========================================
        SAVE PRODUCT
==========================================*/

function saveProduct(e){

    e.preventDefault();

    const product={

        name:document.getElementById("productName").value,

        sku:document.getElementById("sku").value,

        brand:document.getElementById("brand").value,

        category:document.getElementById("category").value,

        purchase:document.getElementById("purchasePrice").value,

        mrp:document.getElementById("mrp").value,

        selling:document.getElementById("sellingPrice").value,

        gst:document.getElementById("gst").value,

        stock:document.getElementById("stock").value,

        minStock:document.getElementById("minStock").value,

        expiry:document.getElementById("expiryDate").value,

        status:document.getElementById("status").value,

        description:document.getElementById("description").value

    };

    if(editIndex==-1){

        products.push(product);

        showToast("Product Added Successfully");

    }else{

        products[editIndex]=product;

        showToast("Product Updated");

    }

    localStorage.setItem("products",JSON.stringify(products));

    renderProducts();

    closeModal();

}

/*==========================================
        LOAD
==========================================*/

function loadProducts(){

    const data=localStorage.getItem("products");

    if(data){

        products=JSON.parse(data);

        renderProducts();

    }

}
/*==========================================
        RENDER PRODUCTS
==========================================*/

function renderProducts(){

    const table=document.getElementById("productTable");

    if(!table) return;

    table.innerHTML="";

    products.forEach((product,index)=>{

        const stockClass =
            Number(product.stock)<=Number(product.minStock)
            ? "low"
            : Number(product.stock)<=25
            ? "medium"
            : "good";

        const statusClass =
            product.status==="Active"
            ? "active"
            : "inactive";

        table.innerHTML += `

        <tr>

            <td>

                <img
                src="assets/images/products/product-placeholder.png"
                class="product-image"
                alt="Product">

            </td>

            <td>${product.sku}</td>

            <td>${product.name}</td>

            <td>${product.category}</td>

            <td>${product.brand}</td>

            <td>₹${product.mrp}</td>

            <td>₹${product.selling}</td>

            <td>

                <span class="stock ${stockClass}">

                    ${product.stock}

                </span>

            </td>

            <td>

                <span class="status ${statusClass}">

                    ${product.status}

                </span>

            </td>

            <td>

                <button
                class="icon-btn edit"
                onclick="editProduct(${index})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                class="icon-btn delete"
                onclick="deleteProduct(${index})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

    updateSummary();

}

/*==========================================
        EDIT PRODUCT
==========================================*/

function editProduct(index){

    editIndex=index;

    const p=products[index];

    document.getElementById("productName").value=p.name;
    document.getElementById("sku").value=p.sku;
    document.getElementById("brand").value=p.brand;
    document.getElementById("category").value=p.category;
    document.getElementById("purchasePrice").value=p.purchase;
    document.getElementById("mrp").value=p.mrp;
    document.getElementById("sellingPrice").value=p.selling;
    document.getElementById("gst").value=p.gst;
    document.getElementById("stock").value=p.stock;
    document.getElementById("minStock").value=p.minStock;
    document.getElementById("expiryDate").value=p.expiry;
    document.getElementById("status").value=p.status;
    document.getElementById("description").value=p.description;

    openModal();

}

/*==========================================
        DELETE PRODUCT
==========================================*/

function deleteProduct(index){

    if(!confirm("Delete this product?")) return;

    products.splice(index,1);

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    renderProducts();

    showToast("Product Deleted","success");

}

/*==========================================
        SEARCH
==========================================*/

function searchProducts(){

    const keyword=document
        .getElementById("searchProduct")
        .value
        .toLowerCase();

    const rows=document.querySelectorAll("#productTable tr");

    rows.forEach(row=>{

        row.style.display =
            row.innerText.toLowerCase().includes(keyword)
            ? ""
            : "none";

    });

}

/*==========================================
        FILTER
==========================================*/

function filterProducts(){

    const category=document
        .getElementById("categoryFilter")
        .value;

    const status=document
        .getElementById("statusFilter")
        .value;

    const rows=document.querySelectorAll("#productTable tr");

    rows.forEach(row=>{

        const text=row.innerText;

        const categoryMatch =
            !category || text.includes(category);

        const statusMatch =
            !status || text.includes(status);

        row.style.display =
            categoryMatch && statusMatch
            ? ""
            : "none";

    });

}

/*==========================================
        SUMMARY
==========================================*/

function updateSummary(){

    const total=document.getElementById("totalProducts");

    if(total){

        total.innerHTML=products.length;

    }

    const count=document.getElementById("productCount");

    if(count){

        count.innerHTML=`Total Products : ${products.length}`;

    }

}

/*==========================================
        IMAGE PREVIEW
==========================================*/

const productImage=document.getElementById("productImage");

if(productImage){

    productImage.addEventListener("change",function(){

        const file=this.files[0];

        if(!file) return;

        const reader=new FileReader();

        reader.onload=function(e){

            localStorage.setItem(
                "lastProductImage",
                e.target.result
            );

        };

        reader.readAsDataURL(file);

    });

}

/*==========================================
        TOAST
==========================================*/

function showToast(message,type="success"){

    const toast=document.getElementById("toast");

    if(!toast) return;

    toast.innerHTML=message;

    toast.style.display="block";

    toast.style.opacity="1";

    toast.style.transform="translateY(0)";

    switch(type){

        case "error":

            toast.style.background="#DC2626";

        break;

        case "warning":

            toast.style.background="#F59E0B";

        break;

        default:

            toast.style.background="#2E7D32";

    }

    setTimeout(()=>{

        toast.style.opacity="0";

        toast.style.transform="translateY(20px)";

        setTimeout(()=>{

            toast.style.display="none";

        },300);

    },2500);

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
        DATE TIME
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
        DEMO DATA
==========================================*/

if(products.length===0){

    products=[

        {
            name:"Ashwagandha Powder",
            sku:"PV001",
            brand:"PranVeda",
            category:"Powder",
            purchase:"250",
            mrp:"450",
            selling:"399",
            gst:"12%",
            stock:"120",
            minStock:"10",
            expiry:"2027-12-31",
            status:"Active",
            description:""
        },

        {
            name:"Brahmi Hair Oil",
            sku:"PV002",
            brand:"PranVeda",
            category:"Ayurvedic Oil",
            purchase:"150",
            mrp:"299",
            selling:"249",
            gst:"12%",
            stock:"8",
            minStock:"10",
            expiry:"2027-08-31",
            status:"Active",
            description:""
        }

    ];

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    renderProducts();

}

/*==========================================
        PAGE LOADER
==========================================*/

window.addEventListener("load",()=>{

    showLoader();

    setTimeout(()=>{

        hideLoader();

        showToast("Products Loaded Successfully");

    },500);

});

/*==========================================
        AUTO SAVE
==========================================*/

window.addEventListener("beforeunload",()=>{

    localStorage.setItem(

        "products",

        JSON.stringify(products)

    );

});

/*==========================================
        END OF FILE
==========================================*/