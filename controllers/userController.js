const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv").config();
//mail transporter
const transporter = require("../config/email");
const { promises: fsPromises } = require("fs");
const path = require("path");

//middleware
const {
   BadRequestError,
   UnauthorizedError,
} = require("../middleware/errorMiddleware");

//model
const User = require("../models/userModel");

// @desc Register new user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
   const { name, email, password } = req.body;

   if (!name || !email || !password) {
      throw new BadRequestError("Please fill in all fields");
   }

   // Check if user already exist
   const userExist = await User.findOne({ email });

   if (userExist) {
      throw new BadRequestError("Email already has been user");
   }

   // Email validation
   const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
   if (!email.match(emailRegex)) {
      throw new BadRequestError("Invalid Email");
   }

   // Password validation
   const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
   if (!password.match(passwordRegex)) {
      throw new BadRequestError(
         "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, and be at least 8 characters longs"
      );
   }

   // Hash password
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);

   // Create user
   const user = await User.create({
      name,
      email,
      password: hashedPassword,
   });

   if (user) {
      res.status(201).json({
         _id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         token: generateToken(user._id),
      });
   } else {
      throw new BadRequestError("Invalid user data");
   }
});

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      throw new BadRequestError("Please fill in all fields");
   }

   // Check if user exist
   const user = await User.findOne({ email });

   // compare
   if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
         _id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         token: generateToken(user._id),
      });
   } else {
      throw new UnauthorizedError("Invalid email or password");
   }
});

// Generate jwt token
const generateToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
   });
};

// email template
const modifiedMessage = async function (email, link) {
   const contents = await fsPromises.readFile(
      path.resolve(__dirname, "../mail_templates/resetPassword.html"),
      "utf-8"
   );
   let modifiedHtml = contents.replace("{{email}}", email);
   modifiedHtml = modifiedHtml.replace("{{link}}", link);

   return modifiedHtml;
};

// @desc Send reset password email
// @route POST /api/users/reset-password
// @access Private
const sendResetPassword = asyncHandler(async (req, res) => {
   const { email } = req.body;

   if (!email) {
      throw new BadRequestError("Please fill in all fields");
   }

   // Check if user exist
   const user = await User.findOne({ email });

   if (!user) {
      throw new BadRequestError("User not found");
   }

   // Create a one time link valid for 15 minutes
   const secret = process.env.JWT_SECRET + user.password;
   const payload = {
      email: user.email,
      id: user.id,
   };

   const token = jwt.sign(payload, secret, { expiresIn: "1d" });
   const link = `${process.env.CLIENT_URL}/auth/reset-password/${user.id}/${token}`;

   // Custom send email
   const html = await modifiedMessage(user.email, link);

   const emailTransporter = transporter();

   const mailOptions = {
      from: "Test email",
      to: user.email,
      subject: "Reset password",
      text: "There was a request to change your password",
      html,
   };

   // Send
   emailTransporter.sendMail(mailOptions);

   res.status(200).json({
      message: "Password reset link has been sent to your email",
   });
});

// @desc Reset password
// @route POST /api/users/reset-password/:id/:token
// @access Private
const resetPassword = asyncHandler(async (req, res) => {
   const { id, token } = req.params;
   const { password } = req.body;

   if (!password) {
      throw new BadRequestError("Please fill in all fields");
   }

   // Check if user exist
   const user = await User.findOne({ _id: id });

   if (!user) {
      throw new BadRequestError("User not found");
   }

   const secret = process.env.JWT_SECRET + user.password;
   const payload = jwt.verify(token, secret);

   // Password validation
   const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
   if (!password.match(passwordRegex)) {
      throw new BadRequestError(
         "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, and be at least 8 characters longs"
      );
   }

   // Hash password
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);

   // Update password
   const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { password: hashedPassword },
      { new: true }
   );

   if (!updatedUser) {
      throw new BadRequestError("Invalid user data");
   }

   res.status(200).json({ message: "Password has been updated" });
});

module.exports = {
   registerUser,
   loginUser,
   sendResetPassword,
   resetPassword,
};
