const express = require("express");
const router = express.Router();
const parseController = require("../controllers/parseController.js");

router.get("/", parseController.getAST);

module.exports = router;
