"use strict";

/*==========================================
        PRANVEDA ERP CORE ENGINE
==========================================*/

const ERP = {

    storage: {

        products: "erp_products",

        customers: "erp_customers",

        bills: "erp_bills",

        orders: "erp_orders",

        settings: "erp_settings"

    }

};

/*==========================================
        STORAGE
==========================================*/

ERP.get = function (key) {

    const data = localStorage.getItem(key);

    if (!data) {

        return [];

    }

    try {

        return JSON.parse(data);

    }

    catch (e) {

        console.error(e);

        return [];

    }

};

ERP.save = function (key, data) {

    localStorage.setItem(

        key,

        JSON.stringify(data)

    );

};

/*==========================================
        PRODUCTS
==========================================*/

ERP.getProducts = function () {

    return ERP.get(

        ERP.storage.products

    );

};

ERP.saveProducts = function (products) {

    ERP.save(

        ERP.storage.products,

        products

    );

};

ERP.addProduct = function (product) {

    const products =

        ERP.getProducts();

    products.push(product);

    ERP.saveProducts(products);

};

/*==========================================
        PRODUCT SEARCH
==========================================*/

ERP.findProduct = function (id) {

    return ERP

        .getProducts()

        .find(x => x.id === id);

};

ERP.updateProduct = function (id, data) {

    const products =

        ERP.getProducts();

    const index =

        products.findIndex(

            x => x.id === id

        );

    if (index >= 0) {

        products[index] = {

            ...products[index],

            ...data

        };

        ERP.saveProducts(products);

    }

};
/*==========================================
        CUSTOMERS
==========================================*/

ERP.getCustomers = function () {

    return ERP.get(

        ERP.storage.customers

    );

};

ERP.saveCustomers = function (customers) {

    ERP.save(

        ERP.storage.customers,

        customers

    );

};

ERP.addCustomer = function (customer) {

    const customers = ERP.getCustomers();

    customers.push(customer);

    ERP.saveCustomers(customers);

};

ERP.findCustomer = function (mobile) {

    return ERP
        .getCustomers()
        .find(x => x.mobile === mobile);

};

ERP.updateCustomer = function (mobile, data) {

    const customers = ERP.getCustomers();

    const index = customers.findIndex(

        x => x.mobile === mobile

    );

    if (index >= 0) {

        customers[index] = {

            ...customers[index],

            ...data

        };

        ERP.saveCustomers(customers);

    }

};

/*==========================================
        ORDERS
==========================================*/

ERP.getOrders = function () {

    return ERP.get(

        ERP.storage.orders

    );

};

ERP.saveOrders = function (orders) {

    ERP.save(

        ERP.storage.orders,

        orders

    );

};

ERP.addOrder = function (order) {

    const orders = ERP.getOrders();

    orders.push(order);

    ERP.saveOrders(orders);

};

ERP.findOrder = function (orderId) {

    return ERP
        .getOrders()
        .find(x => x.orderId === orderId);

};

ERP.updateOrder = function (orderId, data) {

    const orders = ERP.getOrders();

    const index = orders.findIndex(

        x => x.orderId === orderId

    );

    if (index >= 0) {

        orders[index] = {

            ...orders[index],

            ...data

        };

        ERP.saveOrders(orders);

    }

};

/*==========================================
        BILLS
==========================================*/

ERP.getBills = function () {

    return ERP.get(

        ERP.storage.bills

    );

};

ERP.saveBills = function (bills) {

    ERP.save(

        ERP.storage.bills,

        bills

    );

};

ERP.addBill = function (bill) {

    const bills = ERP.getBills();

    bills.push(bill);

    ERP.saveBills(bills);

};

ERP.findBill = function (invoice) {

    return ERP
        .getBills()
        .find(x => x.invoice === invoice);

};

ERP.updateBill = function (invoice, data) {

    const bills = ERP.getBills();

    const index = bills.findIndex(

        x => x.invoice === invoice

    );

    if (index >= 0) {

        bills[index] = {

            ...bills[index],

            ...data

        };

        ERP.saveBills(bills);

    }

};
/*==========================================
        DASHBOARD DATA V2
==========================================*/

ERP.getDashboardData=function(){

    const products=ERP.getProducts();

    const customers=ERP.getCustomers();

    const orders=ERP.getOrders();

    const bills=ERP.getBills();

    const today=new Date().toLocaleDateString("en-IN");

    const month=new Date().getMonth();

    const year=new Date().getFullYear();

    let todaySales=0;

    let monthlySales=0;

    let totalRevenue=0;

    let pendingOrders=0;

    bills.forEach(bill=>{

        const amount=Number(bill.total)||0;

        totalRevenue+=amount;

        if(bill.date===today){

            todaySales+=amount;

        }

        const billDate=new Date(bill.date);

        if(

            billDate.getMonth()===month &&

            billDate.getFullYear()===year

        ){

            monthlySales+=amount;

        }

    });

    orders.forEach(order=>{

        if(order.status==="Pending"){

            pendingOrders++;

        }

    });

    const lowStock=

        products.filter(

            p=>Number(p.stock)<=5

        );

    return{

        todaySales,

        monthlySales,

        totalRevenue,

        totalProducts:products.length,

        totalCustomers:customers.length,

        totalOrders:orders.length,

        totalBills:bills.length,

        pendingOrders,

        lowStockCount:lowStock.length,

        latestOrders:

            orders.slice(-5).reverse(),

        latestCustomers:

            customers.slice(-5).reverse(),

        latestBills:

            bills.slice(-5).reverse(),

        lowStockProducts:

            lowStock

    };

};
/*==========================================
        AUTO NUMBER GENERATOR
==========================================*/

ERP.generateInvoiceNumber = function () {

    const bills = ERP.getBills();

    return "INV-" +

        String(bills.length + 1).padStart(4, "0");

};

ERP.generateOrderNumber = function () {

    const orders = ERP.getOrders();

    return "ORD-" +

        String(orders.length + 1).padStart(4, "0");

};

/*==========================================
        STOCK MANAGEMENT
==========================================*/

ERP.reduceStock = function (productId, qty) {

    const products = ERP.getProducts();

    const product = products.find(

        p => p.id === productId

    );

    if (!product) {

        return false;

    }

    product.stock = Math.max(

        0,

        Number(product.stock) - Number(qty)

    );

    ERP.saveProducts(products);

    return true;

};

/*==========================================
        CUSTOMER AUTO CREATE
==========================================*/

ERP.saveCustomerFromBill = function (customer) {

    const customers = ERP.getCustomers();

    const existing = customers.find(

        x => x.mobile === customer.mobile

    );

    if (existing) {

        existing.name = customer.name;

        existing.address = customer.address;

        existing.lastPurchase = new Date().toISOString();

        existing.totalPurchase =

            Number(existing.totalPurchase || 0) +

            Number(customer.amount || 0);

    }

    else {

        customers.push({

            id: Date.now(),

            name: customer.name,

            mobile: customer.mobile,

            address: customer.address,

            totalPurchase: Number(customer.amount || 0),

            lastPurchase: new Date().toISOString(),

            createdAt: new Date().toISOString()

        });

    }

    ERP.saveCustomers(customers);

};

/*==========================================
        BILL -> ORDER
==========================================*/

ERP.createOrderFromBill = function (bill) {

    const orders = ERP.getOrders();

    orders.push({

        orderId: ERP.generateOrderNumber(),

        invoice: bill.invoice,

        customer: bill.customer,

        mobile: bill.mobile,

        amount: bill.total,

        payment: bill.payment,

        status: "Pending",

        date: new Date().toLocaleDateString("en-IN"),

        items: bill.items || []

    });

    ERP.saveOrders(orders);

};

/*==========================================
        COMPLETE BILL PROCESS
==========================================*/

ERP.completeBilling = function (bill) {

    ERP.addBill(bill);

    ERP.saveCustomerFromBill({

        name: bill.customer,

        mobile: bill.mobile,

        address: bill.address,

        amount: bill.total

    });

    ERP.createOrderFromBill(bill);

    if (Array.isArray(bill.items)) {

        bill.items.forEach(item => {

            ERP.reduceStock(

                item.productId,

                item.qty

            );

        });

    }

};

/*==========================================
        REPORT DATA
==========================================*/

ERP.getReportData = function () {

    return {

        products: ERP.getProducts(),

        customers: ERP.getCustomers(),

        orders: ERP.getOrders(),

        bills: ERP.getBills(),

        dashboard: ERP.getDashboardData()

    };

};

/*==========================================
        UTILITIES
==========================================*/

ERP.clearAllData = function () {

    Object.values(ERP.storage).forEach(key => {

        localStorage.removeItem(key);

    });

};

ERP.exportData = function () {

    return {

        products: ERP.getProducts(),

        customers: ERP.getCustomers(),

        bills: ERP.getBills(),

        orders: ERP.getOrders(),

        settings: ERP.get(ERP.storage.settings)

    };

};

ERP.importData = function (data) {

    if (data.products)

        ERP.saveProducts(data.products);

    if (data.customers)

        ERP.saveCustomers(data.customers);

    if (data.orders)

        ERP.saveOrders(data.orders);

    if (data.bills)

        ERP.saveBills(data.bills);

    if (data.settings)

        ERP.save(

            ERP.storage.settings,

            data.settings

        );

};

/*==========================================
        ERP VERSION
==========================================*/

ERP.version = "1.0.0";

/*==========================================
        END OF ERP ENGINE
==========================================*/