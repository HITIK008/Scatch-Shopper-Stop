const express = require('express');
const app = express();
const db = require('./config/mongoose-connection');
const User = require('./models/user-model');
const Product = require('./models/product-model');
const Owner = require('./models/owner-model');

const ownersRouter = require('./routes/ownersRouter');
const usersRouter = require('./routes/usersRouter');
const productsRouter = require('./routes/productsRouter');






const cookieParser= require("cookie-parser");
app.use(cookieParser());

const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")));
app.set('view engine', 'ejs');


app.use("/owners",ownersRouter);
app.use("/users",usersRouter);
app.use("/products", productsRouter);

app.get('/', (req, res) => {
    res.send('Welcome');
})

app.listen(3003, () => {
    console.log('Server is running on http://localhost:3002');
});