const { createProxyMiddleware } = require("http-proxy-middleware");

const BACKEND = "http://172.16.80.224:8080";
const opciones = {
  target: BACKEND,
  changeOrigin: true,
  cookieDomainRewrite: "localhost",
};

module.exports = function (app) {
  app.use("/auth",   createProxyMiddleware(opciones));
  app.use("/pizza",  createProxyMiddleware(opciones));
  app.use("/pedido", createProxyMiddleware(opciones));
};