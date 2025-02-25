const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { UnauthorizedError } = require("./errorMiddleware");

//Protect routes
const protect = asyncHandler(async (req, res, next) => {
   let token;

   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
   ) {
      try {
         // Get token from header
         token = req.headers.authorization.split(" ")[1];

         // Verify token
         const decoded = jwt.verify(token, process.env.JWT_SECRET);

         // Get user from the token
         req.user = await User.findById(decoded.id).select("-password");
         next();
      } catch (error) {
         //console.log(error)
         throw new UnauthorizedError("Not authorized.");
      }
   }
   if (!token) {
      throw new UnauthorizedError("Not authorized, no token");
   }
});

const authorizeRoles = (roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         throw new UnauthorizedError(
            `User role ${req.user.role} is not authorized to access this route.`
         );
      }
      next();
   };
};

module.exports = { protect, authorizeRoles };
