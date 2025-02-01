const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.POST || 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors({
  origin: 'http://localhost:5173'
}))
app.use(express.json())



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.gphdl2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    app.get('/ping', (req, res) => {
      res.send({ message: `Your Server Is Running Port On: ${port}`, "version:": "v1" });
    })


    const userCollection = client.db('eduBook').collection('users');


    // user data save 
    app.post('/user-register', async (req, res) => {
      const userInfo = req.body;
      try {
        const isExists = await userCollection.findOne({ email: userInfo?.email });
        if (isExists) {
          return res.send({ message: 'Account is exists', data: isExists })
        }
        const result = await userCollection.insertOne(userInfo);
        res.send({ message: "Account created! 🚀", data: result })
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error.message });
      }
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send(`Hey, EduBook Server Is Running: ${port}`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})