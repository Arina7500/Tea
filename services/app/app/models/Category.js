class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.imageUrl = data.image_url;
        this.sortOrder = data.sort_order;
        this.createdAt = data.created_at;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            imageUrl: this.imageUrl,
            sortOrder: this.sortOrder,
            createdAt: this.createdAt
        };
    }
}

module.exports = Category;