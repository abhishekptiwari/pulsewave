module.exports = (app) => {
  //* Middleware Common Routes
  app.use("/api/v1/users", require("./users_routes"));
};
