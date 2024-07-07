import { Router } from "express";
 import { registerUser } from "../controllers/user.controller.js";


const router = Router()

router.route("/register").post(registerUser);
// router.route("/login").post(login)


// http://localhost:8000/user/login

export default router