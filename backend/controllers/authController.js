import { genToken } from "../configs/token.js"
import validator from "validator"

import bcrypt from "bcryptjs"
import User from "../models/userModel.js"

import sendMail from "../configs/Mail.js"



export const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({ message: "email already exist" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter valid Email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Please enter a Strong Password" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role
    });

    const crypto = await import("node:crypto");
    const sessionId = crypto.randomUUID();
    const deviceName = req.headers["x-device-name"] || "Unknown Device";

    user.activeSessionId = sessionId;
    user.activeDeviceName = deviceName;
    await user.save();

    const token = await genToken(user._id.toString(), sessionId);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.log("signUp error", error);
    return res.status(500).json({ message: `signUp Error ${error}` });
  }
};




export const login = async (req, res) => {
      try {
        const { email, password } = req.body;
                const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "user does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
                            if (!isMatch) {
                                      return res.status(400).json({ message: "incorrect Password" });
                            }

                                const deviceName = req.headers["x-device-name"]|| "Unknown Device"; 
                                        if(user.activeSessionId) {
                                          return res.status(200).json({
                                                    takeoverRequired: true,
                                                            existingDeviceName: user.activeDeviceName || "Unknown Device",
                                                                    message: "Already logged in on another device"
                                          });
                                        }

                                            const crypto = await import("node:crypto");
                                                const sessionId = crypto.randomUUID();

                                                    user.activeSessionId = sessionId;
                                                        user.activeDeviceName = deviceName;
                                                            await user.save();

                                                                const token = await genToken(user._id.toString(), sessionId);

                                                                    res.cookie("token", token, {
                                                                              httpOnly: true,
                                                                                    secure: true,
                                                                                          sameSite: "none",
                                                                                                maxAge: 7 * 24 * 60 * 60 * 1000
                                                                    });

                                                                        return res.status(200).json(user);
                                                                } catch (error) {
                                                                        console.log("login error", error);
                                                                            return res.status(500).json({ message: `login Error ${error}` });
                                                                }
                                                            };



                                                            export const takeoverSession = async (req, res) => {
                                                                try {
                                                                    const { email, password } = req.body;
                                                                    const user = await User.findOne({ email });
                                                                    if (!user) return res.status(404).json({ message: "User not found" });

                                                                    const isMatch = await bcrypt.compare(password, user.password);
                                                                    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

                                                                        const crypto = await import("node:crypto");
                                                                        const sessionId = crypto.randomUUID();
                                                                        const deviceName = req.headers["x-device-name"] || "Unkown Device";
                                                                        user.activeSessionId = sessionId;
                                                                        user.activeDeviceName = deviceName;
                                                                        await user.save();

                                                                        const token = await genToken(user._id.toString(), sessionId);
                                                                        res.cookie("token", token, {
                                                                        httpOnly: true,
                                                                        secure: true,
                                                                        sameSite: "none",
                                                                        maxAge: 7 * 24 * 60 * 60 * 1000
                                                                    });

                                                                        return res.status(200).json({
                                                                        message: "Session taken over successfully",
                                                                        user: {
                                                                            _id: user._id,
                                                                            name: user.name,
                                                                            email: user.email,
                                                                            role: user.role
                                                                        }
                                                                    });
                                                                  }
                                                                  catch (error) {
                                                                        console.log("takeover error", error);
                                                                            return res.status(500).json({ message: "Session takeover failed" });
                                                                  }
                                                                }
                                                            
                                    
                                                            




 export const logOut = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user) {
            user.activeSessionId = null;
            user.activeDeviceName = null;
            await user.save();
        }
            res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
            return res.status(200).json({ message: "Logout Successfully" });
                } catch (error) {
            return res.status(500).json({ message: `Logout Error ${error}` });
                }
        };
                                                           

export const googleSignup = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ name, email, role });

    if (user.activeSessionId) {
      return res.status(200).json({
        takeoverRequired: true,
        existingDeviceName: user.activeDeviceName || "Unknown Device",
        message: "Already logged in on another device"
      });
    }

    const crypto = await import("node:crypto");
    const sessionId = crypto.randomUUID();
    const deviceName = req.headers["x-device-name"] || "Unknown Device";

    user.activeSessionId = sessionId;
    user.activeDeviceName = deviceName;
    await user.save();

    const token = await genToken(user._id.toString(), sessionId);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.log("googleSignup error", error);
    return res.status(500).json({ message: `googleSignup ${error}` });
  }
};

    

export const sendOtp = async (req,res) => {
    try {
        const {email} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        user.resetOtp=otp,
        user.otpExpires=Date.now() + 5*60*1000,
        user.isOtpVerifed= false 

        await user.save()
        await sendMail(email,otp)
        return res.status(200).json({message:"Email Successfully send"})
    } catch (error) {

        return res.status(500).json({message:`send otp error ${error}`})
        
    }
}

export const verifyOtp = async (req,res) => {
    try {
        const {email,otp} = req.body
        const user = await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now() ){
            return res.status(400).json({message:"Invalid OTP"})
        }
        user.isOtpVerifed=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()
        return res.status(200).json({message:"OTP varified "})


    } catch (error) {
         return res.status(500).json({message:`Varify otp error ${error}`})
    }
}

export const resetPassword = async (req,res) => {
    try {
        const {email ,password } =  req.body
         const user = await User.findOne({email})
        if(!user || !user.isOtpVerifed ){
            return res.status(404).json({message:"OTP verfication required"})
        }

        const hashPassword = await bcrypt.hash(password,10)
        user.password = hashPassword
        user.isOtpVerifed=false
        await user.save()
        return res.status(200).json({message:"Password Reset Successfully"})
    } catch (error) {
        return res.status(500).json({message:`Reset Password error ${error}`})
    }
}