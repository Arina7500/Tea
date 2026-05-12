-- Таблица категорий 
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров 
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    product_id INT NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL
);

-- Добавление категорий
INSERT INTO categories (name, description, image_url, sort_order) VALUES
('Чай', 'В чайной карте представлены чаи, классифицированные по степени ферментации. Белый, чёрный, зелёный, красный, жёлтый чаи или улуны и пуэры.', '/images/чай.jpg', 1),
('Чайные смеси', 'Раздел содержит травяные чаи и чайные смеси.', '/images/чайные_смеси.jpg', 2),
('Чайная утварь', 'Всё, что может понадобиться для чайной церемонии или просто удобного чаепития. Чайники, пиалы, гайвани, чахаи и многое другое.', '/images/чайная_утварь.jpg', 3)
ON CONFLICT (name) DO NOTHING;

-- Категория 1 = Чай
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES
('Шу Пуэр', 'Выдержанный Пуэр с насыщенным вкусом.', 1300, 1, '/images/шу_пуэр.jpg', 100),
('Хо Шань Хуан Я', 'Достойный и редкий жёлтый чай из провинции Анхой.', 1020, 1, '/images/Хо_Шань_Хуан_Я.jpg', 50),
('Аньхуа Хэй Ча "Цянцзань" Цзинь Хуа', 'Классический черный чай из провинции Хунань.', 400, 1, '/images/Аньхуа_Хэй.jpg', 60),
('Те Гуань Инь', 'Знаменитый улун из провинции Фуцзянь.', 1050, 1, '/images/те_гуань_инь.jpg', 85),
('Юэ Гуан Бай', 'Мягкий и нежный белый чай.', 1000, 1, '/images/юэ_гуан_бай.jpg', 70),
('Лунцзин', 'Знаменитый чай из Ханчжоу.', 1000, 1, '/images/лунцзин.jpg', 75),
('Лао Ча Тоу', 'Молодые чайные головы из провинции Юньнань 2-ух летней выдержки.', 400, 1, '/images/лао.jpg', 45),
('Шен Пуэр Со Старых Деревьев', 'Шен пуэр из провинции Юньнань из знаменитых чайных садов.', 550, 1, '/images/шен_пуэр.jpg', 55),

-- Категория 2 = Чайные смеси
('Шу Пуэр Вишня', 'Четырехлетний ароматизированный шу пуэр с цельными ягодами вишни.', 400, 2, '/images/пуэр_вишня.jpg', 50),
('Шу Пуэр То Ча С Апельсином', 'Идеально подходит для однократного заваривания в кружке.', 25, 2, '/images/пуэр_апельсин.jpg', 100),
('Шу Пуэр То Ча С Жасмином', 'Идеально подходит для однократного заваривания в кружке.', 25, 2, '/images/пуэр_жасмин.jpg', 100),
('Шу Пуэр То Ча С Желтой Хризантемой', 'Идеально подходит для однократного заваривания в кружке.', 25, 2, '/images/пуэр_хризантема.jpg', 100),
('Чай Травяной "Таежный Сбор"', 'В состав входят гибискус, шиповник, мята, фенхель, листья клубники и цветки ромашки.', 290, 2, '/images/таёжный_сбор.jpg', 40),
('Чай Травяной "Сила Трав"', 'В состав входят чабрец, мята, фенхель, лист клубники, лаванда и шалфей.', 290, 2, '/images/травянной_чай.jpg', 40),
('Чай Травяной "Малина С Мятой"', 'В состав входит каркаде, сушеное яблоко, листья мяты и клубники, лепестки календулы, малина.', 290, 2, '/images/малина_мята.jpg', 40),

-- Категория 3 = Чайная утварь
('Ча Хэ Фарфор "Горы И Реки"', 'Чайная коробочка из фарфора для удобства пересыпания сухой чайной россыпи.', 400, 3, '/images/горы_реки.jpg', 30),
('Ча Хэ Фарфор "Лотосовый Пруд"', 'Чайная коробочка из фарфора для удобства пересыпания сухой чайной россыпи.', 400, 3, '/images/лотосовый_пруд.jpg', 30),
('Чайник "Дукай"', 'Фарфоровый чайник. Слив воды плавный, неспешный.', 1200, 3, '/images/Чайник_Фарфор_Дукай_Фуцзянь.jpg', 20),
('Чайник Фарфор "Рыбак"', 'Фарфоровый чайник с селадоновой глазурью из Дэхуа с изображением рыбака.', 920, 3, '/images/рыбак.jpg', 15),
('Чайник Эгоист Текстурная Глина "Ву Лу" Тыква', 'Чайник-эгоист малого объема из текстурной глины формы "Тыква".', 1680, 3, '/images/тыква.jpg', 10),
('Чайник "Рыбы в пруду"', 'Фарфоровый чайник с росписью.', 1280, 3, '/images/чайник_рыбы_в_пруду.jpg', 25),
('Чайник Эгоист Керамика "Зеленая Глазурь"', 'Отлично подходит для любых видов чая.', 1180, 3, '/images/зеленая_глазурь.jpg', 12),
('Фигурка "Благородный слон"', 'Символ счастья и удачи.', 1820, 3, '/images/слон.jpg', 8),
('Фигурка Для Чайной Церемонии "Молитва"', 'Фигурка-миниатюра из белого матового фарфора в виде монаха.', 280, 3, '/images/молитва.jpg', 50),
('Фигурка Для Чайной Церемонии "Дух Маленький Монах"', 'Фигурка из темной исинской глины.', 1330, 3, '/images/монах.jpg', 20),
('Чайница "Сакура"', 'Чайница из матового белого фарфора с изображением сакуры.', 440, 3, '/images/чайница_сакура.jpg', 35),
('Гайвань "Сад спокойствия"', 'Высококачественная гайвань из фарфора.', 630, 3, '/images/гайвань_сад.jpg', 25),
('Гайвань Фарфор "Дерево" Санкай', 'Роспись с изображением дерева в технике Сань-цай (Санкай).', 870, 3, '/images/гайвань_дерево.jpg', 18)

ON CONFLICT (id) DO NOTHING;

-- Отметить популярные товары
UPDATE products SET is_popular = TRUE WHERE id IN (1,2,4,6,18,21,23,26,27,29,30,31,33,34,35,36,37);

-- Проверка категорий
SELECT c.name as category, COUNT(*) as count 
FROM products p 
JOIN categories c ON p.category_id = c.id 
GROUP BY c.name ORDER BY c.id;