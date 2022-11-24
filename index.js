const express = require('express')
require('dotenv').config()
const app = express()
const cors = require("cors")
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())


// wP5x0JnhX5NWNig7
// useProductResale


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x7kxg5y.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const usersCollection = client.db('UsedProductDatabase').collection('users')
const productsCollection = client.db('UsedProductDatabase').collection('products')
const categoriesCollection = client.db('UsedProductDatabase').collection('categories')
const ordersCollection = client.db('UsedProductDatabase').collection('orders')
const dbConnect = async ()=>{
    try {
         await client.connect()
         console.log('db-connect');
    } catch (error) {
        console.log(error.message);
    }
}


app.put('/users' , async(req , res)=>{
     try {
        const user = req.body
    const result = await usersCollection.insertOne(user)
    res.send(result)
    console.log(result);
     } catch (error) {
        console.log(error.message);
     }
})

app.get('/users/role/:email' , async(req , res)=>{
    try {
        const email = req.params.email
        const query = {email: email}
        const user = await usersCollection.findOne(query)
        res.send(user)
    } catch (error) {
        
    }
})


app.get('/products/:categoryName' , async(req , res)=>{
    try {
        const categoryName = (req.params.categoryName.toLowerCase());
    const query = {categoryName: categoryName}
    const products = await productsCollection.find(query).toArray()
    console.log(products);
    res.send(products)
    } catch (error) {
        console.log(error.message);
    }
})


app.get('/categories' , async(req , res)=>{
   try {
    const query = {}
    const categories = await categoriesCollection.find(query).toArray()
    res.send(categories)
   } catch (error) {
    console.log(error.message);
   }
})


app.post('/orders' , async(req , res)=>{
  try {
    const product = req.body;
    const adededOrder = await ordersCollection.insertOne(product)
    res.send(adededOrder)
  } catch (error) {
    console.log(error.message);
  }
})


app.post('/products' , async(req , res)=>{
try {
    const product = req.body
    const adededProduct = await productsCollection.insertOne(product)
    res.send(adededProduct)
} catch (error) {
     console.log(error.message);
}
})




dbConnect()











app.get('/' , (req , res)=>{
    res.send('server running')
})




app.listen(port, ()=>{
    console.log("server is running on port: " , port);
})