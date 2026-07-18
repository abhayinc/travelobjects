/* ==========================================================================
   Travel Objects — Editorial Interface Interactions & Cart Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- Sticky Header Scroll Styling ---
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Mobile Overlay Navigation ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileOverlay = document.getElementById('mobile-overlay');
  
  if (mobileToggle && mobileOverlay) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileOverlay.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when clicking links
    const mobileLinks = mobileOverlay.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileOverlay.classList.remove('open');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll-Reveal Animations (IntersectionObserver) ---
  const revealItems = document.querySelectorAll('.reveal-item');
  if ('IntersectionObserver' in window && revealItems.length > 0) {
    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach((item, index) => {
      const parent = item.parentElement;
      if (parent && (parent.classList.contains('system-grid') || parent.classList.contains('products-grid'))) {
        const delay = (index % 4) * 0.1;
        item.style.transitionDelay = `${delay}s`;
      }
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(item => item.classList.add('active'));
  }

  // --- E-Commerce Cart Drawer Logic ---
  let cart = [];
  
  // Load Cart from LocalStorage if it exists
  try {
    const savedCart = localStorage.getItem('travelobjects_cart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  } catch (err) {
    console.error('Failed to parse cart storage:', err);
  }

  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartToggle = document.getElementById('cart-toggle');
  const cartClose = document.getElementById('cart-close');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSubtotalElement = document.getElementById('cart-subtotal');
  const cartCountBadge = document.getElementById('cart-count');
  const cartFooter = document.getElementById('cart-footer');

  // Open & Close Drawer
  const openCart = () => {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Add Item to Cart
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      const price = parseFloat(button.getAttribute('data-price'));
      const img = button.getAttribute('data-img');

      // Check if already in cart
      const existingItem = cart.find(item => item.id === id);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({ id, name, price, img, qty: 1 });
      }

      saveCart();
      renderCart();
      openCart();

      // Mini Button feedback trigger
      const buttonSpan = button.querySelector('span');
      const buttonIcon = button.querySelector('i');
      const originalText = buttonSpan.textContent;
      const originalIcon = buttonIcon.getAttribute('data-lucide');

      buttonSpan.textContent = 'Added';
      buttonIcon.setAttribute('data-lucide', 'check');
      if (typeof lucide !== 'undefined') lucide.createIcons();

      setTimeout(() => {
        buttonSpan.textContent = originalText;
        buttonIcon.setAttribute('data-lucide', originalIcon);
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 1500);
    });
  });

  // Save Cart to LocalStorage
  function saveCart() {
    try {
      localStorage.setItem('travelobjects_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart storage:', err);
    }
  }

  // Render Cart Drawer Contents
  function renderCart() {
    // Empty state logic
    const emptyState = document.getElementById('cart-empty');
    if (cart.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      cartFooter.style.display = 'none';
      cartCountBadge.textContent = '0';
      
      // Clear dynamically added items
      const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
      existingItems.forEach(el => el.remove());
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    cartFooter.style.display = 'block';

    // Clear previous items
    const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
    existingItems.forEach(el => el.remove());

    let totalQty = 0;
    let subtotal = 0;

    cart.forEach(item => {
      totalQty += item.qty;
      subtotal += item.price * item.qty;

      // Create item element (Formatted in Indian Rupees without paisa decimal since they are round figures)
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-img-box">
          <img src="${item.img}" alt="${item.name}" class="cart-item-img">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-title-row">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
          </div>
          <button class="cart-item-remove" data-id="${item.id}">Remove</button>
          <div class="cart-item-qty-row">
            <span class="qty-label">Quantity</span>
            <div class="qty-selector">
              <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `;

      cartItemsContainer.appendChild(itemEl);
    });

    cartCountBadge.textContent = totalQty.toString();
    cartSubtotalElement.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

    // Add Action Event Listeners to Cart elements
    setupCartControls();
  }

  // Setup Quantity selectors and Remove buttons inside cart
  function setupCartControls() {
    const removeButtons = cartItemsContainer.querySelectorAll('.cart-item-remove');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCart();
      });
    });

    const minusButtons = cartItemsContainer.querySelectorAll('.qty-minus');
    minusButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cart.find(i => i.id === id);
        if (item) {
          item.qty -= 1;
          if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
          }
          saveCart();
          renderCart();
        }
      });
    });

    const plusButtons = cartItemsContainer.querySelectorAll('.qty-plus');
    plusButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cart.find(i => i.id === id);
        if (item) {
          item.qty += 1;
          saveCart();
          renderCart();
        }
      });
    });
  }

  // Mock Checkout Button Click
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      alert(`Checkout initiated!\nSubtotal: ${cartSubtotalElement.textContent}\nFree shipping will be applied across India. Thank you for exploring Travel Objects.`);
      cart = [];
      saveCart();
      renderCart();
      closeCart();
    });
  }

  // Initial cart rendering
  renderCart();

  // --- Editorial Newsletter Logic ---
  const newsletterForm = document.getElementById('journal-newsletter-form');
  const feedbackElement = document.getElementById('form-feedback');

  if (newsletterForm && feedbackElement) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('newsletter-email');
      const email = emailInput.value.trim();
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email) {
        showFeedback('Please enter your email.', 'error');
        return;
      }
      
      if (!emailRegex.test(email)) {
        showFeedback('Please enter a valid email address.', 'error');
        return;
      }

      // Mock submit saving to localStorage
      try {
        let newsletterSignups = JSON.parse(localStorage.getItem('travelobjects_newsletter') || '[]');
        if (!newsletterSignups.includes(email)) {
          newsletterSignups.push(email);
          localStorage.setItem('travelobjects_newsletter', JSON.stringify(newsletterSignups));
        }

        showFeedback('Success. You will receive private updates and coupon codes.', 'success');
        newsletterForm.reset();
      } catch (err) {
        console.error('Failed to save newsletter entry:', err);
        showFeedback('An error occurred. Please try again.', 'error');
      }
    });

    function showFeedback(message, type) {
      feedbackElement.textContent = message;
      feedbackElement.className = 'form-feedback';
      feedbackElement.classList.add(type);
      
      setTimeout(() => {
        feedbackElement.style.display = 'block';
      }, 50);
    }
  }
});
