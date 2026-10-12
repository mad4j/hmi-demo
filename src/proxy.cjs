const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();


// Middleware per aggiungere header CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // permette qualsiasi origine
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/", createProxyMiddleware({
  target: "https://192.168.1.13", // 
  changeOrigin: true,
  secure: false,
  logLevel: "debug"
}));

app.listen(5224, () => {
  console.log("Proxy attivo su http://localhost:5224");
});