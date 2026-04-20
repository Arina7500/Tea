const CART_STORAGE_KEY = 'myShoppingCart';

function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCounter(cart);
}

function addToCart(product) {
    const cart = getCart();
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += product.quantity || 1;
    } else {
        cart.push({
            ...product,
            quantity: product.quantity || 1
        });
    }
    
    saveCart(cart);
    alert('Товар добавлен в корзину!');
}

function changeQuantity(index, delta) {
    const cart = getCart();
    cart[index].quantity += delta;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCart(cart);
    
    if (typeof displayCart === 'function') {
        displayCart();
    }
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    
    if (typeof displayCart === 'function') {
        displayCart();
    }
}

function updateCartCounter(cart) {
    const counterElement = document.getElementById('cart-counter');
    if (counterElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        counterElement.textContent = totalItems;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cart = getCart();
    updateCartCounter(cart);
});

window.addToCart = addToCart;
window.getCart = getCart;
window.saveCart = saveCart;
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;

// Модальное окно

function openModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
    
    const dateInput = document.getElementById('delivery-date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    dateInput.min = minDate;
    
    const commentField = document.getElementById('comment');
    if (commentField) {
        document.getElementById('charCount').textContent = commentField.value.length;
    }
}

window.closeModal = function() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; 
    resetForm(); 
}

window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeModal();
    }
}

function resetForm() {
    document.getElementById('orderForm').reset();
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.classList.remove('error');
    });
    document.getElementById('charCount').textContent = '0';
}

// валидация формы

// Валидация телефона
function validatePhone(phone) {
    const phoneRegex = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Валидация email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Валидация ФИО
function validateName(name) {
    return name.trim().length >= 5 && name.includes(' ');
}

// Валидация адреса
function validateAddress(address) {
    return address.trim().length >= 10;
}

// Валидация даты
function validateDate(date) {
    if (!date) return true; 
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
}

function validateForm() {
    let isValid = true;
    
    // ФИО
    const name = document.getElementById('name');
    const nameError = document.getElementById('nameError');
    if (!validateName(name.value)) {
        nameError.textContent = 'Введите полное ФИО (минимум 5 символов, включая пробел)';
        name.classList.add('error');
        isValid = false;
    } else {
        nameError.textContent = '';
        name.classList.remove('error');
    }
    
    // Телефон
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    if (!validatePhone(phone.value)) {
        phoneError.textContent = 'Введите корректный номер телефона (например: +7 999 123 45 67)';
        phone.classList.add('error');
        isValid = false;
    } else {
        phoneError.textContent = '';
        phone.classList.remove('error');
    }
    
    // Email
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    if (!validateEmail(email.value)) {
        emailError.textContent = 'Введите корректный email адрес';
        email.classList.add('error');
        isValid = false;
    } else {
        emailError.textContent = '';
        email.classList.remove('error');
    }
    
    // Адрес
    const address = document.getElementById('address');
    const addressError = document.getElementById('addressError');
    if (!validateAddress(address.value)) {
        addressError.textContent = 'Введите полный адрес доставки (минимум 10 символов)';
        address.classList.add('error');
        isValid = false;
    } else {
        addressError.textContent = '';
        address.classList.remove('error');
    }
    
    // Дата
    const deliveryDate = document.getElementById('delivery-date');
    const dateError = document.getElementById('dateError');
    if (!validateDate(deliveryDate.value) && deliveryDate.value) {
        dateError.textContent = 'Дата доставки не может быть раньше сегодняшнего дня';
        deliveryDate.classList.add('error');
        isValid = false;
    } else {
        dateError.textContent = '';
        deliveryDate.classList.remove('error');
    }
    
    // Способ оплаты
    const payment = document.getElementById('payment');
    const paymentError = document.getElementById('paymentError');
    if (!payment.value) {
        paymentError.textContent = 'Выберите способ оплаты';
        payment.classList.add('error');
        isValid = false;
    } else {
        paymentError.textContent = '';
        payment.classList.remove('error');
    }
    
    return isValid;
}

// Счетчик символов
document.addEventListener('DOMContentLoaded', function() {
    const commentField = document.getElementById('comment');
    if (commentField) {
        commentField.addEventListener('input', function() {
            const count = this.value.length;
            const charCount = document.getElementById('charCount');
            if (charCount) {
                charCount.textContent = count;
            }
            
            if (count > 200) {
                this.value = this.value.substring(0, 200);
                if (charCount) {
                    charCount.textContent = 200;
                }
            }
        });
    }
});

// Отправка формы
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                const formData = {
                    name: document.getElementById('name')?.value || '',
                    phone: document.getElementById('phone')?.value || '',
                    email: document.getElementById('email')?.value || '',
                    address: document.getElementById('address')?.value || '',
                    deliveryDate: document.getElementById('delivery-date')?.value || 'не указана',
                    comment: document.getElementById('comment')?.value || 'нет',
                    payment: document.getElementById('payment')?.value || '',
                    items: getCart() 
                };
                
                console.log('Заказ оформлен:', formData);
                
                // Очищение корзины
                localStorage.removeItem(CART_STORAGE_KEY);
                alert('Спасибо за заказ! Наш менеджер свяжется с вами в ближайшее время.');
                closeModal();
                
                if (typeof displayCart === 'function') {
                    displayCart();
                }
                updateCartCounter([]);
            }
        });
    }
});

// Оформить заказ
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = function(e) {
            e.preventDefault();
            const cart = getCart();
            if (cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }
            openModal();
        };
    }
});