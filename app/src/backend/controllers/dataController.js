const faker = require("./input_data/faker.json");
const cakephp = require("./input_data/cakephp.json");
const PHPExcel = require("./input_data/PHPExcel.json");
const slim = require("./input_data/slim.json");
const java = require("./input_data/java.json");
const mathphp = require("./input_data/math-php.json");

// const dotenv = require("dotenv");

// Configure dotenv for read environment variables.
// dotenv.config();

exports.getFaker = (req, res) => {
  // Check the body is valid.
  // if (req.body.userName == undefined) {
  //   console.error("userName is not defined");
  //   res.status(406).send("Not acceptable");
  // } else {
    res.json(faker); s
  // }
};
exports.getcakephp = (req, res) => {
    res.json(cakephp); 
};
exports.getPHPExcel = (req, res) => {
  res.json(PHPExcel); 
};
exports.getslim = (req, res) => {
  res.json(slim); 
};

exports.getJava = (req, res) => {
  res.json(java); 
};
exports.getmathphp = (req, res) => {
  res.json(mathphp); 
};
