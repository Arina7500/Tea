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
        
        // Обновляем счетчик
        updateCartCounter(data.count);
        
        // Если мы на странице корзины — отображаем товары
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

// Загрузка корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});