const express = require('express');
const { Order, ValidateOrder } = require("../models/orders");
const router = express.Router();
const { validateAuth0AccessToken} = require('../middleware/auth0.middleware.js');
router.post('/', async (req, res) => {
  let result = await ValidateOrder(req.body);

  if (result) {
      return res.status(400).json(result);
  }
  let order = new Order(req.body);
  try {
      order = await order.save();
      res
          .location(`${order._id}`)
          .status(201)
          .json(order);
  } catch (error) {
      res.status(500).send('db_error ' + error);
  }
});
router.get('/', async (req, res) => {

    try {
      const orders = await Order.find()
      res.json(orders);
    }
    catch (error) {
      res.status(500).json('db error ' + error)
    }
});
router.get('/:id', async (req, res) => {
let id = req.params.id;
try {
  const order = await Order.findById(id);
  if(order) { //if order is found give information about the order
    res.json(order);
  }
  else { //else give back error
    res.status(404).json('id not found')
  }
}
catch (error){
  res.status(404).json('id is incorrect :' + error)
}
})

//update route
router.put('/:id', validateAuth0AccessToken, async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  // Check if the ID is valid and update the product
  
  // Validate the request data
  let result = await ValidateOrder(req.body);

  if (result) {
      return res.status(400).json(result);
  }
  else{
    try {
      let order = await Order.findByIdAndUpdate(id, { $set: body });
      if(!order){
        return res.status(404).json('order not found')
      }
      order = await order.save();
      res
          .location(`${order._id}`)
          .status(201)
          .json(order);
  } catch (error) {
      res.status(500).send('db_error ' + error);
  }
  }
  
});
//delete route
router.delete('/:id', validateAuth0AccessToken, async (req, res) =>{
let id = req.params.id;

try{
  let order = await Order.findByIdAndDelete(id);
  if(order){
    res.json('Deleted : ' + id)
  }
  else{
    res.status(404).json('not found')
  }
}
catch(error){
  res.status(404).json('id is incorrect : ' + error)
}
})
module.exports = router;