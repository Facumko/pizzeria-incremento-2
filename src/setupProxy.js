const { createProxyMiddleware } = require("http-proxy-middleware");

const BACKEND = "https://superadditional-septariate-olevia.ngrok-free.dev";

const opciones = {
  target:              BACKEND,
  changeOrigin:        true,
  secure:              true,
  cookieDomainRewrite: "localhost",
  proxyTimeout:        15000,
  timeout:             15000,
  // onProxyReq funciona en v2 y v3 de http-proxy-middleware
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader("ngrok-skip-browser-warning", "true");
  },
  onError: (err, req, res) => {
    console.error("[Proxy error]", err.message);
    res.status(504).json({ error: "Backend no disponible", detail: err.message });
  },
};

module.exports = function (app) {
  app.use("/auth",     createProxyMiddleware(opciones));
  app.use("/pizza",    createProxyMiddleware(opciones));
  app.use("/pedido",   createProxyMiddleware(opciones));
  app.use("/factura",  createProxyMiddleware(opciones));
  app.use("/reportes", createProxyMiddleware(opciones));
};