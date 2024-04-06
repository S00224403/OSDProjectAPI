const mongoose = require('mongoose');
const Joi = require('joi');


const categorySchema = new mongoose.Schema({
    categoryName: String,
    description: String,
    categoryImage: String
})
const Category = mongoose.model('category', categorySchema);
function ValidateCategory(category) {
    const categoryJoiSchema = Joi.object({
        categoryName: Joi.string().min(4).max(50).required(),
        description: Joi.string().min(10).max(500).required(),
        categoryImage: Joi.string().max(500).optional().allow('')
    });

    return categoryJoiSchema.validate(category);
}
async function ValidateDeleteCategory(categoryId) {
    const { FindProductByCategoryId } = require('./products');
    const categoryErrors = [];
    try {
        const productWithCategory = await FindProductByCategoryId(categoryId);
        if (productWithCategory) {
            categoryErrors.push(`Category id : ${categoryId} is linked to a product and cannot be deleted`);
        }
    } catch (err) {
        categoryErrors.push(`Error checking category in the database. ${err.message}`);
    }
    if (categoryErrors.length > 0) {
        return categoryErrors;
    }
    return null;
}
module.exports = {Category, ValidateCategory, ValidateDeleteCategory}