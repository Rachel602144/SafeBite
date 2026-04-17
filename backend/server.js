const bcrypt = require("bcryptjs");
const User = require("./user");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/safebite")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});



app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, allergies, medicalCondition } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      allergies,
      medicalCondition
    });

    await newUser.save();

    res.json({ message: "Signup successful" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error signing up" });
  }
});








const jwt = require("jsonwebtoken");

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ message: "Wrong password" });
    }

    // create token
    const token = jwt.sign({ id: user._id }, "secret");

    res.json({
      message: "Login successful",
      token: token,
      userId: user._id,
      user: {
        name: user.name,
        email: user.email,
        allergies: user.allergies,
        medicalCondition: user.medicalCondition
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login error" });
  }
});