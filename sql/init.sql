-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление колонки is_popular в таблицу products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;

-- Таблица сессий корзины
CREATE TABLE IF NOT EXISTS cart_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица элементов корзины
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_session_id INT NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    UNIQUE(cart_session_id, product_id)
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_date DATE,
    comment TEXT,
    payment_method VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица элементов заказа
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL
);
-- Чай (8 товаров)
INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
('Шу Пуэр', 'Выдержанный Пуэр с насыщенным вкусом.', 1300, 'Чай', '/images/шу_пуэр.jpg', 100),
('Хо Шань Хуан Я', 'Достойный и редкий жёлтый чай из провинции Анхой.', 1020, 'Чай', '/images/Хо_Шань_Хуан_Я.jpg', 50),
('Аньхуа Хэй Ча "Цянцзань" Цзинь Хуа', 'Классический черный чай из провинции Хунань.', 400, 'Чай', '/images/Аньхуа_Хэй.jpg', 60),
('Те Гуань Инь', 'Знаменитый улун из провинции Фуцзянь.', 1050, 'Чай', '/images/те_гуань_инь.jpg', 85),
('Юэ Гуан Бай', 'Мягкий и нежный белый чай.', 1000, 'Чай', '/images/юэ_гуан_бай.jpg', 70),
('Лунцзин', 'Знаменитый чай из Ханчжоу.', 1000, 'Чай', '/images/лунцзин.jpg', 75),
('Лао Ча Тоу', 'Молодые чайные головы из провинции Юньнань 2-ух летней выдержки.', 400, 'Чай', '/images/лао.jpg', 45),
('Шен Пуэр Со Старых Деревьев', 'Шен пуэр из провинции Юньнань из знаменитых чайных садов.', 550, 'Чай', '/images/шен_пуэр.jpg', 55),

-- Чайные смеси (7 товаров)
('Шу Пуэр Вишня', 'Четырехлетний ароматизированный шу пуэр с цельными ягодами вишни.', 400, 'Чайные смеси', '/images/пуэр_вишня.jpg', 50),
('Шу Пуэр То Ча С Апельсином', 'Идеально подходит для однократного заваривания в кружке.', 25, 'Чайные смеси', '/images/пуэр_апельсин.jpg', 100),
('Шу Пуэр То Ча С Жасмином', 'Идеально подходит для однократного заваривания в кружке.', 25, 'Чайные смеси', '/images/пуэр_жасмин.jpg', 100),
('Шу Пуэр То Ча С Желтой Хризантемой', 'Идеально подходит для однократного заваривания в кружке.', 25, 'Чайные смеси', '/images/пуэр_хризантема.jpg', 100),
('Чай Травяной "Таежный Сбор"', 'В состав входят гибискус, шиповник, мята, фенхель, листья клубники и цветки ромашки.', 290, 'Чайные смеси', '/images/таёжный_сбор.jpg', 40),
('Чай Травяной "Сила Трав"', 'В состав входят чабрец, мята, фенхель, лист клубники, лаванда и шалфей.', 290, 'Чайные смеси', '/images/травянной_чай.jpg', 40),
('Чай Травяной "Малина С Мятой"', 'В состав входит каркаде, сушеное яблоко, листья мяты и клубники, лепестки календулы, малина.', 290, 'Чайные смеси', '/images/малина_мята.jpg', 40),

-- Чайная утварь (13 товаров)
('Ча Хэ Фарфор "Горы И Реки"', 'Чайная коробочка из фарфора для удобства пересыпания сухой чайной россыпи.', 400, 'Чайная утварь', '/images/горы_реки.jpg', 30),
('Ча Хэ Фарфор "Лотосовый Пруд"', 'Чайная коробочка из фарфора для удобства пересыпания сухой чайной россыпи.', 400, 'Чайная утварь', '/images/лотосовый_пруд.jpg', 30),
('Чайник "Дукай"', 'Фарфоровый чайник. Слив воды плавный, неспешный.', 1200, 'Чайная утварь', '/images/Чайник_Фарфор_Дукай_Фуцзянь.jpg', 20),
('Чайник Фарфор "Рыбак"', 'Фарфоровый чайник с селадоновой глазурью из Дэхуа с изображением рыбака.', 920, 'Чайная утварь', '/images/рыбак.jpg', 15),
('Чайник Эгоист Текстурная Глина "Ву Лу" Тыква', 'Чайник-эгоист малого объема из текстурной глины формы "Тыква".', 1680, 'Чайная утварь', '/images/тыква.jpg', 10),
('Чайник "Рыбы в пруду"', 'Фарфоровый чайник с росписью.', 1280, 'Чайная утварь', '/images/чайник_рыбы_в_пруду.jpg', 25),
('Чайник Эгоист Керамика "Зеленая Глазурь"', 'Отлично подходит для любых видов чая.', 1180, 'Чайная утварь', '/images/зеленая_глазурь.jpg', 12),
('Фигурка "Благородный слон"', 'Символ счастья и удачи.', 1820, 'Чайная утварь', '/images/слон.jpg', 8),
('Фигурка Для Чайной Церемонии "Молитва"', 'Фигурка-миниатюра из белого матового фарфора в виде монаха.', 280, 'Чайная утварь', '/images/молитва.jpg', 50),
('Фигурка Для Чайной Церемонии "Дух Маленький Монах"', 'Фигурка из темной исинской глины.', 1330, 'Чайная утварь', '/images/монах.jpg', 20),
('Чайница "Сакура"', 'Чайница из матового белого фарфора с изображением сакуры.', 440, 'Чайная утварь', '/images/чайница_сакура.jpg', 35),
('Гайвань "Сад спокойствия"', 'Высококачественная гайвань из фарфора.', 630, 'Чайная утварь', '/images/гайвань_сад.jpg', 25),
('Гайвань Фарфор "Дерево" Санкай', 'Роспись с изображением дерева в технике Сань-цай (Санкай).', 870, 'Чайная утварь', '/images/гайвань_дерево.jpg', 18)

ON CONFLICT (id) DO NOTHING;

-- Таблица категорий для Чайной карты
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка данных для категорий
INSERT INTO categories (name, description, image_url, sort_order) VALUES
('Чай', 'В чайной карте представлены чаи, классифицированные по степени ферментации. Белый, чёрный, зелёный, красный, жёлтый чаи или улуны и пуэры.', '/images/чай.jpg', 1),
('Чайные смеси и травяные чаи', 'Раздел содержит травяные чаи и чайные смеси.', '/images/чайные_смеси.jpg', 2),
('Чайная утварь', 'Всё, что может понадобиться для чайной церемонии или просто удобного чаепития. Чайники, пиалы, гайвани, чахаи и многое другое.', '/images/чайная_утварь.jpg', 3)
ON CONFLICT (name) DO NOTHING;

UPDATE products SET is_popular = TRUE WHERE id IN (1,2,4,6,18,21,23,26,27,29,30,31,33,34,35,36,37);

SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;