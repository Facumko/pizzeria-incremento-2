const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/auth",
    createProxyMiddleware({
      target: "https://superadditional-septariate-olevia.ngrok-free.dev",
      changeOrigin: true,
      secure: false,
      logLevel: "debug",
      xfwd: true,
    })
  );
};
