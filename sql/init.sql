-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сессий корзины
CREATE TABLE IF NOT EXISTS cart_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица элементов корзины (связь многие-ко-многим)
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_session_id INT NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    UNIQUE(cart_session_id, product_id)
);

-- Добавление тестовых товаров
INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
('Шу Пуэр', 'Выдержанный Пуэр с насыщенным вкусом.', 1300, 'Чай', '/images/shu_puer.jpg', 100),
('Те Гуань Инь', 'Знаменитый улун из провинции Фуцзянь.', 1050, 'Чай', '/images/te_guan_yin.jpg', 85),
('Лунцзин', 'Знаменитый чай из Ханчжоу.', 1000, 'Чай', '/images/luntszin.jpg', 75)
ON CONFLICT DO NOTHING;

-- Проверка
SELECT * FROM products;