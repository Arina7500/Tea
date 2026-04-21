const express = require('express');
const path = require('path');
const app = express();

// Настройка шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Подключение статических файлов
app.use('/css', express.static(path.join(__dirname, 'app/public/css')));
app.use('/js', express.static(path.join(__dirname, 'app/public/js')));
app.use('/изображения', express.static(path.join(__dirname, 'app/public/изображения')));

// Главная страница
app.get('/', (req, res) => {
    res.render('index', { cartCount: 0 });
});

// Страница каталога
app.get('/catalog', (req, res) => {
    res.render('catalog', { cartCount: 0 });
});

// Страница корзины
app.get('/cart', (req, res) => {
    res.render('cart', { cartCount: 0 });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});