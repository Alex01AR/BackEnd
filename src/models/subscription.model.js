import mongoose ,{Schema} from "mongoose";
 
const subscriptionSchema = new Schema({
subscriber:{
    type: Schema.Type.ObjectId,//who subscribe
    ref: "User",
},
channel:{
    type: Schema.Type.ObjectId,//subscriber is subscribing
    ref: "User",
}
})



export const Subscription = mongoose.model("Subscription",subscriptionSchema)