const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()
//middlewire
app.use(cors({
    origin:['https://job-portal-72009.web.app'],
    credentials:true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));

const accessTokenkey=process.env.ACCESS_TOKEN_SECRET



app.get('/', (req, res) => {
    res.send('Job Portal Is Running')
})
app.get('/ping', (req, res) => {
    res.send('Pong')
})

 const verifyToken = (req,res,next)=>{
 const tokens=req?.cookies?.token

    if(!tokens){
         return res.status(401).send({message:'Unauthorized Access'})
    }
    jwt.verify(tokens,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
             return res.status(401).send({message:'Unauthorized Access'})
        }

     next()
        
    })
   
  
   }

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

        //auth related APIs
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, 'secret', { expiresIn: '1h' })
           
           res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,

                })
           .send({ success: true })
        })

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
        app.post('/jobs', async (req, res) => {
            const newJobPost = req.body;
            res.send(newJobPost);
            const result = await initialdatacollection.insertOne(newJobPost)
            res.send(result);
        })
        //delete posted job
        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await initialdatacollection.deleteOne(query)
            res.send(result)
        })
        //update job
        app.put("/jobs/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { Upsert: true };
            const updateJobs = req.body;

            let newUpdateJobs = {
                $set: {
                    title: updateJobs.title,
                    location: updateJobs.location,
                    jobType: updateJobs.jobType,
                    category: updateJobs.category,
                    applicationDeadline: updateJobs.applicationDeadline,
                    salaryRange: updateJobs.salaryRange,
                    description: updateJobs.description,
                    company: updateJobs.company,
                    requirements: updateJobs.requirements,
                    responsibilities: updateJobs.responsibilities,
                    status: updateJobs.status,
                    hr_email: updateJobs.hr_email,
                    hr_name: updateJobs.hr_name,
                    company_logo: updateJobs.company_logo,
                }
            }
            const result = await initialdatacollection.updateOne(filter, newUpdateJobs, options)
            res.send(result)
            console.log(updateJobs)
        })

        //get some data by email using query
        app.get('/my-jobposts', async (req, res) => {
            const email = req.query.email;
            const query = { hr_email: email }
            const result = await initialdatacollection.find(query).toArray();
            res.send(result)

        })
        //
        //Post application
        app.post('/apply', async (req, res) => {
            const newApply = req.body;
            res.send(newApply);
            const result = await JobApplicationCollection.insertOne(newApply);

            const id = newApply.job_id;
            const query = { _id: new ObjectId(id) }
            const job = await initialdatacollection.findOne(query);
            let newcount = 0
            if (job.applicationCount) {
                newcount = job.applicationCount + 1;
            } else {
                newcount = 1;
            }
            //Now update newcount
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    applicationCount: newcount
                }
            }
            const updateResult = await initialdatacollection.updateOne(filter, updatedDoc)
            res.send(result)
        })
        //patch status
        app.patch('/apply/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: data.status
                }
            }
            const result = await JobApplicationCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })
        //get all application data
        app.get('/apply', async (req, res) => {
            const cursor = JobApplicationCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        //get application by job_id
        app.get('/job-application/:job_id', async (req, res) => {
            const Jobid = req.params.job_id;
            const query = { job_id: Jobid }
            const result = await JobApplicationCollection.find(query).toArray()
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
        app.delete('/apply/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await JobApplicationCollection.deleteOne(query)
            res.send(result)
        })
        //get some data by email
        app.get('/job-application',verifyToken,async (req, res) => {
            const email = req.query.email;
            const query = { applicant_email: email }
            console.log(req.cookies)
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