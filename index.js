const express = require('express')
const cors = require('cors');
require('dotenv').config();
const database = require('./database.js')
const {Product} = require('./models/products.js')
const products = require('./routes/products.js')
const categories = require('./routes/categories.js')
const orders = require('./routes/orders.js')
const {Category} = require('./models/categories.js')
const {Order} = require('./models/orders.js')
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
const app = express()
// note this required a .env file which is not in github
const port = process.env.PORT || 3001
app.use(express.json())
app.use(cors(corsOptions));
app.use('/api/v1/products', products);
app.use('/api/v1/categories', categories);
app.use('/api/v1/orders', orders);
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

