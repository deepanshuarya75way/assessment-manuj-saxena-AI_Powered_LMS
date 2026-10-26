import jwt from "jsonwebtoken";

export const genToken = async (userId, sessionId) => {
    try {
        return jwt.sign(
          { userId, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
            );
        } catch (error) {
            console.log("token error", error);
            throw error;
        }
    };

            