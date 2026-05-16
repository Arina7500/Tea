class CartItem {
    constructor(data) {
        this.productId = data.product_id;
        this.quantity = data.quantity;
        this.name = data.name;
        this.price = parseFloat(data.price);
        this.imageUrl = data.image_url;
    }

    getTotalPrice() {
        return this.price * this.quantity;
    }

    toJSON() {
        return {
            productId: this.productId,
            quantity: this.quantity,
            name: this.name,
            price: this.price,
            imageUrl: this.imageUrl,
            totalPrice: this.getTotalPrice()
        };
    }
}

module.exports = CartItem;