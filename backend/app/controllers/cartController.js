class CartController {
    constructor(cartRepo) {
        this.cartRepo = cartRepo;
    }

    async getCart(req, res) {
        try {
            const sessionId = req.session.id;
            const items = await this.cartRepo.getCartItems(sessionId);
            const count = await this.cartRepo.getCartCount(sessionId);
            const total = await this.cartRepo.getCartTotal(sessionId);
            
            res.json({ 
                items: items.map(item => item.toJSON()), 
                total, 
                count 
            });
        } catch (error) {
            console.error('Ошибка GET /api/cart:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async addToCart(req, res) {
        try {
            let { productId, quantity = 1 } = req.body;
            
            productId = parseInt(productId);
            quantity = parseInt(quantity);
            
            if (isNaN(productId) || productId <= 0) {
                return res.status(400).json({ error: 'Неверный ID товара' });
            }
            if (isNaN(quantity) || quantity < 1 || quantity > 999) {
                return res.status(400).json({ error: 'Неверное количество' });
            }
            
            const sessionId = req.session.id;
            await this.cartRepo.addItem(sessionId, productId, quantity);
            const count = await this.cartRepo.getCartCount(sessionId);
            
            res.json({ success: true, count });
        } catch (error) {
            console.error('Ошибка POST /api/cart/add:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async updateQuantity(req, res) {
        try {
            let { productId, quantity } = req.body;
            
            productId = parseInt(productId);
            quantity = parseInt(quantity);
            
            if (isNaN(productId) || productId <= 0) {
                return res.status(400).json({ error: 'Неверный ID товара' });
            }
            if (isNaN(quantity) || quantity < 0 || quantity > 999) {
                return res.status(400).json({ error: 'Неверное количество' });
            }
            
            const sessionId = req.session.id;
            await this.cartRepo.updateQuantity(sessionId, productId, quantity);
            const count = await this.cartRepo.getCartCount(sessionId);
            
            res.json({ success: true, count });
        } catch (error) {
            console.error('Ошибка PUT /api/cart/update:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async removeItem(req, res) {
        try {
            const productId = parseInt(req.params.productId);
            
            if (isNaN(productId) || productId <= 0) {
                return res.status(400).json({ error: 'Неверный ID товара' });
            }
            
            const sessionId = req.session.id;
            await this.cartRepo.removeItem(sessionId, productId);
            const count = await this.cartRepo.getCartCount(sessionId);
            
            res.json({ success: true, count });
        } catch (error) {
            console.error('Ошибка DELETE /api/cart/remove:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
}

module.exports = CartController;