class ValidationService {
    static validatePhone(phone) {
        const phoneRegex = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateOrderData(data) {
        const { name, phone, email, address, payment, items } = data;
        
        if (!name || name.trim().length < 5) {
            return { valid: false, error: 'Введите полное ФИО' };
        }
        if (!phone || !this.validatePhone(phone)) {
            return { valid: false, error: 'Введите корректный номер телефона' };
        }
        if (!email || !this.validateEmail(email)) {
            return { valid: false, error: 'Введите корректный email' };
        }
        if (!address || address.trim().length < 10) {
            return { valid: false, error: 'Введите полный адрес доставки' };
        }
        if (!payment) {
            return { valid: false, error: 'Выберите способ оплаты' };
        }
        if (!items || items.length === 0) {
            return { valid: false, error: 'Корзина пуста' };
        }
        
        return { valid: true };
    }
}

module.exports = ValidationService;