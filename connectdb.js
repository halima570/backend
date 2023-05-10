const mongoose = require("mongoose")
const express=require('express')
const app=express()

require("dotenv").config();
//Middlewares
app.use(express.json());
const connect = mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
connect
  .then(db => {
    console.log("connected to db")
  })
  .catch(err => {
    console.log(err)
  })