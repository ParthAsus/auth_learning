const cookieParser = require('cookie-parser');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const jwt = require('jsonwebtoken');
app.use(cookieParser());

const hash = async function(){
  try{
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('ll', salt);
    return hashPassword;
  } catch(err){
    throw err;
  }
}

let hashedPassword;
// Middleware
const initializeHash = async () => {
  hashedPassword = await hash();
}

app.get('/', (req, res) => {
  let token = jwt.sign({email: 'parth@gmail.com'}, hashedPassword);
  res.cookie('token', token);
  res.send('sent');
  console.log(req.cookies);
});

app.get('/check', (req, res) => {
  let data = jwt.verify(req.cookies.token, hashedPassword);
  console.log(data);
  res.send('done');
})


initializeHash().then(() => {
  app.listen(3000);
})