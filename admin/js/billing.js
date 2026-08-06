"use strict";

/*==========================================
        BILLING MODULE
==========================================*/

let billItems = [];
let invoiceCounter = 1;

/*==========================================
        INIT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeBilling();

});

/*==========================================
        INITIALIZE
==========================================*/

function initializeBilling(){

    generateInvoice();

    setCurrentDate();

    bindEvents();

    updateTotals();

}

/*==========================================
        EVENTS
==========================================*/

function bindEvents(){

    document
        .getElementById("addItemBtn")
        ?.addEventListener("click",addNewRow);

    document
        .getElementById("discount")
        ?.addEventListener("input",updateTotals);

    document
        .getElementById("discountType")
        ?.addEventListener("change",updateTotals);

    document
        .getElementById("saveBill")
        ?.addEventListener("click",saveBill);

    document
        .getElementById("newBill")
        ?.addEventListener("click",newBill);

}

/*==========================================
        INVOICE NUMBER
==========================================*/

function generateInvoice(){

    let no = localStorage.getItem("invoiceCounter");

    if(no){

        invoiceCounter=parseInt(no);

    }

    document.getElementById("invoiceNo").value=

    "INV-"+String(invoiceCounter).padStart(4,"0");

}

/*==========================================
        DATE
==========================================*/

function setCurrentDate(){

    const today=new Date().toISOString().split("T")[0];

    document.getElementById("billDate").value=today;

}

/*==========================================
        ADD ROW
==========================================*/

function addNewRow(){

    const tbody=document.getElementById("billingTableBody");

    const row=document.createElement("tr");

    row.innerHTML=`

    <td>

        <select class="product-select">

            <option>Select Product</option>

            <option>Ashwagandha Powder</option>

            <option>Brahmi Hair Oil</option>

            <option>Neem Capsule</option>

            <option>Amla Juice</option>

        </select>

    </td>

    <td>

        <input
        type="number"
        class="qty"
        value="1"
        min="1">

    </td>

    <td>

        <input
        type="number"
        class="rate"
        value="0">

    </td>

    <td class="amount">

        ₹0

    </td>

    <td>

        <button
        class="icon-btn delete"
        onclick="removeRow(this)">

        <i class="fa-solid fa-trash"></i>

        </button>

    </td>

    `;

    tbody.appendChild(row);

    attachRowEvents(row);

}

/*==========================================
        REMOVE ROW
==========================================*/

function removeRow(btn){

    btn.closest("tr").remove();

    updateTotals();

}

/*==========================================
        ROW EVENTS
==========================================*/

function attachRowEvents(row){

    const qty=row.querySelector(".qty");
    const rate=row.querySelector(".rate");
    const product=row.querySelector(".product-select");

    qty.addEventListener("input",()=>{

        calculateRow(row);

    });

    rate.addEventListener("input",()=>{

        calculateRow(row);

    });

    product.addEventListener("change",()=>{

        setProductPrice(row);

    });

}

/*==========================================
        PRODUCT PRICE
==========================================*/

function setProductPrice(row){

    const product=row.querySelector(".product-select").value;
    const rate=row.querySelector(".rate");

    switch(product){

        case "Ashwagandha Powder":
            rate.value=399;
        break;

        case "Brahmi Hair Oil":
            rate.value=249;
        break;

        case "Neem Capsule":
            rate.value=299;
        break;

        case "Amla Juice":
            rate.value=199;
        break;

        default:
            rate.value=0;

    }

    calculateRow(row);

}

/*==========================================
        CALCULATE ROW
==========================================*/

function calculateRow(row){

    const qty=parseFloat(row.querySelector(".qty").value)||0;

    const rate=parseFloat(row.querySelector(".rate").value)||0;

    const amount=qty*rate;

    row.querySelector(".amount").innerHTML=

    "₹"+amount.toFixed(2);

    updateTotals();

}

/*==========================================
        UPDATE TOTAL
==========================================*/

function updateTotals(){

    let subtotal=0;

    document.querySelectorAll("#billingTableBody tr")
    .forEach(row=>{

        const qty=parseFloat(
            row.querySelector(".qty")?.value
        )||0;

        const rate=parseFloat(
            row.querySelector(".rate")?.value
        )||0;

        subtotal+=qty*rate;

    });

    let discount=parseFloat(

        document.getElementById("discount").value

    )||0;

    const type=document
        .getElementById("discountType")
        .value;

    let grand=subtotal;

    if(type==="percent"){

        grand=subtotal-(subtotal*discount/100);

    }else{

        grand=subtotal-discount;

    }

    if(grand<0){

        grand=0;

    }

    document.getElementById("subTotal").innerHTML=

    "₹"+subtotal.toFixed(2);

    document.getElementById("grandTotal").innerHTML=

    "₹"+grand.toFixed(2);

}

/*==========================================
        INITIAL ROW
==========================================*/

window.addEventListener("load",()=>{

    document.querySelectorAll("#billingTableBody tr")
    .forEach(row=>{

        attachRowEvents(row);

    });

    updateTotals();

});

/*==========================================
        SAVE BILL
==========================================*/

function saveBill(){

    const invoiceNo=document.getElementById("invoiceNo").value;
    const customer=document.getElementById("customerName").value || "Walk-in Customer";
    const mobile=document.getElementById("customerMobile").value;
    const billDate=document.getElementById("billDate").value;

    const payment=document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    const subtotal=document.getElementById("subTotal").innerText;
    const total=document.getElementById("grandTotal").innerText;

    const items=[];

    document.querySelectorAll("#billingTableBody tr")
    .forEach(row=>{

        items.push({

            product:row.querySelector(".product-select").value,

            qty:row.querySelector(".qty").value,

            rate:row.querySelector(".rate").value,

            amount:row.querySelector(".amount").innerText

        });

    });

    const bill={

        invoiceNo,

        customer,

        mobile,

        billDate,

        payment,

        subtotal,

        total,

        items

    };

    const bills=

    JSON.parse(localStorage.getItem("bills")) || [];

    bills.push(bill);

    localStorage.setItem(

        "bills",

        JSON.stringify(bills)

    );

    invoiceCounter++;

    localStorage.setItem(

        "invoiceCounter",

        invoiceCounter

    );

    generateInvoice();

    loadHistory();

    showToast("Bill Saved Successfully");

}

/*==========================================
        NEW BILL
==========================================*/

function newBill(){

    document.getElementById("customerName").value="";
    document.getElementById("customerMobile").value="";
    document.getElementById("discount").value=0;
    document.getElementById("discountType").value="amount";

    const tbody=document.getElementById("billingTableBody");

    tbody.innerHTML="";

    addNewRow();

    updateTotals();

}

/*==========================================
        LOAD HISTORY
==========================================*/

function loadHistory(){

    const table=document.getElementById("historyTable");

    if(!table) return;

    const bills=

    JSON.parse(localStorage.getItem("bills")) || [];

    table.innerHTML="";

    bills.reverse().forEach(bill=>{

        table.innerHTML += `

        <tr>

            <td>${bill.invoiceNo}</td>

            <td>${bill.customer}</td>

            <td>${bill.billDate}</td>

            <td>

                <span class="payment ${bill.payment.toLowerCase()}">

                    ${bill.payment}

                </span>

            </td>

            <td>${bill.total}</td>

            <td>

                <button
                class="icon-btn view">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                class="icon-btn print">

                    <i class="fa-solid fa-print"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

/*==========================================
        PRINT BILL
==========================================*/

document.getElementById("printBill")
?.addEventListener("click",()=>{

    window.print();

});

/*==========================================
        WHATSAPP
==========================================*/

document.getElementById("whatsappBill")
?.addEventListener("click",()=>{

    const customer=document.getElementById("customerName").value || "Customer";

    const total=document.getElementById("grandTotal").innerText;

    const msg=

`Hello ${customer},

Thank you for shopping with PranVeda.

Invoice Total : ${total}

Regards,
PranVeda`;

    window.open(

        "https://wa.me/?text="+encodeURIComponent(msg),

        "_blank"

    );

});

/*==========================================
        TOAST
==========================================*/

function showToast(message){

    const toast=document.getElementById("toast");

    if(!toast) return;

    toast.innerHTML=message;

    toast.style.display="block";

    setTimeout(()=>{

        toast.style.display="none";

    },2500);

}

/*==========================================
        STARTUP
==========================================*/

window.addEventListener("load",()=>{

    loadHistory();

    addNewRow();

});


"use strict";

/*==========================================
        BILLING ERP V2
==========================================*/

let billItems = [];
let selectedCustomer = null;
let selectedProduct = null;

/*==========================================
        INIT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeBilling();

});

function initializeBilling(){

    loadProducts();

    loadCustomers();

    generateInvoice();

    bindEvents();

}

/*==========================================
        EVENTS
==========================================*/

function bindEvents(){

    document
        .getElementById("productSelect")
        ?.addEventListener("change",onProductChange);

    document
        .getElementById("customerMobile")
        ?.addEventListener("keyup",searchCustomer);

    document
        .getElementById("addItem")
        ?.addEventListener("click",addItem);

    document
        .getElementById("saveBill")
        ?.addEventListener("click",saveBill);

}

/*==========================================
        INVOICE
==========================================*/

function generateInvoice(){

    const invoice=ERP.generateInvoiceNumber();

    const el=document.getElementById("invoiceNumber");

    if(el){

        el.value=invoice;

    }

}

/*==========================================
        LOAD PRODUCTS
==========================================*/

function loadProducts(){

    const products=ERP.getProducts();

    const select=document.getElementById("productSelect");

    if(!select) return;

    select.innerHTML="";

    select.innerHTML+=`
        <option value="">
            Select Product
        </option>
    `;

    products.forEach(product=>{

        select.innerHTML+=`

            <option value="${product.id}">

                ${product.name}

                (${product.stock})

            </option>

        `;

    });

}

/*==========================================
        LOAD CUSTOMERS
==========================================*/

function loadCustomers(){

    window.customerList=

        ERP.getCustomers();

}

/*==========================================
        CUSTOMER SEARCH
==========================================*/

function searchCustomer(){

    const mobile=document
        .getElementById("customerMobile")
        .value
        .trim();

    if(mobile.length<10){

        return;

    }

    const customer=ERP.findCustomer(mobile);

    if(!customer){

        return;

    }

    selectedCustomer=customer;

    setValue("customerName",customer.name);

    setValue("customerAddress",customer.address);

}

/*==========================================
        PRODUCT CHANGE
==========================================*/

function onProductChange(){

    const id=document
        .getElementById("productSelect")
        .value;

    if(!id){

        return;

    }

    const product=ERP.findProduct(id);

    if(!product){

        return;

    }

    selectedProduct=product;

    setValue("productPrice",product.price);

    setValue("availableStock",product.stock);

    setValue("productUnit",product.unit);

}

/*==========================================
        ADD ITEM
==========================================*/

function addItem(){

    if(!selectedProduct){

        showToast("Select Product");

        return;

    }

    const qty=parseFloat(

        getValue("productQty")

    )||1;

    if(qty<=0){

        showToast("Invalid Quantity");

        return;

    }

    if(qty>selectedProduct.stock){

        showToast("Insufficient Stock");

        return;

    }

    const total=qty*Number(selectedProduct.price);

    billItems.push({

        productId:selectedProduct.id,

        name:selectedProduct.name,

        price:Number(selectedProduct.price),

        qty:qty,

        total:total

    });

    renderBillItems();

}

/*==========================================
        BILL TABLE
==========================================*/

function renderBillItems(){

    const tbody=document.getElementById("billItems");

    if(!tbody){

        return;

    }

    tbody.innerHTML="";

    let grandTotal=0;

    billItems.forEach((item,index)=>{

        grandTotal+=item.total;

        tbody.innerHTML+=`

        <tr>

            <td>${item.name}</td>

            <td>${item.qty}</td>

            <td>₹${item.price}</td>

            <td>₹${item.total}</td>

            <td>

                <button
                    class="icon-btn delete"
                    onclick="removeItem(${index})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

    const total=document.getElementById("grandTotal");

    if(total){

        total.innerHTML="₹"+grandTotal.toFixed(2);

    }

}

/*==========================================
        REMOVE ITEM
==========================================*/

function removeItem(index){

    billItems.splice(index,1);

    renderBillItems();

}

/*==========================================
        HELPERS
==========================================*/

function setValue(id,value){

    const el=document.getElementById(id);

    if(el){

        el.value=value;

    }

}

function getValue(id){

    const el=document.getElementById(id);

    return el ? el.value.trim() : "";

}

/*==========================================
        SAVE BILL
==========================================*/

function saveBill(){

    if(billItems.length===0){

        showToast("Add at least one product");

        return;

    }

    const customerName=getValue("customerName");
    const customerMobile=getValue("customerMobile");

    if(customerName===""){

        showToast("Enter Customer Name");

        return;

    }

    if(customerMobile===""){

        showToast("Enter Mobile Number");

        return;

    }

    const bill={

        invoice:ERP.generateInvoiceNumber(),

        customer:customerName,

        mobile:customerMobile,

        address:getValue("customerAddress"),

        payment:getValue("paymentMethod"),

        date:new Date().toLocaleDateString("en-IN"),

        items:[...billItems],

        total:getGrandTotal()

    };

    ERP.completeBilling(bill);

    showToast("Bill Saved Successfully");

    clearBilling();

}

/*==========================================
        GRAND TOTAL
==========================================*/

function getGrandTotal(){

    return billItems.reduce(

        (sum,item)=>sum+Number(item.total),

        0

    );

}

/*==========================================
        CLEAR BILL
==========================================*/

function clearBilling(){

    billItems=[];

    selectedCustomer=null;

    selectedProduct=null;

    document.getElementById("settingsForm")?.reset();

    document.getElementById("billingForm")?.reset();

    renderBillItems();

    loadProducts();

    generateInvoice();

}

/*==========================================
        REFRESH PRODUCTS
==========================================*/

function refreshProducts(){

    loadProducts();

    selectedProduct=null;

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
        PAGE LOAD
==========================================*/

window.addEventListener("load",()=>{

    refreshProducts();

    renderBillItems();

});

/*==========================================
        END
==========================================*/