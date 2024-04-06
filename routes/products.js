const express = require('express');
const { Product, ValidateProduct, ValidateDeleteProduct } = require('../models/products.js');
const router = express.Router()
const { validateAuth0AccessToken } = require('../middleware/auth0.middleware.js');
//post route
router.post('/', validateAuth0AccessToken, async (req, res) => {
  let result = await ValidateProduct(req.body);

  if (result) {
    return res.status(400).json(result);
  }
  let product = new Product(req.body);
  try {
    product = await product.save();
    res
      .location(`${product._id}`)
      .status(201)
      .json(product);
  } catch (error) {
    res.status(500).send('db_error ' + error);
  }
});
//get route
// code from chat gpt to help with sorting
router.get('/', async (req, res) => {
  const { productName, quantity, minPrice, maxPrice, manufacturer, category, sortBy, sortOrder } = req.query;
  const filter = {};
  // Filter by product name
  if (productName) {
    let regex = new RegExp(productName, 'i'); // 'i' makes the regex case-insensitive
    filter.productName = { $regex: regex };;
  }
  if (category) {
    filter.category = category;
  }
  if (manufacturer) {
    let regex = new RegExp(manufacturer, 'i');
    filter.manufacturer = { $regex: regex };
  }
  // Filter by minimum and maximum price
  if (minPrice !== undefined && !isNaN(parseInt(minPrice))) {
    filter.price = { $gte: parseInt(minPrice) }; // $gte is MongoDB's operator for greater than or equal to
  }
  if (maxPrice !== undefined && !isNaN(parseInt(maxPrice))) {
    // ...filter.price is the spread operator. It copies the existing filter.price object and adds the new property
    filter.price = { ...filter.price, $lte: parseInt(maxPrice) }; // $lte is MongoDB's operator for less than or equal to
  }
  let quantityInStock = parseInt(quantity);
  if (!isNaN(quantityInStock)) {
    filter.quantityInStock = { $gte: quantityInStock }; // Using $lte for less than or equal comparison
  }

  try {
    let query = Product.find(filter).collation({ locale: 'en', strength: 2 });//sorts by case insensitive

    // Sorting logic
    if (sortBy == "price") {
      const sortOrderValue = sortOrder === 'desc' ? -1 : 1; // Default is ascending order
      query = query.sort({ price: sortOrderValue });
    } else if (sortBy == "productName") {
      const sortOrderValue = sortOrder === 'desc' ? -1 : 1; // Default is ascending order
      query = query.sort({ productName: sortOrderValue });
    } else {
      // Default sorting (if no sortBy parameter is provided)
      query = query.sort({ createdAt: 1 }); // Default sorting by price
    }

    const products = await query.exec();
    res.json(products);
  } catch (error) {
    res.status(500).json('db error ' + error);
  }
});
//get route by id
router.get('/:id', async (req, res) => {
  let id = req.params.id;

  try {
    const product = await Product.findById(id);

    if (product) { //if product is found give information about the product
      res.json(product);
    }
    else { //else give back error
      res.status(404).json('not found')
    }
  }
  catch (error) {
    res.status(404).json('id is incorrect : ' + error)
  }
})
//update route
router.put('/:id', validateAuth0AccessToken, async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  // Check if the ID is valid and update the product
  let product = await Product.findByIdAndUpdate(id, { $set: body });
  try {


    // Validate the request data
    const result = await ValidateProduct(req.body);

    // If validation fails, send an error
    if (result) {
      return res.status(400).send(result);
    }
    // Else update the product
    else {
      res.location(`${product._id}`)
        .status(200)
        .json(product);
    }
  } catch (error) {
    return res.status(500).send('ID not found or database error: ' + error);
  }


});
//delete route
router.delete('/:id', validateAuth0AccessToken, async (req, res) => {
  let id = req.params.id;

  try {
    let result = await ValidateDeleteProduct(id);
    if (result != null) {
      return res.status(400).json(result);
    }
    let product = await Product.findByIdAndDelete(id);
    if (product) {
      res.json('Deleted : ' + id)
    }
    else {
      res.status(404).json('id is not found');
    }
  }
  catch (error) {
    res.status(404).json('id is incorrect' + error)
  }
})
module.exports = router;