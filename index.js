const express = require('express')
const app = express()
const cors = require("cors")
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.STRIPE_SECRET) 

app.use(express.json())
app.use(cors())



const verifyJwt = async (req , res , next) =>{
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).send({message: "unauthorized access"})
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN , (err , decoded)=>{
            if(err){
             return res.status(403).send({message: 'forbidden access'})   
            }
            req.decoded = decoded
            next()
        })
    } catch (error) {
        console.log(error.message);
    }
}





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x7kxg5y.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const usersCollection = client.db('UsedProductDatabase').collection('users')
const productsCollection = client.db('UsedProductDatabase').collection('products')
const categoriesCollection = client.db('UsedProductDatabase').collection('categories')
const ordersCollection = client.db('UsedProductDatabase').collection('orders')
const paymentCollection = client.db('UsedProductDatabase').collection('payments')
const advertiseCollection = client.db('UsedProductDatabase').collection('advertisements')
const reportItemCollection = client.db('UsedProductDatabase').collection('items')

const dbConnect = async ()=>{
    try {
         await client.connect()
         console.log('db-connect');
    } catch (error) {
        console.log(error.message);
    }
}


const verifyAdmin = async(req , res , next)=>{
    
    const decodedEmail = req.decoded.email
    const query = {email: decodedEmail}
    const user = await usersCollection.findOne(query)
    if(user?.role !== 'admin'){
        return res.status(403).send({message: 'forbidden access'})
    }
    next()
    

}
app.get('/jwt' , async(req , res)=>{
    try {
        const email = req.query.email
        const query = {email: email}
        const user = await usersCollection.findOne(query)
        // console.log(data);
        if(user){
            const token = jwt.sign(user , process.env.ACCESS_TOKEN , {expiresIn: '1d'})
           return  res.send({accessToken: token})
        } 
        res.status(401).send({accessToken: ""})
        
        // res.send({accessToken: "token"})
    } catch (error) {
        console.log(error.message);
    }
})




app.put('/users' , async(req , res)=>{
     try {
        const user = req.body
    const result = await usersCollection.insertOne(user)
    res.send(result)
   
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


app.post('/products', verifyJwt,async(req , res)=>{
try {
    const product = req.body;
    const adededProduct = await productsCollection.insertOne(product)
    res.send(adededProduct)
} catch (error) {
     console.log(error.message);
}
})




// app.get('/users/allSellers' , async(req , res)=>{
//    try {
//     const query = {}
//     const users = await usersCollection.find(query).toArray()
//     const allSellers =  users.filter(user => user.role === "Seller Accout")
    
//     res.send(allSellers)
//    } catch (error) {
//     console.log(error.message);
//    }
    
// })

//  verify a seller
app.put('/users/allsellers/verified/:id' , async(req , res)=>{
    try {
        const id = req.params.id
    const filter = {_id: ObjectId(id)}
    const options = {upsert: true}
    const updatedDoc = {
        $set: {
            status: "verified"
        }

    }
    const result = await usersCollection.updateOne(filter , updatedDoc , options)
     
    res.send(result)
    } catch (error) {
        console.log(error.message);
    }
})

////////////////////

// search particular seller for verified or not
app.get('/sellers' , async(req , res)=>{
    const sellers = await usersCollection.findOne({email: req.query.email})
    res.send(sellers)
})
// //////


//  //////////////
//     ADMIN API   ////////////////////////////////

app.get('/users/allBuyrs' ,verifyJwt ,verifyAdmin ,async(req , res)=>{
   try {
    const query = {}
    const users = await usersCollection.find(query).toArray()
    const allBuyrs = users.filter(user => user.role === "User")
   
    // console.log(allSellers);
    res.send(allBuyrs)
   } catch (error) {
    console.log(error.message);
   }
    
})


app.get('/users/allSellers',  verifyJwt, verifyAdmin,async(req , res)=>{
    try {
     const query = {}
     const users = await usersCollection.find(query).toArray()
     const allSellers =  users.filter(user => user.role === "Seller Accout")
     
     res.send(allSellers)
    } catch (error) {
     console.log(error.message);
    }
     
 })

// admin api end



// sellers products 

app.get('/sellers/products' , async(req , res)=>{
    try {
        const email = req.query.email;
    const query = {sellerEmail:email}
    const sellerSpecificProducts = await productsCollection.find(query).toArray()
   
    res.send(sellerSpecificProducts)
    } catch (error) {
        console.log(error.message);
    }
})

app.delete('/users/allSellers/:id' , async(req , res)=>{
    try {
    const  id = req.params.id
    const query = {_id: ObjectId(id)}
    const deletedSeller = await usersCollection.deleteOne(query)
    res.send(deletedSeller)
    } catch (error) {
         console.log(error.message);
    }
})


app.delete('/users/allBuyrs/:id' , async(req , res)=>{
    try {
    const  id = req.params.id
    const query = {_id: ObjectId(id)}
    const deletedSeller = await usersCollection.deleteOne(query)
    res.send(deletedSeller)
    } catch (error) {
         console.log(error.message);
    }
})


// app.put('/sellers/products/update/:id' , async(req , res)=>{
//    try {
//     const id = req.params.id
//     const filter = {_id: ObjectId(id)}
//     const options = {upsert: true}
//     const updatedDoc ={
//         $set:{
//             status: "sold"
//         }
//     }

//     const result = await productsCollection.updateOne(filter , updatedDoc , options)
//     res.send(result)
//    } catch (error) {
//     console.log(error.message);
//    }
// })


app.delete('/sellers/product/delete/:id' , async(req , res)=>{
    try {
    const  id = req.params.id
    const query = {_id: ObjectId(id)}
    const restProducts = await productsCollection.deleteOne(query)
    const advertiseFilter = {
        productId : id
        }
    const deleteFromAdvertiseCollection = await advertiseCollection.deleteOne(advertiseFilter)    
    res.send(restProducts)
    } catch (error) {
         console.log(error.message);
    }
})


app.get('/users/orders' , verifyJwt,async(req , res)=>{
   
  try {
    const decodedEmail = req.decoded.email;
    const email = req.query.email;
    if(decodedEmail !== email){
      return   res.status(401).send({message: "unauthorized access"})
    }
    const userSpecificOrders = await ordersCollection.find({buyrEmail: req.query.email}).toArray()

    res.send(userSpecificOrders)
  } catch (error) {
    console.log(error.message);
  }
})


app.get('/orderProducts/payment/:id' , async(req , res)=>{
    const id = req.params.id;
    const query ={_id: ObjectId(id)}
    const  orderedProduct = await ordersCollection.findOne(query)
    res.send(orderedProduct)
})



/////////stripe implement

app.post('/create-payment-intent' , async(req , res)=>{
    try {
        const booking = req.body;
    const price = booking.priceIntoNumber;
    const amount = price * 100;
    
    const paymentIntent = await stripe.paymentIntents.create({
        currency: 'inr',
        amount: amount,
        "payment_method_types": [
            "card"
        ]
    })
    res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
        console.log(error.message);
    }
} )

app.post('/payments' , async(req , res)=>{
    const payment = req.body;
    const result = await paymentCollection.insertOne(payment)
    const id = payment.bookingId;
    const UpdateProductsCollectionfilter = {_id:ObjectId(id)}
    const ordersCollectionUpdateFilter = { productId: id }
    console.log(id);
    const advertiseCollectionUpdateFilter = {productId : id}
    const updatedDoc = {
        $set:{
            paid:true,
            trnsactionId: payment.transactionId
        }
    }
    const updatedResult = await ordersCollection.updateOne(ordersCollectionUpdateFilter , updatedDoc)
    const updatedProductsCollection = await productsCollection.updateOne(UpdateProductsCollectionfilter,updatedDoc)
    // const deleteProductFromproductsCollection = await productsCollection.deleteOne(UpdateProductsCollectionfilter)
    const advertiseCollectionUpdate = await advertiseCollection.updateOne(advertiseCollectionUpdateFilter , updatedDoc)
    const advertiseCollectionDeletetheProduct = await advertiseCollection.deleteOne(advertiseCollectionUpdateFilter)
    res.send(result)
})




///////// stripe end




app.delete('/sellerProducts/delete' , async(req , res)=>{
    try {
        const email = req.query.email
        const query = {sellerEmail: email}
        const sellerProducts = await productsCollection.deleteMany(query)
        res.send(sellerProducts)
    } catch (error) {
        console.log(error.message);
    }
})








// /////payments related routes

app.get('/orderdProduct/:id' , async(req , res)=>{
    try {
        const id = req.params.id
        const query = {_id: ObjectId(id)}
        const singleOrderdProduct = await ordersCollection.findOne(query)
        res.send(singleOrderdProduct)
    } catch (error) {
        
    }
})




// //// advertisement

app.post('/advertise' , async(req , res )=>{
    try {
        const advertise = req.body;
        const insertAadvertise = await advertiseCollection.insertOne(advertise)
        res.send(insertAadvertise)
    } catch (error) {
        console.log(error.messsage);
    }
})


app.get('/advertiseProducts' , async(req , res)=>{
    const products = await advertiseCollection.find({}).toArray()
    res.send(products)
})


// ////// report api

app.put('/reportItem' , async(req , res)=>{
    try {
        const product = req.body;
        const  reportedProduct = await reportItemCollection.insertOne(product)
        res.send(reportedProduct)
    } catch (error) {
        console.log(error.message);
    }
})


app.get('/reported-item-admin' , async(req , res)=>{
    try {
        const query = {}
        const reportedProducts = await reportItemCollection.find(query).toArray()
        res.send(reportedProducts)
    } catch (error) {
        console.log(error.message);
    }
})

app.delete('/reportProduct-delete/:id' , async(req , res)=>{
   try {
    const id = req.params.id;
    const reportCollectionquery = {productId: id}
    const updatedDoc = {
        $set:{
            deleted: true
        }
    }
    const productCollectionQuery = {_id: ObjectId(id)}
    const deleteProduct = await productsCollection.deleteOne(productCollectionQuery)
    const deleteFromReportCollection = await reportItemCollection.updateOne(reportCollectionquery , updatedDoc)
    res.send(deleteProduct)
   } catch (error) {
    console.log(error.message);
   }
    })



app.get('/' , (req , res)=>{
    res.send('server running')
})


dbConnect()


app.listen(port, ()=>{
    console.log("server is running on port: " , port);
})