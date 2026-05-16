class PageController {
    constructor(productRepo, cartRepo) {
        this.productRepo = productRepo;
        this.cartRepo = cartRepo;
    }

    async getHomePage(req, res) {
        try {
            const categories = await this.productRepo.getCategories();
            const popularProducts = await this.productRepo.getPopular(9);
            const cartCount = await this.cartRepo.getCartCount(req.session.id);
            
            res.render('index', { categories, popularProducts, cartCount });
        } catch (error) {
            console.error('Ошибка загрузки главной страницы:', error);
            res.status(500).send('Ошибка сервера');
        }
    }

    async getCatalogPage(req, res) {
        try {
            const teas = await this.productRepo.getByCategory('Чай');
            const teaMixes = await this.productRepo.getByCategory('Чайные смеси');
            const utensils = await this.productRepo.getByCategory('Чайная утварь');
            const popular = await this.productRepo.getPopular(9);
            const cartCount = await this.cartRepo.getCartCount(req.session.id);
            
            res.render('catalog', { teas, teaMixes, utensils, popular, cartCount });
        } catch (error) {
            console.error('Ошибка загрузки каталога:', error);
            res.status(500).send('Ошибка сервера');
        }
    }

    async getCartPage(req, res) {
        try {
            const cartItems = await this.cartRepo.getCartItems(req.session.id);
            const cartCount = await this.cartRepo.getCartCount(req.session.id);
            const total = await this.cartRepo.getCartTotal(req.session.id);
            
            res.render('cart', { cartCount, total, cartItems });
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            res.status(500).send('Ошибка сервера');
        }
    }
}

module.exports = PageController;