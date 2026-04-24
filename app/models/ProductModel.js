// Модель для работы с таблицей products

class ProductModel {
    constructor(db) {
        this.db = db; // Внедрение зависимости (DI)
    }

    // Получить все товары
    async getAll() {
        const result = await this.db.query(
            'SELECT * FROM products ORDER BY id'
        );
        return result.rows;
    }

    // Получить товары по категории
    async getByCategory(category) {
        const result = await this.db.query(
            'SELECT * FROM products WHERE category = $1 ORDER BY id',
            [category]
        );
        return result.rows;
    }

    // Получить популярные товары (например, первые 9)
    async getPopular(limit = 9) {
        const result = await this.db.query(
            'SELECT * FROM products LIMIT $1',
            [limit]
        );
        return result.rows;
    }

    // Получить товар по ID
    async getById(id) {
        const result = await this.db.query(
            'SELECT * FROM products WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    // Обновить остаток на складе
    async updateStock(productId, quantity) {
        const result = await this.db.query(
            'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 RETURNING stock_quantity',
            [quantity, productId]
        );
        return result.rows[0];
    }
}

module.exports = ProductModel;
