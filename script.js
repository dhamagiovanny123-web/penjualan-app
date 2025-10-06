// Event listener ini memastikan kode JavaScript baru berjalan setelah seluruh elemen HTML dimuat.
document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM ---
    const productGrid = document.getElementById('product-grid');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const cartCount = document.getElementById('cart-count');
    const viewCartBtn = document.getElementById('view-cart-btn');
   
    // Elemen Modal Produk
    const modal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalImage = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalProductName = document.getElementById('modal-product-name');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');
    
    // Elemen Modal Keranjang
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Elemen Form Pembeli
    const customerForm = document.getElementById('customer-form');
    const customerName = document.getElementById('customer-name');
    const customerAddress = document.getElementById('customer-address');
    const customerPhone = document.getElementById('customer-phone');
    const nameError = document.getElementById('name-error');
    const addressError = document.getElementById('address-error');
    const phoneError = document.getElementById('phone-error');
    
    const toastContainer = document.getElementById('toast-container');


    // --- State ---
    let products = [];
    let cart = [];
    const API_URL = 'https://fakestoreapi.com/products';
    const WHATSAPP_NUMBER = '6281232891871'; // Ganti dengan nomor WhatsApp tujuan


    // --- Functions ---


    /**
     * Mengambil produk dari Fake Store API
     */
    async function fetchProducts() {
        loader.style.display = 'block';
        productGrid.innerHTML = '';
        errorMessage.classList.add('hidden');
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Gagal mengambil produk:", error);
            errorMessage.classList.remove('hidden');
        } finally {
            loader.style.display = 'none';
        }
    }


    /**
     * Menampilkan produk di dalam grid
     * @param {Array} productsToDisplay - Array objek produk
     */
    function displayProducts(productsToDisplay) {
        productGrid.innerHTML = ''; // Bersihkan produk sebelumnya
        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card bg-white rounded-lg shadow-sm overflow-hidden flex flex-col cursor-pointer';
            productCard.dataset.productId = product.id;


            productCard.innerHTML = `
                <div class="p-4 bg-white h-48 flex items-center justify-center">
                    <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="p-4 border-t border-gray-200 flex flex-col flex-grow">
                    <span class="text-xs text-gray-500 capitalize">${product.category}</span>
                    <h3 class="text-md font-semibold text-gray-800 mt-1 flex-grow">${product.title.substring(0, 40)}...</h3>
                    <div class="mt-4 flex justify-between items-center">
                        <p class="text-lg font-bold text-blue-600">Rp ${Math.round(product.price * 15000).toLocaleString('id-ID')}</p>
                        <button class="add-to-cart-btn bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }
   
    /**
     * Menampilkan modal detail produk
     * @param {number} productId - ID produk yang akan ditampilkan
     */
    function showProductDetail(productId) {
        const product = products.find(p => p.id == productId);
        if (!product) return;


        modalImage.src = product.image;
        modalCategory.textContent = product.category;
        modalProductName.textContent = product.title;
        modalPrice.textContent = `Rp ${Math.round(product.price * 15000).toLocaleString('id-ID')}`;
        modalDescription.textContent = product.description;
        modalAddToCartBtn.dataset.productId = product.id; // Atur ID produk pada tombol
       
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Mencegah scroll di latar belakang
    }


    /**
     * Menyembunyikan modal detail produk
     */
    function hideModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }


    /**
     * Menambahkan produk ke keranjang dan memperbarui UI
     * @param {number} productId - ID produk yang akan ditambahkan
     */
    function addToCart(productId) {
        const product = products.find(p => p.id == productId);
        if (product) {
            // Cek apakah produk sudah ada di keranjang
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    product: product,
                    quantity: 1
                });
            }
            
            updateCartCounter();
            showToast(`${product.title.substring(0, 20)}... ditambahkan ke keranjang!`);
        }
    }


    /**
     * Memperbarui tampilan counter keranjang
     */
    function updateCartCounter() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
   
    /**
     * Menampilkan notifikasi toast
     * @param {string} message - Pesan yang akan ditampilkan
     */
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg';
        toast.textContent = message;
        toastContainer.appendChild(toast);


        setTimeout(() => {
            toast.remove();
        }, 3000); // Hapus toast setelah 3 detik
    }
    
    /**
     * Menampilkan modal keranjang
     */
    function showCart() {
        renderCartItems();
        loadCustomerData();
        cartModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Menyembunyikan modal keranjang
     */
    function hideCart() {
        cartModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    /**
     * Merender item-item di keranjang
     */
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartSummary.classList.add('hidden');
            return;
        }
        
        emptyCartMessage.classList.add('hidden');
        cartSummary.classList.remove('hidden');
        
        let total = 0;
        
        cart.forEach(item => {
            const itemPrice = Math.round(item.product.price * 15000);
            const subtotal = itemPrice * item.quantity;
            total += subtotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'flex items-center p-3 border rounded-lg';
            
            cartItem.innerHTML = `
                <div class="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img src="${item.product.image}" alt="${item.product.title}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="ml-4 flex-grow">
                    <h4 class="font-medium text-gray-800">${item.product.title.substring(0, 30)}...</h4>
                    <div class="flex justify-between items-center mt-1">
                        <span class="text-sm text-gray-600">${item.quantity} x Rp ${itemPrice.toLocaleString('id-ID')}</span>
                        <span class="font-semibold">Rp ${subtotal.toLocaleString('id-ID')}</span>
                    </div>
                </div>
                <button class="remove-item-btn ml-2 text-red-500 hover:text-red-700" data-product-id="${item.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
    
    /**
     * Menghapus item dari keranjang
     * @param {number} productId - ID produk yang akan dihapus
     */
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartCounter();
        renderCartItems();
        showToast('Produk dihapus dari keranjang');
    }
    
    /**
     * Mengosongkan keranjang
     */
    function clearCart() {
        cart = [];
        updateCartCounter();
        renderCartItems();
        showToast('Keranjang berhasil dikosongkan');
    }
    
    /**
     * Memuat data pelanggan dari localStorage
     */
    function loadCustomerData() {
        const savedData = localStorage.getItem('customerData');
        if (savedData) {
            const customerData = JSON.parse(savedData);
            customerName.value = customerData.name || '';
            customerAddress.value = customerData.address || '';
            customerPhone.value = customerData.phone || '';
        }
    }
    
    /**
     * Menyimpan data pelanggan ke localStorage
     */
    function saveCustomerData() {
        const customerData = {
            name: customerName.value,
            address: customerAddress.value,
            phone: customerPhone.value
        };
        localStorage.setItem('customerData', JSON.stringify(customerData));
    }
    
    /**
     * Validasi form pembeli
     * @returns {boolean} - True jika valid, False jika tidak valid
     */
    function validateForm() {
        let isValid = true;
        
        // Reset error messages
        nameError.classList.add('hidden');
        addressError.classList.add('hidden');
        phoneError.classList.add('hidden');
        
        // Validasi nama
        if (!customerName.value.trim()) {
            nameError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validasi alamat
        if (!customerAddress.value.trim()) {
            addressError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validasi nomor telepon
        const phoneRegex = /^08[0-9]{8,12}$/;
        if (!phoneRegex.test(customerPhone.value)) {
            phoneError.classList.remove('hidden');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Checkout dan mengirim pesan ke WhatsApp
     */
    function checkout() {
        if (cart.length === 0) {
            showToast('Keranjang belanja kosong');
            return;
        }
        
        if (!validateForm()) {
            showToast('Harap lengkapi data pembeli');
            return;
        }
        
        // Simpan data pelanggan
        saveCustomerData();
        
        let message = "Halo, saya ingin memesan produk berikut:\n\n";
        let total = 0;
        
        cart.forEach(item => {
            const itemPrice = Math.round(item.product.price * 15000);
            const subtotal = itemPrice * item.quantity;
            total += subtotal;
            
            message += `• ${item.product.title}\n`;
            message += `  Kategori: ${item.product.category}\n`;
            message += `  Harga: Rp ${itemPrice.toLocaleString('id-ID')} x ${item.quantity}\n`;
            message += `  Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n\n`;
        });
        
        message += `Total: Rp ${total.toLocaleString('id-ID')}\n\n`;
        message += "Data Pembeli:\n";
        message += `Nama: ${customerName.value}\n`;
        message += `Alamat: ${customerAddress.value}\n`;
        message += `No. Telepon: ${customerPhone.value}\n\n`;
        message += "Mohon informasikan cara pembayaran dan pengirimannya. Terima kasih!";
        
        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
        
        // Kosongkan keranjang setelah checkout
        clearCart();
        hideCart();
    }


    // --- Event Listeners ---


    // Menangani klik pada grid produk (untuk melihat detail atau menambah ke keranjang)
    productGrid.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            const productId = addToCartBtn.dataset.productId;
            addToCart(productId);
            return; // Hentikan proses lebih lanjut
        }


        const card = e.target.closest('.product-card');
        if (card) {
            const productId = card.dataset.productId;
            showProductDetail(productId);
        }
    });
   
    // Menambah ke keranjang dari modal
    modalAddToCartBtn.addEventListener('click', () => {
         const productId = modalAddToCartBtn.dataset.productId;
         addToCart(productId);
         hideModal();
    });


    // Event untuk menutup modal produk
    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            hideModal();
        }
    });
    
    // Event untuk keranjang
    viewCartBtn.addEventListener('click', showCart);
    closeCartBtn.addEventListener('click', hideCart);
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            hideCart();
        }
    });
    
    // Event untuk item di keranjang
    cartItemsContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-item-btn');
        if (removeBtn) {
            const productId = removeBtn.dataset.productId;
            removeFromCart(productId);
        }
    });
    
    // Event untuk tombol keranjang
    clearCartBtn.addEventListener('click', clearCart);
    checkoutBtn.addEventListener('click', checkout);
    
    // Event untuk form pembeli
    customerName.addEventListener('input', () => {
        if (customerName.value.trim()) {
            nameError.classList.add('hidden');
        }
    });
    
    customerAddress.addEventListener('input', () => {
        if (customerAddress.value.trim()) {
            addressError.classList.add('hidden');
        }
    });
    
    customerPhone.addEventListener('input', () => {
        const phoneRegex = /^08[0-9]{8,12}$/;
        if (phoneRegex.test(customerPhone.value)) {
            phoneError.classList.add('hidden');
        }
    });


    // --- Pemuatan Awal ---
    fetchProducts();
});