/* =========================================
   PRANVEDA ADMIN PANEL
========================================= */

// -------------------------------
// Login Check
// -------------------------------

const isLoggedIn = localStorage.getItem("adminLoggedIn");

const currentPage = window.location.pathname.split("/").pop();

if (
    currentPage !== "login.html" &&
    isLoggedIn !== "true"
) {
    window.location.href = "login.html";
}

// -------------------------------
// Logout
// -------------------------------

const logoutBtn = document.querySelector('a[href="login.html"]');

if (logoutBtn) {

    logoutBtn.addEventListener("click", function (e) {

        e.preventDefault();

        if (confirm("Do you want to logout?")) {

            localStorage.removeItem("adminLoggedIn");

            window.location.href = "login.html";

        }

    });

}

// -------------------------------
// Active Menu
// -------------------------------

const menuLinks = document.querySelectorAll(".menu li");

menuLinks.forEach(item => {

    item.classList.remove("active");

    const link = item.querySelector("a");

    if (!link) return;

    if (link.getAttribute("href") === currentPage) {

        item.classList.add("active");

    }

});

// -------------------------------
// Card Animation
// -------------------------------

const cards = document.querySelectorAll(".card");

cards.forEach((card, index) => {

    card.style.opacity = "0";

    card.style.transform = "translateY(20px)";

    setTimeout(() => {

        card.style.transition = ".5s";

        card.style.opacity = "1";

        card.style.transform = "translateY(0px)";

    }, index * 150);

});

// -------------------------------
// Table Animation
// -------------------------------

const table = document.querySelector(".recent-orders");

if (table) {

    table.style.opacity = "0";

    table.style.transform = "translateY(30px)";

    setTimeout(() => {

        table.style.transition = ".6s";

        table.style.opacity = "1";

        table.style.transform = "translateY(0px)";

    }, 500);

}

// -------------------------------
// Dashboard Welcome
// -------------------------------

console.log("🌿 PranVeda Admin Loaded");

/* ==========================================
        PRANVEDA BILLING SYSTEM
========================================== */

const invoiceNo = document.getElementById("invoiceNo");
const invoiceDate = document.getElementById("invoiceDate");

const product = document.getElementById("product");
const qty = document.getElementById("qty");
const price = document.getElementById("price");

const addProduct = document.getElementById("addProduct");

const tbody = document.querySelector("#invoiceTable tbody");

const subtotal = document.getElementById("subtotal");
const discount = document.getElementById("discount");
const gst = document.getElementById("gst");
const grandTotal = document.getElementById("grandTotal");

const saveBill = document.getElementById("saveBill");
const printBill = document.getElementById("printBill");
const pdfBill = document.getElementById("pdfBill");
const whatsappBill = document.getElementById("whatsappBill");
const newBill = document.getElementById("newBill");

let items = [];


//=========================================
// Invoice Number
//=========================================

function generateInvoice(){

let number = localStorage.getItem("invoiceNumber");

if(number==null){

number=1;

}else{

number=parseInt(number)+1;

}

localStorage.setItem("invoiceNumber",number);

invoiceNo.value="PV"+String(number).padStart(6,"0");

}

generateInvoice();


//=========================================
// Today's Date
//=========================================

invoiceDate.value=new Date().toISOString().split("T")[0];


//=========================================
// Product Price
//=========================================

/*=========================================
        LOAD PRODUCTS
=========================================*/

function loadProducts(){

    if(!product) return;

    let data =
    JSON.parse(localStorage.getItem("PranVedaProducts")) || [];

    product.innerHTML = "";

    product.innerHTML +=
    `<option value="">Select Product</option>`;

    data.forEach(item=>{

        product.innerHTML += `

        <option

            value="${item.name}"

            data-price="${item.price}"

            data-stock="${item.stock}"

        >

            ${item.name}

        </option>

        `;

    });

}

loadProducts();

/*=========================================
        PRODUCT CHANGE
=========================================*/

if(product){

product.addEventListener("change",()=>{

let option =
product.options[product.selectedIndex];

price.value =
option.getAttribute("data-price") || "";

});

}
//=========================================
// Add Product
//=========================================

addProduct.addEventListener("click",()=>{

if(product.selectedIndex==0){

alert("Select Product");

return;

}

let q=parseInt(qty.value);

let p=parseFloat(price.value);

let total=q*p;
let selected =
product.options[product.selectedIndex];

let stock =
parseInt(
selected.getAttribute("data-stock")
);
items.push({

name:product.value,

qty:q,

price:p,

stock:stock,

total:total

});


//=========================================
// Table
//=========================================

function renderTable(){

tbody.innerHTML="";

let sub=0;

items.forEach((item,index)=>{

sub+=item.total;

tbody.innerHTML+=`

<tr>

<td>${item.name}</td>

<td>${item.qty}</td>

<td>₹${item.price}</td>

<td>₹${item.total}</td>

<td>

<button onclick="removeItem(${index})">

❌

</button>

</td>

</tr>

`;

});

let gstValue=sub*0.05;

let discountValue=0;

let grand=sub+gstValue-discountValue;

subtotal.innerHTML="₹"+sub.toFixed(2);

discount.innerHTML="₹"+discountValue.toFixed(2);

gst.innerHTML="₹"+gstValue.toFixed(2);

grandTotal.innerHTML="₹"+grand.toFixed(2);

}


//=========================================
// Remove Item
//=========================================

function removeItem(index){

items.splice(index,1);

renderTable();

}


//=========================================
// Save Bill
//=========================================

saveBill.addEventListener("click",()=>{

if(items.length==0){

alert("Please Add Product");

return;

}/*=========================================
        SAVE BILL
=========================================*/
const customerName=document.getElementById("customerName");

const customerPhone=document.getElementById("customerPhone");

const customerAddress=document.getElementById("customerAddress");
saveBill.addEventListener("click",()=>{

    if(items.length===0){

        alert("Please add at least one product.");

        return;

    }

    if(customerName.value.trim()===""){

        alert("Enter Customer Name");

        customerName.focus();

        return;

    }

    if(customerPhone.value.trim()===""){

        alert("Enter Mobile Number");

        customerPhone.focus();

        return;

    }

    let order={

        invoice:invoiceNo.value,

        date:invoiceDate.value,

        customer:customerName.value,

        phone:customerPhone.value,

        address:customerAddress.value,

        products:items,

        total:parseFloat(
            grandTotal.innerText.replace("₹","")
        ),

        status:"Paid"

    };

    let allOrders=
        JSON.parse(localStorage.getItem("pranvedaOrders")) || [];

    allOrders.push(order);

    localStorage.setItem(
        "pranvedaOrders",
        JSON.stringify(allOrders)
    );

    alert("Bill Saved Successfully");

    saveBill.disabled=true;

    printBill.disabled=false;

    pdfBill.disabled=false;

    whatsappBill.disabled=false;

    newBill.disabled=false;

});


//=========================================
// Print
//=========================================

printBill.addEventListener("click",()=>{

window.print();

});


//=========================================
// PDF
//=========================================

pdfBill.addEventListener("click",()=>{

alert("PDF Feature Phase 2");

});


//=========================================
// WhatsApp
//=========================================

whatsappBill.addEventListener("click",()=>{

let text=

"Invoice : "+invoiceNo.value+

"%0AAmount : "+grandTotal.innerText;

window.open(

"https://wa.me/?text="+text,

"_blank"

);

});


//=========================================
// New Bill
//=========================================

newBill.addEventListener("click",()=>{

    if(confirm("Create New Bill?")){

        items=[];

        tbody.innerHTML="";

        customerName.value="";
        customerPhone.value="";
        customerAddress.value="";

        product.selectedIndex=0;

        qty.value=1;

        price.value="";

        subtotal.innerHTML="₹0";
        discount.innerHTML="₹0";
        gst.innerHTML="₹0";
        grandTotal.innerHTML="₹0";

        generateInvoice();

        saveBill.disabled=false;

        printBill.disabled=true;
        pdfBill.disabled=true;
        whatsappBill.disabled=true;
        newBill.disabled=true;

    }

});

/* ==========================================
        ORDERS PAGE (PART 3A)
========================================== */

const ordersBody = document.getElementById("ordersBody");
const searchOrder = document.getElementById("searchOrder");
const statusFilter = document.getElementById("statusFilter");
const dateFilter = document.getElementById("dateFilter");
const refreshOrders = document.getElementById("refreshOrders");

let orders = [];

/*=========================
 Load Orders
=========================*/

function loadOrders(){

    const data = localStorage.getItem("pranvedaOrders");

    if(data){

        orders = JSON.parse(data);

    }else{

        orders = [];

    }

    renderOrders(orders);

}

/*=========================
 Render Orders
=========================*/

function renderOrders(orderList){

    if(!ordersBody) return;

    ordersBody.innerHTML="";

    if(orderList.length===0){

        ordersBody.innerHTML=`

        <tr>

            <td colspan="7" style="text-align:center;padding:40px;">

                No Orders Found

            </td>

        </tr>

        `;

        updateSummary([]);

        return;

    }

    orderList.forEach((order,index)=>{

        ordersBody.innerHTML+=`

        <tr>

            <td>${order.invoice}</td>

            <td>${order.date}</td>

            <td>${order.customer}</td>

            <td>${order.phone}</td>

            <td>₹${order.total}</td>

            <td>

                <span class="status ${order.status.toLowerCase()}">

                    ${order.status}

                </span>

            </td>

            <td>

                <button class="table-btn view" onclick="viewOrder(${index})">

                    <i class="fas fa-eye"></i>

                </button>

                <button class="table-btn edit" onclick="editOrder(${index})">

                    <i class="fas fa-pen"></i>

                </button>

                <button class="table-btn print" onclick="printOrder(${index})">

                    <i class="fas fa-print"></i>

                </button>

                <button class="table-btn delete" onclick="deleteOrder(${index})">

                    <i class="fas fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

    updateSummary(orderList);

}

/*=========================
 Search
=========================*/

if(searchOrder){

searchOrder.addEventListener("keyup",()=>{

const value=searchOrder.value.toLowerCase();

const result=orders.filter(order=>

order.invoice.toLowerCase().includes(value)

||

order.customer.toLowerCase().includes(value)

||

order.phone.toLowerCase().includes(value)

);

renderOrders(result);

});

}

/*=========================
 Status Filter
=========================*/

if(statusFilter){

statusFilter.addEventListener("change",()=>{

const status=statusFilter.value;

if(status==="all"){

renderOrders(orders);

return;

}

const result=orders.filter(order=>

order.status.toLowerCase()===status

);

renderOrders(result);

});

}

/*=========================
 Date Filter
=========================*/

if(dateFilter){

dateFilter.addEventListener("change",()=>{

const date=dateFilter.value;

if(date===""){

renderOrders(orders);

return;

}

const result=orders.filter(order=>

order.date===date

);

renderOrders(result);

});

}

/*=========================
 Summary
=========================*/

function updateSummary(list){

const totalOrders=document.getElementById("totalOrders");
const totalSales=document.getElementById("totalSales");
const pendingOrders=document.getElementById("pendingOrders");
const paidOrders=document.getElementById("paidOrders");

if(!totalOrders) return;

totalOrders.innerHTML=list.length;

let sales=0;
let paid=0;
let pending=0;

list.forEach(order=>{

sales+=Number(order.total);

if(order.status==="Paid"){

paid++;

}else{

pending++;

}

});

totalSales.innerHTML="₹"+sales;

paidOrders.innerHTML=paid;

pendingOrders.innerHTML=pending;

}

/*=========================
 Refresh
=========================*/

if(refreshOrders){

refreshOrders.addEventListener("click",()=>{

loadOrders();

});

}

/*=========================
 Auto Load
=========================*/

loadOrders();

/* ==========================================
        ORDERS PAGE (PART 3B)
========================================== */


/*=========================
 View Order
=========================*/

function viewOrder(index){

    const order = orders[index];

    if(!order) return;

    alert(

`Invoice : ${order.invoice}

Customer : ${order.customer}

Phone : ${order.phone}

Amount : ₹${order.total}

Status : ${order.status}`

    );

}


/*=========================
 Edit Order
=========================*/

function editOrder(index){

    const order = orders[index];

    if(!order) return;

    localStorage.setItem("editInvoice",JSON.stringify(order));

    window.location.href="billing.html";

}


/*=========================
 Delete Order
=========================*/

function deleteOrder(index){

    if(!confirm("Delete this Order ?")) return;

    orders.splice(index,1);

    localStorage.setItem(

        "pranvedaOrders",

        JSON.stringify(orders)

    );

    renderOrders(orders);

}


/*=========================
 Print Order
=========================*/

function printOrder(index){

    const order=orders[index];

    if(!order) return;

    let printWindow=window.open("","","width=900,height=700");

    printWindow.document.write(`

<html>

<head>

<title>${order.invoice}</title>

<style>

body{

font-family:Arial;

padding:30px;

}

h1{

color:#1B5E20;

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

th,td{

border:1px solid #ddd;

padding:10px;

text-align:left;

}

th{

background:#1B5E20;

color:white;

}

.total{

margin-top:20px;

font-size:20px;

font-weight:bold;

}

</style>

</head>

<body>

<h1>🌿 PranVeda Invoice</h1>

<hr>

<p>

<b>Invoice :</b>

${order.invoice}

</p>

<p>

<b>Date :</b>

${order.date}

</p>

<p>

<b>Customer :</b>

${order.customer}

</p>

<p>

<b>Phone :</b>

${order.phone}

</p>

<table>

<tr>

<th>Amount</th>

<th>Status</th>

</tr>

<tr>

<td>₹${order.total}</td>

<td>${order.status}</td>

</tr>

</table>

<div class="total">

Grand Total : ₹${order.total}

</div>

</body>

</html>

`);

    printWindow.document.close();

    printWindow.print();

}


/*=========================
 Demo Data
=========================*/

if(localStorage.getItem("pranvedaOrders")==null){

let sample=[

{

invoice:"PV000001",

date:"2026-08-05",

customer:"Rahul Patel",

phone:"9876543210",

total:399,

status:"Paid"

},

{

invoice:"PV000002",

date:"2026-08-05",

customer:"Amit Shah",

phone:"9988776655",

total:799,

status:"Pending"

}

];

localStorage.setItem(

"pranvedaOrders",

JSON.stringify(sample)

);

loadOrders();

}


/*=========================================
        PRODUCTS PAGE
=========================================*/

const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const mrp = document.getElementById("mrp");
const sellingPrice = document.getElementById("sellingPrice");
const stock = document.getElementById("stock");
const status = document.getElementById("status");
const imageUrl = document.getElementById("imageUrl");

const addNewProduct = document.getElementById("addNewProduct");

const productBody = document.getElementById("productBody");

const searchProduct = document.getElementById("searchProduct");

let products = JSON.parse(localStorage.getItem("PranVedaProducts")) || [];

let editIndex = -1;


/*==============================
Load Products
==============================*/

renderProducts();


/*==============================
Render Products
==============================*/

function renderProducts(list = products){

    if(!productBody) return;

    productBody.innerHTML="";

    list.forEach((product,index)=>{

        productBody.innerHTML +=`

<tr>

<td>

<img
src="${product.image}"
class="product-image"
onerror="this.src='../assets/images/no-image.png'">

</td>

<td>${product.name}</td>

<td>${product.category}</td>

<td>₹${product.mrp}</td>

<td>₹${product.price}</td>

<td>${product.stock}</td>

<td>

<span class="stock-badge ${product.status=='In Stock' ? 'stock-in':'stock-out'}">

${product.status}

</span>

</td>

<td>

<div class="product-action">

<button
class="product-edit"
onclick="editProduct(${index})">

<i class="fas fa-pen"></i>

</button>

<button
class="product-delete"
onclick="deleteProduct(${index})">

<i class="fas fa-trash"></i>

</button>

</div>

</td>

</tr>

`;

    });

}


/*==============================
Add Product
==============================*/

if(addNewProduct){

addNewProduct.addEventListener("click",()=>{

    if(productName.value==""){

        alert("Enter Product Name");

        return;

    }

    let obj={

        name:productName.value,

        category:productCategory.value,

        mrp:mrp.value,

        price:sellingPrice.value,

        stock:stock.value,

        status:status.value,

        image:imageUrl.value

    };

    if(editIndex==-1){

        products.push(obj);

    }else{

        products[editIndex]=obj;

        editIndex=-1;

        addNewProduct.innerHTML='<i class="fas fa-plus"></i> Add Product';

    }

    localStorage.setItem(

        "PranVedaProducts",

        JSON.stringify(products)

    );

    renderProducts();

    clearForm();

});

}


/*==============================
Clear Form
==============================*/

function clearForm(){

productName.value="";
mrp.value="";
sellingPrice.value="";
stock.value="";
imageUrl.value="";

}


/*==============================
Delete
==============================*/

function deleteProduct(index){

if(!confirm("Delete Product ?")) return;

products.splice(index,1);

localStorage.setItem(

"PranVedaProducts",

JSON.stringify(products)

);

renderProducts();

}


/*==============================
Edit
==============================*/

function editProduct(index){

let p=products[index];

productName.value=p.name;

productCategory.value=p.category;

mrp.value=p.mrp;

sellingPrice.value=p.price;

stock.value=p.stock;

status.value=p.status;

imageUrl.value=p.image;

editIndex=index;

addNewProduct.innerHTML='<i class="fas fa-save"></i> Update Product';

}


/*==============================
Search
==============================*/

if(searchProduct){

searchProduct.addEventListener("keyup",()=>{

let value=searchProduct.value.toLowerCase();

let result=products.filter(item=>

item.name.toLowerCase().includes(value)

||

item.category.toLowerCase().includes(value)

);

renderProducts(result);

});

}


/*==============================
Default Products
==============================*/

if(products.length==0){

products=[

{

name:"Brahmi Hair Oil",

category:"Hair Care",

mrp:499,

price:399,

stock:50,

status:"In Stock",

image:"../assets/images/hair_oil.jpg"

},

{

name:"Kumkumadi Cream",

category:"Skin Care",

mrp:599,

price:499,

stock:25,

status:"In Stock",

image:"../assets/images/face_cream.jpg"

},

{

name:"Ashwagandha Powder",

category:"Wellness",

mrp:399,

price:299,

stock:80,

status:"In Stock",

image:"../assets/images/herbal_powder.jpg"

},

{

name:"Immunity Tonic",

category:"Immunity",

mrp:550,

price:450,

stock:40,

status:"In Stock",

image:"../assets/images/immunity_booster.jpg"

}

];

localStorage.setItem(

"PranVedaProducts",

JSON.stringify(products)

);

renderProducts();

}


/*=========================================
        CUSTOMERS PAGE
=========================================*/

const customerBody = document.getElementById("customerBody");
const searchCustomer = document.getElementById("searchCustomer");

let customers = [];

/*=========================
Load Customers
=========================*/

function loadCustomers(){

    const orders = JSON.parse(localStorage.getItem("pranvedaOrders")) || [];

    let customerMap = {};

    orders.forEach(order=>{

        if(customerMap[order.phone]){

            customerMap[order.phone].orders++;

            customerMap[order.phone].purchase += Number(order.total);

        }else{

            customerMap[order.phone]={

                name:order.customer,

                phone:order.phone,

                address:order.address,

                orders:1,

                purchase:Number(order.total)

            };

        }

    });

    customers = Object.values(customerMap);

    renderCustomers(customers);

}

loadCustomers();


/*=========================
Render Customer
=========================*/

function renderCustomers(list){

    if(!customerBody) return;

    customerBody.innerHTML="";

    let totalPurchase=0;

    list.forEach((customer,index)=>{

        totalPurchase += customer.purchase;

        let badge="badge-new";
        let badgeText="New";

        if(customer.orders>=5){

            badge="badge-premium";
            badgeText="Premium";

        }else if(customer.orders>=2){

            badge="badge-regular";
            badgeText="Regular";

        }

        customerBody.innerHTML +=`

<tr>

<td>

<div class="customer-info">

<div class="customer-avatar">

${customer.name.charAt(0).toUpperCase()}

</div>

<div>

<b>${customer.name}</b><br>

<span class="customer-badge ${badge}">

${badgeText}

</span>

</div>

</div>

</td>

<td>

<a href="https://wa.me/91${customer.phone}" target="_blank">

${customer.phone}

</a>

</td>

<td>${customer.address}</td>

<td>${customer.orders}</td>

<td>₹${customer.purchase}</td>

<td>

<div class="customer-action">

<button

class="customer-view"

onclick="viewCustomer(${index})">

<i class="fas fa-eye"></i>

</button>

<button

class="customer-edit"

onclick="editCustomer(${index})">

<i class="fas fa-pen"></i>

</button>

<button

class="customer-delete"

onclick="deleteCustomer(${index})">

<i class="fas fa-trash"></i>

</button>

</div>

</td>

</tr>

`;

    });

    document.getElementById("totalCustomers").innerHTML=list.length;

    document.getElementById("customerSales").innerHTML="₹"+totalPurchase;

    document.getElementById("newCustomers").innerHTML=
    list.filter(c=>c.orders==1).length;

    document.getElementById("returnCustomers").innerHTML=
    list.filter(c=>c.orders>=2).length;

}


/*=========================
Search
=========================*/

if(searchCustomer){

searchCustomer.addEventListener("keyup",()=>{

let value=searchCustomer.value.toLowerCase();

let result=customers.filter(item=>

item.name.toLowerCase().includes(value)

||

item.phone.includes(value)

);

renderCustomers(result);

});

}


/*=========================
View
=========================*/

function viewCustomer(index){

let c=customers[index];

alert(

`Customer : ${c.name}

Phone : ${c.phone}

Address : ${c.address}

Orders : ${c.orders}

Purchase : ₹${c.purchase}`

);

}


/*=========================
Edit
=========================*/

function editCustomer(index){

let c=customers[index];

let newAddress=prompt(

"Update Address",

c.address

);

if(newAddress==null) return;

c.address=newAddress;

renderCustomers(customers);

}


/*=========================
Delete
=========================*/

function deleteCustomer(index){

if(!confirm("Delete Customer ?")) return;

customers.splice(index,1);

renderCustomers(customers);

}
