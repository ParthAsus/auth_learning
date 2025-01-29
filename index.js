const cookieParser = require("cookie-parser");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const path = require("path");
const userModel = require("./models/user");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Functions
const passwordGenerate = async function (password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (err) {
    throw ("unable to convert password to hash-password", err);
  }
};

const generateToken = function (email, secret) {
  try {
    const token = jwt.sign({ email: email }, secret);
    return token;
  } catch (err) {
    throw ("err while creating jason web token", err);
  }
};

app.get("/", (req, res) => {
  res.render("signup");
});

app.post("/create", async (req, res) => {
  const { name, email, phone, username, password } = req.body;
  const hashedPassword = await passwordGenerate(password);

  const token = generateToken(email, "hello");
  res.cookie("auth_token", token);

  if (!req.cookies.auth_token) {
    return res.redirect("/login");
  }
  await userModel.create({
    name,
    email,
    phoneNo: phone,
    password: hashedPassword,
    userName: username,
  });
  console.log("user created...");
  res.redirect("/home");
});

app.get("/logout", async (req, res) => {
  res.cookie("auth_token", "", { expires: new Date(0) });
  // res.render("login");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({
      email
    });
    if(!user){
      return res.status(401).send("invalid email or password");
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if(isValidPassword){
      const token = generateToken(email, 'hello');
      res.cookie("auth_token", token);
      return res.redirect('/home');
    }else{
      console.log('somethign went wrong');
      res.redirect('/login');
    }
  } catch (err) {
    console.error('something went wrong', err);
    return res.status(500).send('Internal Server Error');
  }
});

app.get("/home", (req, res) => {
  try {
    const tokenStored = req.cookies.auth_token;
    if (!tokenStored) {
      return res.redirect("/login"); // If token doesn't exist, redirect to login
    } else {
      res.render("home");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000);
