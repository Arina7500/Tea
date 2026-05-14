const ValidationService = require('../services/ValidationService');

class OrderController {
    constructor(db, cartRepo) {
        this.db = db;
        this.cartRepo = cartRepo;
    }

    async createOrder(req, res) {
        try {
            const { name, phone, email, address, deliveryDate, comment, payment, items } = req.body;
            const sessionId = req.session.id;
            
            // Валидация
            const validation = ValidationService.validateOrderData({ name, phone, email, address, payment, items });
            if (!validation.valid) {
                return res.status(400).json({ error: validation.error });
            }
            
            // Сохраняем заказ (вся логика в репозитории)
            const result = await this.cartRepo.createOrder(
                sessionId, name, phone, email, address, deliveryDate, comment, payment, items
            );
            
            res.json({ success: true, orderId: result.orderId, totalAmount: result.totalAmount });
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
}

module.exports = OrderController;