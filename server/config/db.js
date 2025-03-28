require("dotenv").config();
const sql = require("mssql");
const express = require("express");


const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
      encrypt: true,
      trustServerCertificate: true
  }
};


sql.connect(dbConfig)
  .then(() => console.log("✅ Database Connected"))
  .catch(err => console.error("❌ Database Connection Error:", err));


  module.exports = dbConfig;