const express = require("express");
const driveRouter = require("../controllers/driveController1");

const router = express.Router();

router.use("/drive", driveRouter);

module.exports = router;
