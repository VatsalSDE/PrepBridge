// src/app.js

const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "PrepBridge Backend Running 🚀"
  });
});

module.exports = app;