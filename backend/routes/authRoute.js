import express from "express"
import isAuth from "../middlewares/isAuth.js";
import { googleSignup, login, logOut, resetPassword, sendOtp, signUp, verifyOtp, takeoverSession } from "../controllers/authController.js";

const authRouter = express.Router()

authRouter.post("/signup",signUp)

authRouter.post("/login",login)
authRouter.get("/logout", isAuth, logOut)
authRouter.post("/googlesignup",googleSignup)
authRouter.post("/sendotp",sendOtp)
authRouter.post("/verifyotp",verifyOtp)
authRouter.post("/resetpassword",resetPassword)
authRouter.post("/takeover-session", takeoverSession);


export default authRouter