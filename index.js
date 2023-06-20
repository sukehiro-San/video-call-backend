require("dotenv").config();
const app = require("express")();
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const cors = require("cors");

const PORT = process.env.PORT;
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

app.use(cors({ origin: "*" }));
const nocache = (req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
};

const generateAccessToken = (req, res) => {
  // Set Response Header
  res.header("Access-Control-Allow-Origin", "*");
  // Get Channel Name
  let channelName = req.query.channelName;
  if (!channelName || channelName === "") {
    return res.status(500).json({
      error: {
        type: "channelName:required",
        message: "Please provide a valid channel name to join the call",
      },
    });
  }
  // Get UID
  let UID = req.query.uid;
  if (!UID || UID === "") {
    UID = 0;
  }
  // Get Role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role === "publisher") {
    role = RtcRole.PUBLISHER;
  }
  // Get the Expire Time
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // Calculate Privilege Expiration time since 1970
  let currentTime = Math.floor(Date.now() / 1000);
  let privilegeExpireTime = currentTime + expireTime;

  // Build the Token
  let token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    UID,
    role,
    privilegeExpireTime
  );

  // Return the Token
  return res.json({ token: token });
};
app.get("/", (req, res) => {
  res.send("Hello");
});
app.get("/access_token", nocache, generateAccessToken);

app.listen(PORT, () =>
  console.log("Server listening on port: ", PORT)
);
