const express = require('express');
const { Category, ValidateCategory, ValidateDeleteCategory } = require("../models/categories");
const router = express.Router();
const { validateAuth0AccessToken} = require('../middleware/auth0.middleware.js');
router.post('/', validateAuth0AccessToken, async (req, res) => {
    //validate the category data
    let result = ValidateCategory(req.body);
    //send error if there is one
    if(result.error){
      return res.status(400).json(result.error)
    }
    else{
    //if no error create new category
    let category = new Category(req.body);
    try {
      category = await category.save();
      res
        .location(`${category._id}`)
        .status(201)
        .json(category)
    }
    catch (error) {
      res.status(500).send('db_error ' + error)
    }
  }
});
router.get('/', async (req, res) => {
    try {
      const categories = await Category.find()
      res.json(categories);
    }
    catch (error) {
      res.status(500).json('db error ' + error)
    }
});
router.get('/:id', async (req, res) => {
let id = req.params.id;

try {
  const category = await Category.findById(id);

  if(category) { //if category is found give information about the category
    res.json(category);
  }
  else { //else give back error
    res.status(404).json('not found')
  }
}
catch (error){
  res.status(404).json('id is incorrect' + error)
}
})

//update route
router.put('/:id', validateAuth0AccessToken, async (req, res) =>{
  const id = req.params.id;
  const body = req.body;
  // Check if the ID is valid and update the category
  let category = await Category.findByIdAndUpdate(id, { $set: body });
  try {
      // Validate the request data
      const result = await ValidateCategory(req.body);

      // If validation fails, send an error
      if (result.error) {
          return res.status(400).send(result.error);
      }
      // Else update the category
      else{
        res.location(`${category._id}`)
        .status(200)
        .json(category);
      }
  } catch (error) {
      return res.status(500).send('ID not found or database error: ' + error);
  }
  

})
//delete route
router.delete('/:id', validateAuth0AccessToken, async (req, res) =>{
let id = req.params.id;
try{
  let result = await ValidateDeleteCategory(id);
  if(result != null){
    return res.status(400).json(result);
  }
  let category = await Category.findByIdAndDelete(id);
  
  if(category){
    res.json('Deleted : ' + id)
  }
  else{
    res.status(404).json('id is incorrect')
  }
}
catch(error){
  console.log(error);
  res.status(500).json('database error: ' + error)
}

})
module.exports = router;