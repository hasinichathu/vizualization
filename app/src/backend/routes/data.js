const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController.js");


router.get('/faker', dataController.getFaker);

router.get('/cakephp', dataController.getcakephp);

router.get('/PHPExcel', dataController.getPHPExcel);
 
router.get('/slim', dataController.getslim);

module.exports = router;