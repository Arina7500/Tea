const Product = require('./Product');
const Category = require('./Category');
const CartItem = require('./CartItem');

class ProductRepository {
    constructor(db) {
        this.db = db;
    }

    async getAll() {
        const result = await this.db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.id
        `);
        return result.rows.map(row => new Product(row));
    }

    async getByCategory(categoryName) {
        const result = await this.db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE c.name = $1 
            ORDER BY p.id
        `, [categoryName]);
        return result.rows.map(row => new Product(row));
    }

    async getPopular(limit = 9) {
        const result = await this.db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.is_popular = true 
            ORDER BY p.id 
            LIMIT $1
        `, [limit]);
        return result.rows.map(row => new Product(row));
    }

    async getById(id) {
        const result = await this.db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = $1
        `, [id]);
        return result.rows[0] ? new Product(result.rows[0]) : null;
    }

    async getCategories() {
        const result = await this.db.query(
            'SELECT * FROM categories ORDER BY sort_order, id'
        );
        return result.rows.map(row => new Category(row));
    }

    async updateStock(productId, quantity) {
        const result = await this.db.query(
            'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 RETURNING stock_quantity',
            [quantity, productId]
        );
        return result.rows[0];
    }
}

module.exports = ProductRepository;