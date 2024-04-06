const mongoose = require('mongoose');
const Joi = require('joi');
const { Category } = require('./categories');

const productSchema = new mongoose.Schema({
    productName: String,
    description: String,
    price: Number,
    quantityInStock: Number,
    manufacturer: String,
    productImage: String,
    category: mongoose.Types.ObjectId,
});

const Product = mongoose.model('product', productSchema);
async function ValidateProduct(product) {
    const productJoiSchema = Joi.object({
        productName: Joi.string().min(2).max(50).required(),
        description: Joi.string().min(2).max(500).required(),
        price: Joi.number().min(0.01).required(),
        quantityInStock: Joi.number().min(0).required(),
        manufacturer: Joi.string().max(50).optional().allow(''),
        productImage: Joi.string().max(500).optional().allow(''),
        category: Joi.string().hex().length(24).required()
    });

    // Validate the product. Code from chat gpt below
    const { error } = productJoiSchema.validate(product);

    // Return the result of the validation if their are errors
    if (error) {
        return error;
    }

    // Check if the category exists in the database
    try {
        const category = await Category.findById(product.category);
        if (!category) {
            return 'Category does not exist in the database.';
        }
    } catch (err) {
        return 'Error checking category in the database.';
    }

    return null; // No validation errors
}
async function FindProductByCategoryId(categoryId) {
    try {
        const productWithCategory = await Product.findOne({ category: categoryId });
        return productWithCategory;
    } catch (error) {
        throw (`Error finding product by category ID: ${error.message}`);
    }
}
async function ValidateDeleteProduct(productId) {
    const { FindOrderByProductId } = require('./orders');
    const productErrors = [];
    try {
        const orderWithProduct = await FindOrderByProductId(productId);
        if (orderWithProduct) {
            productErrors.push(`Product id : ${productId} is linked to an order and cannot be deleted`);
        }
    } catch (err) {
        productErrors.push(`Error checking product in the database. ${err.message}`);
    }
    if (productErrors.length > 0) {
        return productErrors;
    }
    return null;
}
module.exports = { Product, ValidateProduct, FindProductByCategoryId, ValidateDeleteProduct };


