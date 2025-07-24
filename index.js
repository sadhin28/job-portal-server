const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()
//middlewire
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
    res.send('Job Portal Is Running')
})
app.get('/ping',(req,res)=>{
    res.send('Pong')
})

//connect with mongodb

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.sutdyn1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    //create database
    const JobPostsCollection=client.db('Job-Posted-Data').collection('PostedJobs')
    const JobApplicationCollection=client.db('Job-Application-Data').collection('Job-Application')
    const initialdatacollection=client.db('jobportal').collection('jobs')
    
    //get initial data
    app.get('/jobs',async(req,res)=>{
        const cursor = initialdatacollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })
    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`job-portal-server is running:${port}`)
})