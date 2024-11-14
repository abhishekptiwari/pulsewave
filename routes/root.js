module.exports = (app) => {
  //* Middleware Common Routes
  app.use("/api/v1", require("./beneficiary_routes"));
  app.use("/api/v1/users", require("./users_routes"));
  app.use("/api/v1/funds", require("./transaction_routes"));
  app.use("/api/v1/accounts", require("./account_routes"));
  app.use("/api/v1/notifications", require("./notification_routes"));
};
