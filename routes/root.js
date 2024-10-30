module.exports = (app) => {
  //* Middleware Common Routes
  app.use("/api/v1", require("./beneficiary_routes"));
  app.use("/api/v1/users", require("./users_routes"));

};
