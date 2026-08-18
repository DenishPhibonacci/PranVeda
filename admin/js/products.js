
"use strict";

if (window.__pranVedaProductsInitialized) {
    console.warn("products.js already initialized.");
} else {

    window.__pranVedaProductsInitialized = true;

    document.addEventListener("DOMContentLoaded", () => {
        loadProducts();
        bindProductEvents();
        renderAll();
    });

}
/* =========================================================
   PRANVEDA ERP - PRODUCTS MODULE
========================================================= */

const PRODUCTS_STORAGE_KEY = "erp_products";

let products = [];
let editingProductId = null;

let currentPage = 1;
const itemsPerPage = 10;


/* =========================================================
   INIT
========================================================= */



/* =========================================================
   STORAGE
========================================================= */

function loadProducts() {

    try {

        products =
            JSON.parse(
                localStorage.getItem(
                    PRODUCTS_STORAGE_KEY
                )
            ) || [];

        if (!Array.isArray(products)) {

            products = [];

        }

    }
    catch (error) {

        console.error(
            "Products load failed:",
            error
        );

        products = [];

    }

}


function saveProducts() {

    localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(products)
    );

}


/* =========================================================
   ELEMENT HELPERS
========================================================= */

function $(id) {

    return document.getElementById(id);

}


/* =========================================================
   EVENT BINDING
========================================================= */

function bindProductEvents() {

    /* Add Product button */

    $("addProductBtn")?.addEventListener(
        "click",
        openAddProductModal
    );


    /* Form submit */

    $("productForm")?.addEventListener(
        "submit",
        handleProductSubmit
    );


    /* Search */

    $("productSearch")?.addEventListener(
        "input",
        renderAll
    );


    /* Category filter */

    $("categoryFilter")?.addEventListener(
        "change",
        () => {

            currentPage = 1;

            renderAll();

        }
    );


    /* Status filter */

    $("statusFilter")?.addEventListener(
        "change",
        () => {

            currentPage = 1;

            renderAll();

        }
    );


    /* Close modal */

    document
        .querySelectorAll(".close-modal")
        .forEach(button => {

            button.addEventListener(
                "click",
                closeProductModal
            );

        });


    /* Click outside modal */

    $("productModal")?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("productModal")
            ) {

                closeProductModal();

            }

        }
    );


    /* Escape */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeProductModal();

            }

        }
    );

}


/* =========================================================
   MODAL
========================================================= */

function openAddProductModal() {

    editingProductId = null;

    resetProductForm();

    const skuInput = $("sku");

    if (skuInput) {

        skuInput.value = generateSku();

        skuInput.readOnly = true;

    }

    const title =
        document.querySelector(
            "#productModal .modal-header h2"
        );

    if (title) {

        title.textContent =
            "Add New Product";

    }

    $("productModal")
        ?.classList.add("active");

}


function closeProductModal() {

    $("productModal")?.classList.remove(
        "active"
    );

}


function resetProductForm() {

    const form =
        $("productForm");

    if (!form) return;

    form.reset();


    const brand =
        $("brand");

    if (brand) {

        brand.value =
            "PranVeda";

    }


    const status =
        $("status");

    if (status) {

        status.value =
            "Active";

    }


    const gst =
        $("gst");

    if (gst) {

        gst.value =
            "0";

    }

}


/* =========================================================
   SAVE / UPDATE PRODUCT
========================================================= */

function handleProductSubmit(event) {

    event.preventDefault();


    const name =
        $("productName")?.value.trim();

    const sku =
        $("sku")?.value.trim();

    const brand =
        $("brand")?.value.trim() ||
        "PranVeda";

    const category =
        $("category")?.value ||
        "Other";

    const purchasePrice =
        numberValue(
            $("purchasePrice")?.value
        );

    const mrp =
        numberValue(
            $("mrp")?.value
        );

    const sellingPrice =
        numberValue(
            $("sellingPrice")?.value
        );

    const gst =
        numberValue(
            $("gst")?.value
        );

    const stock =
        numberValue(
            $("stock")?.value
        );

    const minStock =
        numberValue(
            $("minStock")?.value
        );

    const expiryDate =
        $("expiryDate")?.value || "";

    const status =
        $("status")?.value ||
        "Active";

    const description =
        $("description")?.value.trim() ||
        "";


    /* Validation */

    if (!name) {

        showToast(
            "Please enter Product Name.",
            "error"
        );

        $("productName")?.focus();

        return;

    }


    if (sellingPrice < 0) {

        showToast(
            "Selling Price cannot be negative.",
            "error"
        );

        return;

    }


    if (mrp < 0) {

        showToast(
            "MRP cannot be negative.",
            "error"
        );

        return;

    }


    if (stock < 0) {

        showToast(
            "Stock cannot be negative.",
            "error"
        );

        return;

    }


    /* =========================================
       Image handling
    ========================================= */

    const imageInput =
        $("productImage");

    const file =
        imageInput?.files?.[0];


    const existingProduct =
        products.find(
            product =>
                product.id ===
                editingProductId
        );


    if (file) {

        const reader =
            new FileReader();

        reader.onload = () => {

            saveProductRecord({

                image:
                    reader.result

            });

        };

        reader.readAsDataURL(file);

    }
    else {

        saveProductRecord({

            image:
                existingProduct?.image ||
                ""

        });

    }


    function saveProductRecord(extraData) {

        const product = {

            id:
                editingProductId ||
                generateId(),

            sku:
                sku ||
                generateSku(),

            name,

            category,

            brand,

            purchasePrice,

            mrp,

            price:
                sellingPrice,

            sellingPrice,

            gst,

            stock,

            minStock,

            expiryDate,

            status,

            description,

            image:
                extraData.image || "",

            updatedAt:
                new Date().toISOString()

        };


        /* Update */

        if (editingProductId) {

            const index =
                products.findIndex(
                    item =>
                        item.id ===
                        editingProductId
                );

            if (index !== -1) {

                products[index] =
                    product;

            }

        }

        /* Add */

        else {

            products.push(product);

        }


        saveProducts();

        renderAll();

        closeProductModal();

        showToast(
            editingProductId
                ? "Product updated successfully."
                : "Product added successfully."
        );


        editingProductId =
            null;

    }

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    updateSummary();

    populateCategoryFilter();

    const filtered =
        getFilteredProducts();

    renderProductTable(
        filtered
    );

    renderProductCount(
        filtered.length
    );

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredProducts() {

    const search =
        (
            $("productSearch")?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const category =
        $("categoryFilter")?.value ||
        "";


    const status =
        $("statusFilter")?.value ||
        "";


    return products.filter(
        product => {

            const matchesSearch =

                !search ||

                String(
                    product.name || ""
                )
                .toLowerCase()
                .includes(search)

                ||

                String(
                    product.sku || ""
                )
                .toLowerCase()
                .includes(search)

                ||

                String(
                    product.category || ""
                )
                .toLowerCase()
                .includes(search);


            const matchesCategory =

                !category ||

                product.category ===
                category;


            const lowStock =
                Number(
                    product.stock || 0
                ) <=
                Number(
                    product.minStock || 5
                );


            const matchesStatus =

                !status ||

                (
                    status ===
                    "Low Stock"
                    ? lowStock
                    : product.status ===
                      status
                );


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );

        }
    );

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function populateCategoryFilter() {

    const select =
        $("categoryFilter");

    if (!select) return;


    const current =
        select.value;


    const categories =
        [
            ...new Set(
                products
                    .map(
                        product =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    select.innerHTML = `

        <option value="">
            All Categories
        </option>

    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            select.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(current)
    ) {

        select.value =
            current;

    }

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const total =
        products.length;


    const categories =
        new Set(
            products
                .map(
                    product =>
                        product.category
                )
                .filter(Boolean)
        ).size;


    const lowStock =
        products.filter(
            product =>
                Number(
                    product.stock || 0
                )
                <=
                Number(
                    product.minStock ||
                    5
                )
        ).length;


    const inventoryValue =
        products.reduce(
            (sum, product) => {

                return (
                    sum +
                    (
                        Number(
                            product.purchasePrice ||
                            product.price ||
                            0
                        ) *
                        Number(
                            product.stock ||
                            0
                        )
                    )
                );

            },
            0
        );


    $("totalProducts").textContent =
        total;


    $("totalCategories").textContent =
        categories;


    $("lowStockProducts").textContent =
        lowStock;


    $("inventoryValue").textContent =
        formatCurrency(
            inventoryValue
        );

}


/* =========================================================
   TABLE
========================================================= */

function renderProductTable(list) {

    const table =
        $("productTable");

    if (!table) return;


    if (!list.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    style="
                        text-align:center;
                        padding:40px;
                    "
                >

                    No products found.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        list
            .map(
                product =>
                    renderProductRow(
                        product
                    )
            )
            .join("");


    table
        .querySelectorAll(
            ".edit-product"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        editProduct(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    table
        .querySelectorAll(
            ".delete-product"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteProduct(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   TABLE ROW
========================================================= */

function renderProductRow(product) {

    const stock =
        Number(
            product.stock || 0
        );


    const minStock =
        Number(
            product.minStock || 5
        );


    const stockClass =
        stock <= minStock
            ? "low"
            : stock <= minStock * 2
                ? "medium"
                : "good";


    const displayStatus =
        stock <= minStock
            ? "Low Stock"
            : product.status;


    const statusClass =
        stock <= minStock
            ? "warning"
            : String(
                product.status
            )
            .toLowerCase();


    const image =
        product.image ||
        "assets/images/no-image.png";


    return `

        <tr>

           <td>

    ${
        image
        ? `
            <img
                src="${escapeHtml(image)}"
                class="product-image"
                alt="${escapeHtml(product.name)}"
                onerror="this.onerror=null; this.style.visibility='hidden';"
            >
          `
        : `
            <div class="product-image-placeholder">
                <i class="fa-solid fa-box"></i>
            </div>
          `
    }

</td>


            <td>

                ${escapeHtml(
                    product.sku || "-"
                )}

            </td>


            <td>

                ${escapeHtml(
                    product.name
                )}

            </td>


            <td>

                ${escapeHtml(
                    product.category ||
                    "-"
                )}

            </td>


            <td>

                ${escapeHtml(
                    product.brand ||
                    "-"
                )}

            </td>


            <td>

                ${formatCurrency(
                    product.mrp
                )}

            </td>


            <td>

                ${formatCurrency(
                    product.sellingPrice ??
                    product.price
                )}

            </td>


            <td>

                <span
                    class="stock ${stockClass}"
                >

                    ${stock}

                </span>

            </td>


            <td>

                <span
                    class="status ${statusClass}"
                >

                    ${escapeHtml(
                        displayStatus
                    )}

                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="icon-btn edit edit-product"
                    data-id="${product.id}"
                    title="Edit Product"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    class="icon-btn delete delete-product"
                    data-id="${product.id}"
                    title="Delete Product"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

    `;

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        products.find(
            item =>
                item.id === id
        );

    if (!product) {

        showToast(
            "Product not found.",
            "error"
        );

        return;

    }


    editingProductId =
        product.id;


    $("productName").value =
        product.name || "";

    $("sku").value =
        product.sku || "";

    $("brand").value =
        product.brand ||
        "PranVeda";

    $("category").value =
        product.category || "";

    $("purchasePrice").value =
        product.purchasePrice || 0;

    $("mrp").value =
        product.mrp || 0;

    $("sellingPrice").value =
        product.sellingPrice ??
        product.price ??
        0;

    $("gst").value =
        product.gst ??
        0;

    $("stock").value =
        product.stock || 0;

    $("minStock").value =
        product.minStock || 5;

    $("expiryDate").value =
        product.expiryDate || "";

    $("status").value =
        product.status ||
        "Active";

    $("description").value =
        product.description ||
        "";


    const title =
        document.querySelector(
            "#productModal .modal-header h2"
        );

    if (title) {

        title.textContent =
            "Edit Product";

    }


    $("productModal")
        ?.classList.add(
            "active"
        );

}


/* =========================================================
   DELETE
========================================================= */

function deleteProduct(id) {

    const product =
        products.find(
            item =>
                item.id === id
        );

    if (!product) return;


    const confirmed =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) return;


    products =
        products.filter(
            item =>
                item.id !== id
        );


    saveProducts();

    renderAll();

    showToast(
        "Product deleted successfully."
    );

}


/* =========================================================
   COUNTER
========================================================= */

function renderProductCount(count) {

    const element =
        $("productCount");

    if (!element) return;

    element.textContent =
        `Total Products : ${count}`;

}


/* =========================================================
   HELPERS
========================================================= */

function numberValue(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


function generateId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );

}


function generateSku() {

    let maxNumber = 0;

    products.forEach(product => {

        const sku =
            String(product.sku || "");

        const match =
            sku.match(/^PV(\d+)$/i);

        if (!match) return;

        const number =
            Number(match[1]);

        if (
            Number.isFinite(number) &&
            number > maxNumber
        ) {

            maxNumber = number;

        }

    });

    return (
        "PV" +
        String(maxNumber + 1)
            .padStart(4, "0")
    );

}


function formatCurrency(value) {

    return (
        "₹" +
        Number(value || 0)
            .toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
    );

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        $("toast");

    if (!toast) {

        alert(message);

        return;

    }


    toast.textContent =
        message;

    toast.classList.remove(
        "show",
        "success",
        "error"
    );

    toast.classList.add(
        type
    );


    void toast.offsetWidth;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.productToastTimer
    );


    window.productToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}
