const CartItem = require('./CartItem');

class CartRepository {
    constructor(db) {
        this.db = db;
    }

    async getOrCreateSession(sessionId) {
        let result = await this.db.query(
            'SELECT id FROM cart_sessions WHERE session_id = $1',
            [sessionId]
        );
        
        if (result.rows.length === 0) {
            result = await this.db.query(
                'INSERT INTO cart_sessions (session_id) VALUES ($1) RETURNING id',
                [sessionId]
            );
        }
        
        return result.rows[0].id;
    }

    async getCartItems(sessionId) {
        const session = await this.getOrCreateSession(sessionId);
        
        const result = await this.db.query(`
            SELECT ci.product_id, ci.quantity, p.name, p.price, p.image_url
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_session_id = $1
        `, [session]);
        
        return result.rows.map(row => new CartItem(row));
    }

    async getCartItemsJSON(sessionId) {
        const items = await this.getCartItems(sessionId);
        return items.map(item => item.toJSON());
    }

    async addItem(sessionId, productId, quantity = 1) {
        const session = await this.getOrCreateSession(sessionId);
        
        await this.db.query(
            `INSERT INTO cart_items (cart_session_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (cart_session_id, product_id)
             DO UPDATE SET quantity = cart_items.quantity + $3`,
            [session, productId, quantity]
        );
        
        return true;
    }

    async updateQuantity(sessionId, productId, quantity) {
        const session = await this.getOrCreateSession(sessionId);
        
        if (quantity <= 0) {
            return this.removeItem(sessionId, productId);
        }
        
        await this.db.query(
            'UPDATE cart_items SET quantity = $1 WHERE cart_session_id = $2 AND product_id = $3',
            [quantity, session, productId]
        );
        
        return true;
    }

    async removeItem(sessionId, productId) {
        const session = await this.getOrCreateSession(sessionId);
        
        await this.db.query(
            'DELETE FROM cart_items WHERE cart_session_id = $1 AND product_id = $2',
            [session, productId]
        );
        
        return true;
    }

    async clearCart(sessionId) {
        const session = await this.getOrCreateSession(sessionId);
        
        await this.db.query(
            'DELETE FROM cart_items WHERE cart_session_id = $1',
            [session]
        );
        
        return true;
    }

    async getCartCount(sessionId) {
        const session = await this.getOrCreateSession(sessionId);
        
        const result = await this.db.query(
            'SELECT COALESCE(SUM(quantity), 0) as total FROM cart_items WHERE cart_session_id = $1',
            [session]
        );
        
        return parseInt(result.rows[0].total);
    }

    async getCartTotal(sessionId) {
        const session = await this.getOrCreateSession(sessionId);
        
        const result = await this.db.query(
            `SELECT COALESCE(SUM(p.price * ci.quantity), 0) as total
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_session_id = $1`,
            [session]
        );
        
        return parseFloat(result.rows[0].total);
    }

    async createOrder(sessionId, name, phone, email, address, deliveryDate, comment, payment, items) {
        const client = await this.db.getClient();
        
        try {
            await client.query('BEGIN');
            
            const session = await this.getOrCreateSession(sessionId);
            
            const totalResult = await client.query(
                `SELECT COALESCE(SUM(p.price * ci.quantity), 0) as total
                 FROM cart_items ci
                 JOIN products p ON ci.product_id = p.id
                 WHERE ci.cart_session_id = $1`,
                [session]
            );
            const totalAmount = parseFloat(totalResult.rows[0].total);
            
            const orderResult = await client.query(
                `INSERT INTO orders 
                 (session_id, customer_name, customer_phone, customer_email, 
                  delivery_address, delivery_date, comment, payment_method, total_amount)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING id`,
                [sessionId, name, phone, email, address, deliveryDate, comment || null, payment, totalAmount]
            );
            
            const orderId = orderResult.rows[0].id;
            
            for (const item of items) {
                await client.query(
                    `INSERT INTO order_items 
                     (order_id, product_id, product_name, quantity, price_at_time)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [orderId, item.product_id, item.name, item.quantity, item.price]
                );
            }
            
            await client.query(
                `DELETE FROM cart_items WHERE cart_session_id = $1`,
                [session]
            );
            
            await client.query('COMMIT');
            
            return { orderId, totalAmount };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = CartRepository;