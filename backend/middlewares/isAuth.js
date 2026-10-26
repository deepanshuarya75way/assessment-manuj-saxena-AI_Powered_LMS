
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const isAuth = async (req, res, next) => {
    try {
          const { token } = req.cookies || {};
          if (!token) {
                  return res.status(401).json({ message: "User does not have token" });
          }

              const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
                  const user = await User.findById(verifyToken.userId);

                      if (!user) {
                              return res.status(401).json({ message: "User not found" });
                      }

                          if (!verifyToken.sessionId ||  user.activeSessionId !== verifyToken.sessionId) {
                                  return res.status(401).json({
                                            message: "Session expired or logged in on another device"
                                  });
                                }

                                    req.userId = verifyToken.userId;
                                        next();
                              } catch (error) {
                                    console.log("isAuth error", error);
                                        return res.status(401).json({ message: "Invalid or expired session" });
                              }
                            };

                            export default isAuth;

                                  