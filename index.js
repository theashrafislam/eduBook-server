const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.POST || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    const collegeCollection = client.db('eduBook').collection('collage');
    const admissionCollection = client.db('eduBook').collection('admissionBook');


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

    // get sigle user data
    app.get(`/profile/:email`, async (req, res) => {
      const email = req.params.email;
      try {
        const user = await userCollection.findOne({ email });
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }
        res.send(user)
      } catch (error) {
        res.status(500).send({ message: "Internal server error" });
      }
    });

    //update user information
    app.patch(`/profile-update/:email`, async (req, res) => {
      const email = req.params.email;
      const updatedData = req.body;
      try {
        const isExists = await userCollection.findOne({ email });
        if (isExists) {
          const result = await userCollection.updateOne(
            { email },
            { $set: updatedData }
          );
          res.send({ message: 'Update Successfully', data: result });
        }
      } catch (error) {
        res.status(500).send({ message: "Internal server error" });
      }
    })

    //get collage all data form database
    app.get('/college-collection', async (req, res) => {
      const searchQuery = req.query.search || '';
      try {
        const result = await collegeCollection.find({
          name: { $regex: searchQuery, $options: 'i' }
        }).toArray();
        res.send({ message: 'College collection data retrieved successfully', data: result });
      } catch (error) {
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    //get college sigle data useing id form database
    app.get(`/college-collection/:id`, async (req, res) => {
      const id = req.params.id;
      try {
        const result = await collegeCollection.findOne({ _id: new ObjectId(id) });
        res.send({ message: 'Single Data Get Successfully.', data: result })
      } catch (error) {
        res.status(500).send({ message: "Internal server error" });
      }
    })

    //post admission book data
    app.post(`/admission-book`, async (req, res) => {
      const updateData = req.body;
      try {
        const result = await admissionCollection.insertOne(updateData);
        res.send({ message: 'admission data saved done', data: result })
      } catch (error) {
        res.status(500).send({ message: "Internal server error" });
      }
    })

    //get admission data useing email form database
    app.get('/admission-book/:email', async (req, res) => {
      const email = req.params.email;
      try {
        const cursor = admissionCollection.find(
          { userEmail: email },
          { projection: { collageId: 1, _id: 0 } }
        );
        const results = await cursor.toArray();
        const collageIds = results.map(doc => doc.collageId);
        res.send(collageIds);
      } catch (error) {
        res.status(500).send({ message: "Internal server error" });
      }
    });

    //get collage data useing array form database
    // app.get('/collage-collection-array', async (req, res) => {
    //   const collageIds = [].concat(req.query.collageId || []);
    //   console.log(collageIds);
    //   const objectIds = collageIds.map(id => new ObjectId(id));
    //   try {
    //     const result = await collegeCollection.find({ _id: { $in: objectIds } }).toArray();
    //     res.send({ message: 'collage data get', data: result });
    //   } catch (error) {
    //     res.status(500).send({ message: "Internal server error" });
    //   }
    // })


    //patch rating update api
    



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