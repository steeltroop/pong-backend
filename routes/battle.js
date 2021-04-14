const express = require("express");
const router = express.Router();
const battleController = require("../controller/battle.controller");

router.patch("/", battleController.patch);

module.exports = router;
