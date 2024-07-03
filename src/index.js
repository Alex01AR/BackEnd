// require('dotenv').config({path: './env'});
import dotenv from 'dotenv';
import connectDB from "./db/indexDB.js";

dotenv.config({
    path:'./env'
})


connectDB()
.then(
    app.listen(process.env.PORT || 8000,() => {
        console.log(`SERVER is RUNNING at PORT : ${process.env.PORT}`)
        app.on("error", (error ) => {
            console.log("ERROR AT STARTING SERVER ",error);
        })
    }
))
.catch((err) => {
    console.log("MONGODB Connection Failed !!! ",err)
})

