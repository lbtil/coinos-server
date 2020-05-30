const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");

l = require("pino")();
config = require("./config");
networks = [];
prod = process.env.NODE_ENV === "production";

if (config.bitcoin) networks.push('bitcoin');
if (config.liquid) networks.push('liquid');
if (config.lna) networks.push('lightning');

SATS = 100000000;
toSats = (n) => parseInt((n * SATS).toFixed());

app = express();
app.enable("trust proxy");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://*:*" }));
app.use(compression());

server = require("http").Server(app);
require("./db");
require("./lib/utils");
require("./lib/sockets");
require("./lib/passport");
require("./lib/rates");

require("./routes/assets");
require("./routes/balances");
require("./routes/invoices");
require("./routes/payments");
require("./routes/users");

app.use((err, req, res, next) => {
  const details = {
    path: req.path,
    body: req.body,
    msg: err.message,
    stack: err.stack,
  };

  if (req.user) details.username = req.user.username;

  l.error("uncaught error", details);
  res.status(500);
  res.send("An error occurred");
  return res.end();
});

server.listen(config.port, () =>
  console.log(`CoinOS Server listening on port ${config.port}`)
);
