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
app.get('/ping', (req, res) => {
    res.send('Pong')
})

//connect with mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const addPostsCollection = client.db('Job-Posted-Data').collection('PostedJobs')
        const JobApplicationCollection = client.db('Job-Application-Data').collection('Job-Application')
        const initialdatacollection = client.db('jobportal').collection('jobs')
        

        //get initial data
        app.get('/jobs', async (req, res) => {
            const cursor = initialdatacollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        //get initial jobs data by id
        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await initialdatacollection.findOne(query)
            res.send(result)
        })
         //post a job
         app.post('/jobs',async(req,res)=>{
            const newJobPost = req.body;
            res.send(newJobPost);
            const result = await initialdatacollection.insertOne(newJobPost)
            res.send(result);
         })
         //delete posted job
         app.delete('/jobs/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:new ObjectId(id)}
            const result = await initialdatacollection.deleteOne(query)
            res.send(result)
         })

       //get some data by email using query
        app.get('/my-jobposts',async(req,res)=>{
         const email = req.query.email;
         const query = {hr_email : email}
         const result = await initialdatacollection.find(query).toArray();
         res.send(result)

       })
        //Post application
        app.post('/apply',async(req,res)=>{
            const newApply = req.body;
            res.send(newApply);
            const result = await JobApplicationCollection.insertOne(newApply);
            res.send(result)
        })

        //get all application data
        app.get('/apply',async(req,res)=>{
            const cursor = JobApplicationCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        //get one applicatin by id
          app.get('/apply/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await JobApplicationCollection.findOne(query)
            res.send(result)
        })
       

        //delete application
        app.delete('/apply/:id',async(req,res)=>{
            const id=req.params.id;
            const query = {_id:new ObjectId(id)};
            const result = await JobApplicationCollection.deleteOne(query)
            res.send(result)
        })
       //get some data by email
       app.get('/job-application',async(req,res)=>{
         const email = req.query.email;
         const query = {applicant_email : email}
         const result = await JobApplicationCollection.find(query).toArray();
         res.send(result)

       })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`job-portal-server is running:${port}`)
})