const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

menuOpenButton.addEventListener("click", () => {
    // Toggle mobile menu visibility 
    document.body.classList.toggle("show-mobile-menu");
});

// Close menu when the close button is clicked
menuCloseButton.addEventListener("click", () => menuOpenButton.click ());

// Initialize Swiper 
const swiper = new Swiper('.slider-wrapper', {
  loop: true,

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

// ...existing code...
/*
  Replaced/extended script to:
  - fix store/menu data structure (storeMenus)
  - allow opening store modal, add/remove items to cart
  - show cart modal with items, adjust quantities there
  - checkout flow allowing upload of payment proof (image) and confirm payment
  - minimal validation & local preview of uploaded image
*/
const menuOpenButtonTwo = document.querySelector("#menu-open-button-two");
const menuCloseButtonTwo = document.querySelector("#menu-close-button-two");

if (menuOpenButtonTwo) {
  menuOpenButtonTwo.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
  });
}
if (menuCloseButtonTwo) {
  menuCloseButtonTwo.addEventListener("click", () => menuOpenButtonTwo && menuOpenButtonTwo.click());
}

// --- Data: stores and menus (prices as numbers in IDR) ---
const storeMenus = {
  'makanan-satu': {
    id: 'makanan-satu',
    name: 'Kantin Kuning',
    type: 'Makanan',
    menu: [
      { id: 1, name: 'Ayam Geprek', description: 'Nasi dengan Ayam geprek bersama sambal pilihan', price: 15000 },
      { id: 2, name: 'Spaghetti Bolognese', description: 'Spaghetti dengan saus bolognese home made', price: 15000 },
      { id: 3, name: 'Ayam Suwir', description: 'Nasi dengan Ayam goreng yang disuwir bersama bumbu', price: 15000 },
    ]
  },
  'minuman-satu': {
    id: 'minuman-satu',
    name: 'Kantin Kak Ully',
    type: 'Minuman',
    menu: [
      { id: 5, name: 'Es Teh', description: 'Es Teh home made yang manis', price: 8000 },
      { id: 6, name: 'Lemon Ice', description: 'Minuman segar Lemon Ice', price: 8000 },
      { id: 7, name: 'Alpukat', description: 'Alpukat blender dengan milo bubuk', price: 10000 },
    ]
  },
  'makanan-dua': {
    id: 'makanan-dua',
    name: 'Kantin Dinda-dindi',
    type: 'Makanan',
    menu: [
      { id: 9, name: 'Nasi Goreng', description: 'Nasi yang digoreng dengan bumbu gurih', price: 15000 },
      { id: 10, name: 'Nasi Kuning', description: 'Nasi kuning lengkap ', price: 15000 },
      { id: 11, name: 'Nasi Uduk', description: 'Nasi uduk dengan rasa santan yang pas', price: 15000 },
    ]
  },
  // Add other stores similarly...
};

// Global cart + current store
let currentCart = [];
let currentStoreId = null;

// Helpers
const formatRupiah = (number = 0) => {
  if (isNaN(number)) number = 0;
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Update cart counters and total display
const updateCartTotal = () => {
  const total = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotalEl = document.getElementById('cart-total');
  if (cartTotalEl) cartTotalEl.textContent = formatRupiah(total);

  const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.querySelectorAll('.cart-count');
  cartCount.forEach(el => el.textContent = totalItems);
};

// Create menu item DOM for menu modal
const createMenuItemElement = (item) => {
  const itemInCart = currentCart.find(ci => ci.id === item.id) || { quantity: 0 };
  const div = document.createElement('div');
  div.className = 'menu-item';
  div.dataset.itemId = item.id;
  div.innerHTML = `
    <div class="item-info">
      <h4>${item.name}</h4>
      <p>${item.description}</p>
    </div>
    <div class="item-price">Rp ${formatRupiah(item.price)}</div>
    <div class="item-quantity-control">
      <button class="btn-decrease" data-id="${item.id}">-</button>
      <span id="qty-${item.id}" class="item-qty">${itemInCart.quantity}</span>
      <button class="btn-increase" data-id="${item.id}">+</button>
    </div>
  `;
  return div;
};

// Load menu for storeId and show modal (assumes modal elements exist)
const loadMenu = (storeId) => {
  const store = storeMenus[storeId];
  if (!store) return;
  // reset cart if changed store
  if (currentStoreId !== storeId) {
    currentCart = [];
    currentStoreId = storeId;
  }

  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.textContent = `Menu ${store.name}`;

  const menuList = document.getElementById('menu-list');
  if (!menuList) return;
  menuList.innerHTML = '';
  store.menu.forEach(item => {
    menuList.appendChild(createMenuItemElement(item));
  });

  updateCartTotal();
};

// Add or remove quantity from cart
const handleQuantityChange = (itemId, action) => {
  const id = parseInt(itemId, 10);
  const store = storeMenus[currentStoreId];
  if (!store) return;
  const itemData = store.menu.find(m => m.id === id);
  if (!itemData) return;

  let cartItem = currentCart.find(ci => ci.id === id);
  if (action === 'increase') {
    if (!cartItem) {
      currentCart.push({ ...itemData, quantity: 1 });
    } else {
      cartItem.quantity++;
    }
  } else if (action === 'decrease') {
    if (cartItem) {
      cartItem.quantity--;
      if (cartItem.quantity <= 0) {
        currentCart = currentCart.filter(ci => ci.id !== id);
      }
    }
  }

  // Update quantity display in menu modal (if present)
  const qtySpan = document.getElementById(`qty-${id}`);
  if (qtySpan) {
    const updated = currentCart.find(ci => ci.id === id);
    qtySpan.textContent = updated ? updated.quantity : 0;
  }

  updateCartTotal();
  renderCartList(); // if cart modal open, refresh it
};

// Render cart modal list
const renderCartList = () => {
  const cartList = document.getElementById('cart-list');
  if (!cartList) return;
  cartList.innerHTML = '';
  if (currentCart.length === 0) {
    cartList.innerHTML = '<p>Keranjang kosong</p>';
    return;
  }
  currentCart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <div class="cart-item-desc">${item.description}</div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-decrease" data-id="${item.id}">-</button>
        <span class="cart-qty" id="cart-qty-${item.id}">${item.quantity}</span>
        <button class="cart-increase" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item-price">Rp ${formatRupiah(item.price * item.quantity)}</div>
    `;
    cartList.appendChild(row);
  });

  // update totals
  const cartTotalEl = document.getElementById('cart-total');
  if (cartTotalEl) {
    const total = currentCart.reduce((s, it) => s + (it.price * it.quantity), 0);
    cartTotalEl.textContent = formatRupiah(total);
  }
};

// Checkout: open cart modal and show items
const openCartModal = () => {
  const cartModal = document.getElementById('cart-modal');
  if (!cartModal) return;
  renderCartList();
  updateCartTotal();
  cartModal.style.display = 'block';
};

// Close modals helper
const closeModal = (modalEl) => {
  if (modalEl) modalEl.style.display = 'none';
};

// Payment: handle upload preview and submission
const setupPaymentHandlers = () => {
  const uploadInput = document.getElementById('pay-upload-input');
  const previewImg = document.getElementById('payment-proof-preview');
  const paySubmitBtn = document.getElementById('pay-submit-btn');
  const orderConfirm = document.getElementById('order-confirmation');

  if (uploadInput && previewImg) {
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) {
        previewImg.src = '';
        previewImg.style.display = 'none';
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Silakan unggah file gambar (jpg/png).');
        uploadInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        previewImg.src = ev.target.result;
        previewImg.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  if (paySubmitBtn) {
    paySubmitBtn.addEventListener('click', () => {
      if (currentCart.length === 0) {
        alert('Keranjang kosong, tidak ada yang dibayar.');
        return;
      }
      if (!uploadInput || !uploadInput.files[0]) {
        alert('Silakan unggah bukti transfer terlebih dahulu.');
        return;
      }
      // Simulate order submission
      const order = {
        storeId: currentStoreId,
        items: [...currentCart],
        total: currentCart.reduce((s, it) => s + (it.price * it.quantity), 0),
        paymentProof: uploadInput.files[0].name,
        timestamp: new Date().toISOString()
      };
      // Save to localStorage (simple persistence)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));

      // Clear cart and form
      currentCart = [];
      updateCartTotal();
      renderCartList();
      if (orderConfirm) orderConfirm.textContent = `Pesanan diterima. Total Rp ${formatRupiah(order.total)}. Terima kasih!`;
      alert('Pembayaran diproses. Bukti pembayaran tersimpan.');
      // Close cart modal
      const cartModal = document.getElementById('cart-modal');
      closeModal(cartModal);
      // reset upload preview
      if (uploadInput) uploadInput.value = '';
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
    });
  }
};

// --- Event wiring on DOM ready ---
document.addEventListener('DOMContentLoaded', () => {
  // store-card click (assumes .store-card elements have data-store attribute matching keys in storeMenus)
  const storeCardsEls = document.querySelectorAll('.store-card');
  const storeModal = document.getElementById('store-modal');
  const closeButtons = document.querySelectorAll('.close');
  const menuList = document.getElementById('menu-list');

  storeCardsEls.forEach(card => {
    card.addEventListener('click', function () {
      const storeId = this.getAttribute('data-store');
      if (!storeId) return;
      loadMenu(storeId);
      if (storeModal) storeModal.style.display = 'block';
    });
  });

  // close modal buttons
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const modalType = this.getAttribute('data-close-modal');
      if (modalType === 'store') {
        closeModal(document.getElementById('store-modal'));
      } else if (modalType === 'cart') {
        closeModal(document.getElementById('cart-modal'));
      }
    });
  });

  // delegate increase/decrease in menu modal
  if (menuList) {
    menuList.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-increase')) {
        handleQuantityChange(e.target.dataset.id, 'increase');
      } else if (e.target.classList.contains('btn-decrease')) {
        handleQuantityChange(e.target.dataset.id, 'decrease');
      }
    });
  }

  // Open cart (checkout) button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (currentCart.length === 0) {
        return;
      }
      // close store modal then open cart modal
      closeModal(document.getElementById('store-modal'));
      openCartModal();
    });
  }

  // delegate cart modal increase/decrease
  const cartList = document.getElementById('cart-list');
  if (cartList) {
    cartList.addEventListener('click', (e) => {
      if (e.target.classList.contains('cart-increase')) {
        handleQuantityChange(e.target.dataset.id, 'increase');
      } else if (e.target.classList.contains('cart-decrease')) {
        handleQuantityChange(e.target.dataset.id, 'decrease');
      }
    });
  }

  // close cart by clicking outside (optional)
  window.addEventListener('click', (event) => {
    const storeModalEl = document.getElementById('store-modal');
    const cartModalEl = document.getElementById('cart-modal');
    if (event.target === storeModalEl) closeModal(storeModalEl);
    if (event.target === cartModalEl) closeModal(cartModalEl);
  });

  // initialize payment handlers
  setupPaymentHandlers();

  // initial UI updates
  updateCartTotal();
});