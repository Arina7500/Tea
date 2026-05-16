// ===== ОСНОВНЫЕ ФУНКЦИИ КОРЗИНЫ (у вас уже есть) =====

// Добавление товара
window.addToCart = async function(productId, quantity = 1) {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity })
        });
        
        if (response.ok) {
            const data = await response.json();
            updateCartCounter(data.count);
            alert('Товар добавлен в корзину!');
        } else {
            const error = await response.json();
            alert('Ошибка: ' + (error.error || 'Не удалось добавить товар'));
        }
    } catch (error) {
        console.error('Ошибка добавления:', error);
        alert('Ошибка сети');
    }
};

// Загрузка корзины
async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        
        updateCartCounter(data.count);
        
        if (window.location.pathname === '/cart') {
            displayCart(data.items, data.total);
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

// Отображение корзины на странице
window.displayCart = function(items, total) {
    const container = document.getElementById('cart-items-container');
    const totalSpan = document.getElementById('cart-total');
    
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <p>Ваша корзина пуста</p>
                <p>Но это никогда не поздно исправить!</p>
                <a href="/catalog">Перейти в каталог</a>
            </div>
        `;
        if (totalSpan) totalSpan.textContent = '0 ₽';
        return;
    }
    
    let html = '';
    let computedTotal = 0;
    
    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        computedTotal += itemTotal;
        html += `
            <div class="cart-item" data-product-id="${item.product_id}">
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${escapeHtml(item.name)}</h3>
                    <div class="cart-item-details">
                        <p class="cart-item-price">${item.price} ₽</p>
                        <p class="cart-item-subtotal">
                            Сумма: <span>${itemTotal} ₽</span>
                        </p>
                    </div>
                </div>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.product_id}, ${item.quantity - 1})">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.product_id}, ${item.quantity + 1})">+</button>
                </div>
                
                <div class="cart-item-remove">
                    <button class="remove-btn" onclick="removeFromCart(${item.product_id})">✕</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (totalSpan) totalSpan.textContent = `${computedTotal} ₽`;
};

// Обновление количества
window.updateQuantity = async function(productId, quantity) {
    if (quantity < 0) return;
    
    try {
        const response = await fetch('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity })
        });
        
        if (response.ok) {
            await loadCart();
        }
    } catch (error) {
        console.error('Ошибка обновления:', error);
    }
};

// Удаление товара
window.removeFromCart = async function(productId) {
    try {
        const response = await fetch(`/api/cart/remove/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadCart();
        }
    } catch (error) {
        console.error('Ошибка удаления:', error);
    }
};

// Обновление счетчика в шапке
function updateCartCounter(count) {
    const counterElement = document.getElementById('cart-counter');
    if (counterElement) {
        counterElement.textContent = count || 0;
    }
}

// Экранирование HTML (защита от XSS)
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===== ДОБАВИТЬ МОДАЛЬНОЕ ОКНО =====

// Открыть модальное окно
window.openModal = function() {
    const modal = document.getElementById('orderModal');
    if (!modal) {
        console.error('Модальное окно не найдено');
        return;
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Устанавливаем минимальную дату доставки (завтра)
    const dateInput = document.getElementById('delivery-date');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.min = minDate;
    }
    
    // Обновляем счетчик символов
    const commentField = document.getElementById('comment');
    const charCount = document.getElementById('charCount');
    if (commentField && charCount) {
        charCount.textContent = commentField.value.length;
    }
};

// Закрыть модальное окно
window.closeModal = function() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    resetForm();
};

// Очистка формы
function resetForm() {
    const form = document.getElementById('orderForm');
    if (form) form.reset();
    
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.classList.remove('error');
    });
    
    const charCount = document.getElementById('charCount');
    if (charCount) charCount.textContent = '0';
}

// ===== ВАЛИДАЦИЯ ФОРМЫ =====

function validatePhone(phone) {
    const phoneRegex = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateName(name) {
    return name.trim().length >= 5 && name.includes(' ');
}

function validateAddress(address) {
    return address.trim().length >= 10;
}

function validateDate(date) {
    if (!date) return true;
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
}

function validateForm() {
    let isValid = true;
    
    const name = document.getElementById('name');
    const nameError = document.getElementById('nameError');
    if (!validateName(name?.value || '')) {
        nameError.textContent = 'Введите полное ФИО (минимум 5 символов, включая пробел)';
        name?.classList.add('error');
        isValid = false;
    } else {
        nameError.textContent = '';
        name?.classList.remove('error');
    }
    
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    if (!validatePhone(phone?.value || '')) {
        phoneError.textContent = 'Введите корректный номер телефона (например: +7 999 123 45 67)';
        phone?.classList.add('error');
        isValid = false;
    } else {
        phoneError.textContent = '';
        phone?.classList.remove('error');
    }
    
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    if (!validateEmail(email?.value || '')) {
        emailError.textContent = 'Введите корректный email адрес';
        email?.classList.add('error');
        isValid = false;
    } else {
        emailError.textContent = '';
        email?.classList.remove('error');
    }
    
    const address = document.getElementById('address');
    const addressError = document.getElementById('addressError');
    if (!validateAddress(address?.value || '')) {
        addressError.textContent = 'Введите полный адрес доставки (минимум 10 символов)';
        address?.classList.add('error');
        isValid = false;
    } else {
        addressError.textContent = '';
        address?.classList.remove('error');
    }
    
    const deliveryDate = document.getElementById('delivery-date');
    const dateError = document.getElementById('dateError');
    if (!validateDate(deliveryDate?.value || '') && deliveryDate?.value) {
        dateError.textContent = 'Дата доставки не может быть раньше сегодняшнего дня';
        deliveryDate?.classList.add('error');
        isValid = false;
    } else {
        dateError.textContent = '';
        deliveryDate?.classList.remove('error');
    }
    
    const payment = document.getElementById('payment');
    const paymentError = document.getElementById('paymentError');
    if (!payment?.value) {
        paymentError.textContent = 'Выберите способ оплаты';
        payment?.classList.add('error');
        isValid = false;
    } else {
        paymentError.textContent = '';
        payment?.classList.remove('error');
    }
    
    return isValid;
}

// ===== СЧЕТЧИК СИМВОЛОВ =====
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
                if (charCount) charCount.textContent = 200;
            }
        });
    }
});

// ===== ОТПРАВКА ФОРМЫ =====
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm()) return;
            
            const formData = {
                name: document.getElementById('name')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                email: document.getElementById('email')?.value || '',
                address: document.getElementById('address')?.value || '',
                deliveryDate: document.getElementById('delivery-date')?.value || 'не указана',
                comment: document.getElementById('comment')?.value || 'нет',
                payment: document.getElementById('payment')?.value || '',
                items: await getCartItems()
            };
            
            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    alert('Спасибо за заказ! Наш менеджер свяжется с вами.');
                    closeModal();
                    loadCart();
                } else {
                    alert('Ошибка при оформлении заказа');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка сети');
            }
        });
    }
});

// Получение товаров из корзины
async function getCartItems() {
    const response = await fetch('/api/cart');
    const data = await response.json();
    return data.items;
}

// ===== ОБРАБОТЧИК КНОПКИ "ОФОРМИТЬ ЗАКАЗ" =====
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = function(e) {
            e.preventDefault();
            openModal();
        };
    }
});

// Загрузка корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});