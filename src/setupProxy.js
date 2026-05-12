const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/auth",
    createProxyMiddleware({
      target: "http://172.16.80.224:8080/auth",
      changeOrigin: true,
      pathRewrite: { "^/auth": "" },
    })
  );
};