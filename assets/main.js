/**
 * VEDAMRIT — Premium Ayurvedic Brand
 * Main JavaScript — UI interactions, animations, navigation
 */

/* =============================================
   WHATSAPP UTILITY
   ============================================= */
const WA_NUMBER = '919999999999'; // Replace with real number

function openWhatsApp(productName = '', quantity = '1') {
  let message = '';
  if (productName) {
    message = `Hello Vedamrit,\n\nI want to order:\n\nProduct: ${productName}\nQuantity: ${quantity}\n\nPlease share availability and delivery details.\n\nThank you.`;
  } else {
    message = `Hello Vedamrit,\n\nI want to place an order. Please share your product catalogue and delivery details.\n\nThank you.`;
  }
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank');
}

/* =============================================
   NAVBAR SCROLL BEHAVIOR
   ============================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const isHomePage = document.body.classList.contains('home-page');

  const updateNavbar = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      if (isHomePage) {
        navbar.classList.add('transparent');
        navbar.classList.remove('scrolled');
      }
    }
  };

  if (isHomePage) {
    navbar.classList.add('transparent');
  } else {
    navbar.classList.add('scrolled');
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
}

/* =============================================
   MOBILE MENU
   ============================================= */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  hamburger.addEventListener('click', () => {
    isOpen = !isOpen;
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());

    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      isOpen = false;
      mobileMenu.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

/* =============================================
   SCROLL REVEAL ANIMATIONS
   ============================================= */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* =============================================
   FAQ ACCORDION
   ============================================= */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      faqItems.forEach(fi => fi.classList.remove('open'));
      // Open clicked if it was closed
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* =============================================
   TABS
   ============================================= */
function initTabs() {
  const tabContainers = document.querySelectorAll('.tab-container');
  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        panels[i]?.classList.add('active');
      });
    });

    // Activate first
    if (buttons[0]) buttons[0].classList.add('active');
    if (panels[0]) panels[0].classList.add('active');
  });
}

/* =============================================
   PRODUCT QUANTITY SELECTOR
   ============================================= */
function initQuantitySelector() {
  const minusBtns = document.querySelectorAll('[data-qty="minus"]');
  const plusBtns = document.querySelectorAll('[data-qty="plus"]');

  minusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('.qty-input');
      if (input && parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
      }
    });
  });

  plusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('.qty-input');
      if (input && parseInt(input.value) < 99) {
        input.value = parseInt(input.value) + 1;
      }
    });
  });
}

/* =============================================
   CONTACT FORM
   ============================================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#contactName')?.value || '';
    const message = form.querySelector('#contactMessage')?.value || '';
    const phone = form.querySelector('#contactPhone')?.value || '';
    
    const waMsg = `Hello Vedamrit,\n\nName: ${name}\nPhone: ${phone}\n\nMessage:\n${message}\n\nThank you.`;
    const encoded = encodeURIComponent(waMsg);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank');
    showToast('Message sent via WhatsApp! 🌿');
    form.reset();
  });
}

/* =============================================
   TOAST NOTIFICATION
   ============================================= */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* =============================================
   SMOOTH ACTIVE NAV LINK
   ============================================= */
function initActiveNavLinks() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* =============================================
   INIT ALL
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initFAQ();
  initTabs();
  initQuantitySelector();
  initContactForm();
  initActiveNavLinks();
});
