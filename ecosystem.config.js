module.exports = {
  apps: [{
    name: "DocuBay-D2C-I",
    script: "./app.js",
    env_production: {
      NODE_ENV: "prod"
    },
    env_staging: {
      NODE_ENV: "stg"
    },
    env_development: {
      NODE_ENV: "dev"
    },
    instances: 1,
    exec_mode: "cluster"
  }]
}
