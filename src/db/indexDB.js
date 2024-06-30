import mongoose from "mongoose";
// import { DB_NAME } from "../constrants.js";
import {DB_NAME} from "../constrants.js"

const connectDB = async () => {
try{
const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME }`)
console.log(`\n MongoDb connected !! DB HOST:${connectioninstance.connection.host} :: `);
}
catch(error){
console.log("MONGODB connection Failed", error);
process.exit(1)

}

}
export default connectDB