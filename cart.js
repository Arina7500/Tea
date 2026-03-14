// Ключ, под которым корзина будет храниться в localStorage
const CART_STORAGE_KEY = 'myShoppingCart';

// Функция для получения корзины из localStorage
function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

// Функция для сохранения корзины в localStorage
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCounter(cart);
}

// Функция для добавления товара в корзину
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

// Функция для изменения количества товара
function changeQuantity(index, delta) {
    const cart = getCart();
    cart[index].quantity += delta;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCart(cart);
    
    // Если мы на странице корзины, обновляем отображение
    if (typeof displayCart === 'function') {
        displayCart();
    }
}

// Функция для удаления товара из корзины
function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    
    if (typeof displayCart === 'function') {
        displayCart();
    }
}

// Функция для обновления счетчика на иконке корзины в шапке
function updateCartCounter(cart) {
    const counterElement = document.getElementById('cart-counter');
    if (counterElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        counterElement.textContent = totalItems;
    }
}

// При загрузке страницы обновляем счетчик
document.addEventListener('DOMContentLoaded', () => {
    const cart = getCart();
    updateCartCounter(cart);
});

// Делаем функции глобальными
window.addToCart = addToCart;
window.getCart = getCart;
window.saveCart = saveCart;
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;