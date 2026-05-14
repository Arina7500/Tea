require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { Pool } = require('pg');

// Импорт контроллеров
const CartController = require('./app/controllers/cartController');
const OrderController = require('./app/controllers/orderController');
const PageController = require('./app/controllers/pageController');

// Импорт репозиториев
const ProductRepository = require('./app/models/ProductRepository');
const CartRepository = require('./app/models/CartRepository');

const app = express();

// DI контейнер
function createContainer() {
    const db = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'tea_shop',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    });

    db.connect((err) => {
        if (err) {
            console.error('Ошибка подключения к БД:', err.message);
        } else {
            console.log('Подключение к PostgreSQL успешно');
        }
    });

    const productRepo = new ProductRepository(db);
    const cartRepo = new CartRepository(db);
    
    const cartController = new CartController(cartRepo);
    const orderController = new OrderController(db, cartRepo);
    const pageController = new PageController(productRepo, cartRepo);

    return { db, cartController, orderController, pageController };
}

const { cartController, orderController, pageController } = createContainer();

// Настройка express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use('/css', express.static(path.join(__dirname, 'app/public/css')));
app.use('/js', express.static(path.join(__dirname, 'app/public/js')));
app.use('/images', express.static(path.join(__dirname, 'app/public/images')));

// API маршруты
app.get('/api/cart', (req, res) => cartController.getCart(req, res));
app.post('/api/cart/add', (req, res) => cartController.addToCart(req, res));
app.put('/api/cart/update', (req, res) => cartController.updateQuantity(req, res));
app.delete('/api/cart/remove/:productId', (req, res) => cartController.removeItem(req, res));
app.post('/api/orders', (req, res) => orderController.createOrder(req, res));

// Страницы
app.get('/', (req, res) => pageController.getHomePage(req, res));
app.get('/catalog', (req, res) => pageController.getCatalogPage(req, res));
app.get('/cart', (req, res) => pageController.getCartPage(req, res));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});