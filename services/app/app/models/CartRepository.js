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
        
        return result.rows;
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
}

module.exports = CartRepository;