import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video:{
            type:Schema.Types.ObjectId,
            ref:"video"
        },
        comment:{
            type:Schema.Types.ObjectId,
            ref:"comment"
        },
        tweet:{
            type:Schema.Types.ObjectId,
            ref:"tweet"
        },
        likeBy:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },{
        timestamps:true
    }
)

export const Like = mongoose.model("Like",likeSchema)