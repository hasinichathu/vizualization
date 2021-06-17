const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController.js");


router.get('/faker', dataController.getFaker);

router.get('/cakephp', dataController.getcakephp);

router.get('/PHPExcel', dataController.getPHPExcel);
 
router.get('/slim', dataController.getslim);
router.get('/java', dataController.getJava);
router.get('/math-php', dataController.getmathphp);
router.get('/attributeDemo', dataController.getattributeDemo);
router.get('/interfaceDemo', dataController.getinterfaceDemo);
router.get('/classDemo', dataController.getclassDemo);
router.get('/qualityDemo', dataController.getqualityDemo);
router.get('/vulnerabilitiesDemo', dataController.getvulnerabilitiesDemo);

module.exports = router;