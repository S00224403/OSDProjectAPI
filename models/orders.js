const mongoose = require('mongoose');
const Joi = require('joi');
const { Product } = require('./products');
const addressSchema = new mongoose.Schema({
    addressLine: String,
    town: String,
    county: String,
    zip: String
}, {_id: false});//id false means that the address will not have an id (it will be a subdocument)
//got this from chatgpt as new ids were being created for the address and product schema
const productSchema = new mongoose.Schema({
    productId: mongoose.Types.ObjectId,
    quantity: Number,
    price: Number,
}, {_id: false})
const orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: {type : String, default: "unknown"},
    address : addressSchema,
    orderDate: {type : Date, default: Date.now()},
    products: [productSchema],
})


const Order = mongoose.model('order', orderSchema);
async function ValidateOrder(order) {
    const orderJoiSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().min(2).max(10).required(),
        address: Joi.object({
            addressLine: Joi.string().min(8).max(50).required(),
            town: Joi.string().min(2).max(50).required(),
            county: Joi.string().min(4).max(50).required(),
            zip: Joi.string().regex(/^[A-Z][0-9]{2} [A-Z0-9]{4}$/).required(),
        }).required(),
        orderDate: Joi.date(),
        products: Joi.array().items(Joi.object({
            productId: Joi.string().hex().length(24).required(),
            quantity: Joi.number().min(1).required(),
            price: Joi.number().min(0).required(),
        })).required().min(1), // At least one product must be in the order
    });

    // Validate the order. Code from chat gpt below
    const { error } = orderJoiSchema.validate(order);

    if (error) {
        return error;
    }

    const productErrors = [];

     // Check if the product exists in the database
     for (const product of order.products) {
        try {
            const productValid = await Product.findById(product.productId);
            if (!productValid) {
                productErrors.push(`Product with ID ${product.productId} does not exist in the database.`);
            }
        } catch (err) {
            productErrors.push(`Error checking product with ID ${product.productId} in the database: ${err.message}`);
        }
    }
    

    if (productErrors.length > 0) {
        return productErrors;
    }

    return null; // No validation errors
}
async function FindOrderByProductId(productId) {
    try{
        const orderWithProduct = await Order.findOne({ "products.productId": productId });
        return orderWithProduct;
    } catch (error){
        throw (`Error finding order by product ID: ${error.message}`)
    }
}
module.exports = {Order, ValidateOrder, FindOrderByProductId}