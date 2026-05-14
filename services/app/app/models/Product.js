class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = parseFloat(data.price);
        this.categoryId = data.category_id;
        this.imageUrl = data.image_url;
        this.stockQuantity = data.stock_quantity;
        this.isPopular = data.is_popular;
        this.createdAt = data.created_at;
        this.categoryName = data.category_name;
    }

    getFormattedPrice() {
        return `${this.price} ₽`;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            categoryId: this.categoryId,
            imageUrl: this.imageUrl,
            stockQuantity: this.stockQuantity,
            isPopular: this.isPopular,
            createdAt: this.createdAt,
            categoryName: this.categoryName
        };
    }
}

module.exports = Product;