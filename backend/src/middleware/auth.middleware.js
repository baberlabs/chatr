import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

import User from "../models/user.model.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorised - No Token" });
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorised - Expired Token" });
      }
      return res.status(401).json({ message: "Unauthorised - Invalid Token" });
    }

    const user = await User.findById(decodedToken.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorised - User Not Found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(`User authentication error: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
