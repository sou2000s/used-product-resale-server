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
const uri = "mongodb+srv://useProductResale:wP5x0JnhX5NWNig7@cluster0.x7kxg5y.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const usersCollection = client.db('UsedProductDatabase').collection('users')

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





dbConnect()











app.get('/' , (req , res)=>{
    res.send('server running')
})




app.listen(port, ()=>{
    console.log("server is running on port: " , port);
})