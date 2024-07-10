import { asyncHandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js "
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res) => {
    // get user details from frontend 
    //validation to check empty or email format 
    //check if user already existed 
    //check avataar or images 
    //upload them to cloudnary ,avatar 
    // create user obj -cretae entry in db
    //remove passaward and refresh token from response feed
    //check  for user creation 
    //return res || error 

     const {fullname , email, username , password }= req.body
     console.log("email", email);

// if(fullname === ""){
// throw new ApiError(400,"Fullnmae is required")
// }

if(
    [fullname,email,username , password].some(
        (fields) => fields?.trim() === "")){
            throw new ApiError(400,"Fullnmae is required")
        }

        User.findOne({
            $or : [{username},{email}]
        })
        if(existedUser){
            throw new ApiError(400,"user with username and email is already existed")
        }
        const avatarLocalPath  =res.files?.avatar[0]?.path

        const coverImageLocalPath  =res.files?.coverImage[0]?.path

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required ")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400,"Avatar file is required ")

        }
 const user =await User.create ({
    fullname,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

})
const createduser = await User.findById(user.id).select(
    "-password -refreshToken "
)

if(!createduser){
    throw new ApiError(500,"something went worng while saving the user  ")
}

return res.status(201).json(
    new ApiResponse(200),createduser,"user registered successfully"
)


})

export {registerUser}