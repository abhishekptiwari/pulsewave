const http = require("http");
const helmet = require("helmet");
const logger = require("morgan");
const connectDB = require('./database/mongoDB.js');
const compression = require("compression");

//* Global Includes Packages
const path = require("path");
const dotenv = require("dotenv");
const express = require("express");

var app = express();
app.use(compression());

//* Environment-Variables Configuration
let configFileName = ".env.development";
if (process.env.NODE_ENV === "Staging") {
  configFileName = ".env.testing";
} else if (process.env.NODE_ENV === "PRODUCTION") {
  configFileName = ".env.production";
}
if (!configFileName) configFileName = ".env.development";
delete require.cache[require.resolve(`./config/${configFileName}`)];
dotenv.config({ path: path.resolve(__dirname, "config", configFileName) });

//* Global include variables
const envVariables = process.env;
const { APP_ENV, APP_PORT, ENC_SECURE_KEY, WEB_ACCESS_TOKEN, API_VERSION } =
  envVariables;

global.APP_PORT = APP_PORT;
global.API_VERSION = API_VERSION;
global.ENC_SEC_KEY = ENC_SECURE_KEY;
global.WEB_ACS_TOKEN = WEB_ACCESS_TOKEN;

//* Global Includes
const global_includes = require("./modules/global_includes/global_includes");

//* Application PORTS
const PORT_running = APP_PORT || 8080;

//* Http Server Setup
http
  .createServer(app, function (req, res) {
    res.end("Connected");
  })
  .listen(PORT_running, (error) => {
    if (error) {
      console.error(error);
      return process.exit(1);
    } else {
      console.log(
        "Running on port: " + PORT_running + " 🚀 => " + process.env.NODE_ENV
      );
    }
  });

//* Running Port of Application
app.set("port", process.env.PORT || PORT_running);

//* Hemlet Configurations
if (APP_ENV === "PRODUCTION") {
  app.use(helmet.contentSecurityPolicy());
  app.use(
    helmet({ crossOriginOpenerPolicy: true, crossOriginResourcePolicy: false })
  );
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
}

var mongoConnectDB = connectDB();

app.use(logger("dev"));
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "content-Type,X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

require("./routes/root")(app);


