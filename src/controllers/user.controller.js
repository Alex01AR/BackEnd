import { asyncHandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js "
import { ApiResponse } from "../utils/ApiResponse.js";
import  Jwt  from "jsonwebtoken";


const generateAccessAndRefreshToken = async(userId) => {
    try{
      const user = await User.findById(userId)
    const accessToken  =   user.generateAccessToken()
   const refreshToken=    user.generateRefreshToken()
      
   user.refreshToken =refreshToken
   await user.save({validateBeforeSave:false})

   return { accessToken,refreshToken}
    }
    catch(error){
throw new ApiError(500,"sssomething went wrong while generating access and refresh token")
    }
}






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

     const {fullName , email, username , password }= req.body
    //  console.log("email", email);
    //  console.log("fullname", fullName);
    //  console.log("password", password);
    //  console.log("username", username);
     


// if(fullname === ""){
// throw new ApiError(400,"Fullnmae is required")
// }

if(
    [fullName,email,username , password].some(
        (fields) => fields?.trim() === "")){
            throw new ApiError(400,"Fullnmae is required")
        }

       const existedUser=await  User.findOne({
            $or : [{username},{email}]
        })
        if(existedUser){
            throw new ApiError(400,"user with username and email is already existed")
        }
        const avatarLocalPath  = req.files?.avatar[0]?.path;

        // const coverImageLocalPath  =req.files?.coverImage[0]?.path

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required ")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400,"Avatar file is required ")

        }
 const user =await User.create ({
    fullName,
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

const loginUser  = asyncHandler(async (req,res) => {
        // req.body => data
        //username or email to login 
        //find the user ? login => check password : not find 

        //access and refresh token
        // send cookie 

        const {email, username, password} = req.body
        console.log(email);

        // if( !username || !email){
            if( !username && !email){
            throw new ApiError(400, "username or password is requuired ")
        }

       const user   = await  User.findOne({
            $or: [{username}, {email}]
        })

        if(!user){
            throw new ApiError(404 , " User does not exist")
        }

   const isPasswordValid =  await user.isPasswordCorrect(password)

   if(!isPasswordValid){
    throw new ApiError(401 , "invalid user credintial, password is incorrect ")
}

  const {accessToken,refreshToken} =await  generateAccessAndRefreshToken(user._id)

  const loggedinUser =await User.findById(user._id).select("-password -refreshToken")

const options= {
    httpOnly:true,
    secure:true
}
return res
.status(200)
.cookie("accessToken",accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
    new ApiResponse(
        200, 
        {
            user: loggedinUser, accessToken, refreshToken
        },
        "User logged In Successfully"
    )
)



})

const logoutUser = asyncHandler(async(req,res,) => {
await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        }

    },{
     new :true   
    }
)

const options={
    httpOnly:true,
    secure:true
}

return res
.status(200)
.cookie("accessToken", options)
.cookie("refreshToken",  options)
.json(
    new ApiResponse(
        200, 
        {
           
        },
        "User logged out Successfully"
    )
)

})

const refreshAccessToken =  asyncHandler(async(req,res) => {
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

if(!incomingRefreshToken){
    throw new ApiError(401," unauthrozied request ")
}

 try {
    const decodedToken =Jwt.verify()
   incomingRefreshToken,
   process.env.REFRESH_TOKEN_SECRET
   
   const user = await User.findById(decodedToken?._id)
   
   if(!user){
       throw new ApiError(401," invalid referesh token ")
   }
   if(incomingRefreshToken !== user?.refreshToken){
       throw new ApiError(401," Refresh token is expired or used ")
   }
   
   const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
   
   const options = {
       httpOnly:true,
       secure: true
   }
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken", newrefreshToken,options)
   .json(
       new ApiResponse(
           200,
           {accessToken,refreshToken:  newrefreshToken},
           "Accress token refresh"
       )
   )
   
 } catch (error) {
    throw new ApiError(401,error?.message  || "invalid refresh token")
 }


})

const changeCurrentUserPassword = asyncHandler(async(req,res) => {
    const {oldpassword, newpassword} = req.body

   const user = await User.findById(req?.user?._id )
   const ispasswordcorrect = await user.isPasswordCorrect(oldpassword)

   if(!ispasswordcorrect){
    throw new ApiError(400,"Invalid password")
   }
   user.password= newpassword
  await user.save({validateBeforeSave:false})

  return res.status(200,).json(new ApiResponse(200,{},"password changed Successfully"))

})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res.status(200)
    .json(200,req.user,"current user fetched successfully")
})
const updateAccountDetail = asyncHandler(async(req,res) => {
    const { fullName,email} = req.body

    if(!fullName,email){
        throw new ApiError(400,"All fiels are required")
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
$set:{
    fullName,
    email:email,
}
        },
        {new: true}
        
        ).select("-password ")

        res.status(200)
        .json(new ApiResponse(200,user, "Account Details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
const avatarlocalpath = req.files?.path

if(!avatarlocalpath){
    throw new ApiError(400,"Avatar file is missing ")
}
const avatar =  updateUserAvatar(avatarlocalpath)

if(!avatar.url){
    throw new ApiError(400,"Error while updating avatar  ")
}
const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
       $set:{
        avatar:avatar.url
       } 
    },
    {new:true}
).select("-password")
return res
.status(200)
.json(
    new ApiResponse(200,user,"Avatar image updated successfully ")
)
})


const updateUsercoverImage = asyncHandler(async(req,res) => {
    const coverimagelocalpath = req.files?.path
    
    if(!coverimagelocalpath){
        throw new ApiError(400,"coverimage file is missing ")
    }
    const coverimage =  updateUserAvatar(coverimagelocalpath)
    
    if(!avatar.url){
        throw new ApiError(400,"Error while updating coverimage  ")
    }
  const user=   await User.findByIdAndUpdate(
        req.user?._id,
        {
           $set:{
            coverImage:coverimage.url
           } 
        },
        {new:true}
    ).select("-password")
    
    return res
.status(200)
.json(
    new ApiResponse(200,user,"coverimage image updated successfully ")
)
    })

export {
    registerUser,
loginUser,
logoutUser,
refreshAccessToken,
getCurrentUser,
changeCurrentUserPassword,
updateAccountDetail,
updateUserAvatar,
updateUsercoverImage
}