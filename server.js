require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();

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

// Модели
const ProductModel = require('./app/models/ProductModel');
const CartModel = require('./app/models/CartModel');

const productModel = new ProductModel(db);
const cartModel = new CartModel(db);

// Настройка express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'app/public')));

// Сессии 
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

// API маршруты

// Получить корзину
app.get('/api/cart', async (req, res) => {
    try {
        const sessionId = req.session.id;
        const items = await cartModel.getCartItems(sessionId);
        const count = await cartModel.getCartCount(sessionId);
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        res.json({ items, total, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавить товар
app.post('/api/cart/add', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const sessionId = req.session.id;
        
        await cartModel.addItem(sessionId, productId, quantity);
        const count = await cartModel.getCartCount(sessionId);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить количество
app.put('/api/cart/update', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const sessionId = req.session.id;
        
        await cartModel.updateQuantity(sessionId, productId, quantity);
        const count = await cartModel.getCartCount(sessionId);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить товар
app.delete('/api/cart/remove/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const sessionId = req.session.id;
        
        await cartModel.removeItem(sessionId, productId);
        const count = await cartModel.getCartCount(sessionId);
        
        res.json({ success: true, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Страницы

// Главная
app.get('/', async (req, res) => {
    try {
        const popular = await productModel.getPopular(9);
        const cartCount = await cartModel.getCartCount(req.session.id);
        
        res.render('index', { products: popular, cartCount });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Каталог
app.get('/catalog', async (req, res) => {
    try {
        const teas = await productModel.getByCategory('Чай');
        const teaMixes = await productModel.getByCategory('Чайные смеси');
        const utensils = await productModel.getByCategory('Чайная утварь');
        const popular = await productModel.getPopular(9);
        const cartCount = await cartModel.getCartCount(req.session.id);
        
        res.render('catalog', { teas, teaMixes, utensils, popular, cartCount });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Корзина
app.get('/cart', async (req, res) => {
    try {
        const sessionId = req.session.id;
        const cartItems = await cartModel.getCartItems(sessionId);
        const cartCount = await cartModel.getCartCount(sessionId);
        
        let total = 0;
        cartItems.forEach(item => {
            total += item.price * item.quantity;
        });
        
        res.render('cart', { cartItems, total, cartCount });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});