require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();

// DI контейнер
function createContainer() {
    // Подключение к БД
    const db = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'tea_shop',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    });

    // Проверка подключения 
    db.connect((err) => {
        if (err) {
            console.error('Ошибка подключения к БД:', err.message);
        } else {
            console.log('Подключение к PostgreSQL успешно');
        }
    });

    // Репозитории 
    const ProductRepository = require('./app/models/ProductRepository');
    const CartRepository = require('./app/models/CartRepository');

    const productRepo = new ProductRepository(db);
    const cartRepo = new CartRepository(db);

    return { db, productRepo, cartRepo };
}

// Инициализация зависимостей
const { db, productRepo, cartRepo } = createContainer();

// Настройка express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Сессии для идентификации корзины
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Статические файлы
app.use('/css', express.static(path.join(__dirname, 'app/public/css')));
app.use('/js', express.static(path.join(__dirname, 'app/public/js')));
app.use('/images', express.static(path.join(__dirname, 'app/public/images')));

// API для корзины (CRUD) 

// READ - получить корзину
app.get('/api/cart', async (req, res) => {
    try {
        const sessionId = req.session.id;
        const items = await cartRepo.getCartItems(sessionId);
        const count = await cartRepo.getCartCount(sessionId);
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        res.json({ items, total, count });
    } catch (error) {
        console.error('Ошибка GET /api/cart:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// CREATE - добавить товар в корзину
app.post('/api/cart/add', async (req, res) => {
    try {
        let { productId, quantity = 1 } = req.body;
        
        productId = parseInt(productId);
        quantity = parseInt(quantity);
        
        if (isNaN(productId) || productId <= 0) {
            return res.status(400).json({ error: 'Неверный ID товара' });
        }
        if (isNaN(quantity) || quantity < 1 || quantity > 999) {
            return res.status(400).json({ error: 'Неверное количество' });
        }
        
        const sessionId = req.session.id;
        await cartRepo.addItem(sessionId, productId, quantity);
        const count = await cartRepo.getCartCount(sessionId);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error('Ошибка POST /api/cart/add:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// UPDATE - обновить количество товара
app.put('/api/cart/update', async (req, res) => {
    try {
        let { productId, quantity } = req.body;
        
        productId = parseInt(productId);
        quantity = parseInt(quantity);
        
        if (isNaN(productId) || productId <= 0) {
            return res.status(400).json({ error: 'Неверный ID товара' });
        }
        if (isNaN(quantity) || quantity < 0 || quantity > 999) {
            return res.status(400).json({ error: 'Неверное количество' });
        }
        
        const sessionId = req.session.id;
        await cartRepo.updateQuantity(sessionId, productId, quantity);
        const count = await cartRepo.getCartCount(sessionId);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error('Ошибка PUT /api/cart/update:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// DELETE - удалить товар из корзины
app.delete('/api/cart/remove/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        
        if (isNaN(productId) || productId <= 0) {
            return res.status(400).json({ error: 'Неверный ID товара' });
        }
        
        const sessionId = req.session.id;
        await cartRepo.removeItem(sessionId, productId);
        const count = await cartRepo.getCartCount(sessionId);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error('Ошибка DELETE /api/cart/remove:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Страницы

// Главная страница
app.get('/', async (req, res) => {
    try {
        const categories = await productRepo.getCategories();
        const popularProducts = await productRepo.getPopular(9);
        const cartCount = await cartRepo.getCartCount(req.session.id);
        
        res.render('index', { categories, popularProducts, cartCount });
    } catch (error) {
        console.error('Ошибка загрузки главной страницы:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Страница каталога
app.get('/catalog', async (req, res) => {
    try {
        const teas = await productRepo.getByCategory('Чай');
        const teaMixes = await productRepo.getByCategory('Чайные смеси');
        const utensils = await productRepo.getByCategory('Чайная утварь');
        const popular = await productRepo.getPopular(9);
        const cartCount = await cartRepo.getCartCount(req.session.id);
        
        res.render('catalog', { teas, teaMixes, utensils, popular, cartCount });
    } catch (error) {
        console.error('Ошибка загрузки каталога:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Страница корзины
app.get('/cart', async (req, res) => {
    try {
        const cartItems = await cartRepo.getCartItems(req.session.id);
        const cartCount = await cartRepo.getCartCount(req.session.id);
        
        let total = 0;
        cartItems.forEach(item => {
            total += item.price * item.quantity;
        });
        
        res.render('cart', { cartCount, total, cartItems });
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Заказы

// Создание заказа
app.post('/api/orders', async (req, res) => {
    try {
        const { name, phone, email, address, deliveryDate, comment, payment, items } = req.body;
        const sessionId = req.session.id;
        
        // Валидация
        if (!name || name.trim().length < 5) {
            return res.status(400).json({ error: 'Введите полное ФИО' });
        }
        if (!phone || !validatePhone(phone)) {
            return res.status(400).json({ error: 'Введите корректный номер телефона' });
        }
        if (!email || !validateEmail(email)) {
            return res.status(400).json({ error: 'Введите корректный email' });
        }
        if (!address || address.trim().length < 10) {
            return res.status(400).json({ error: 'Введите полный адрес доставки' });
        }
        if (!payment) {
            return res.status(400).json({ error: 'Выберите способ оплаты' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }
        
        // Вычисляем общую сумму
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += item.price * item.quantity;
        }
        
        // Сохраняем заказ
        const orderResult = await db.query(
            `INSERT INTO orders 
             (session_id, customer_name, customer_phone, customer_email, 
              delivery_address, delivery_date, comment, payment_method, total_amount)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [sessionId, name, phone, email, address, deliveryDate, comment || null, payment, totalAmount]
        );
        
        const orderId = orderResult.rows[0].id;
        
        // Сохраняем товары заказа
        for (const item of items) {
            await db.query(
                `INSERT INTO order_items 
                 (order_id, product_id, product_name, quantity, price_at_time)
                 VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.product_id, item.name, item.quantity, item.price]
            );
        }
        
        // Очищаем корзину
        await cartRepo.clearCart(sessionId);
        
        res.json({ success: true, orderId, totalAmount });
    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


function validatePhone(phone) {
    const phoneRegex = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});