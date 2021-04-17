const express = require('express')
const cors = require("cors");
const bodyParser = require("body-parser");
// const debug = require("debug")("http");

const faker = require("./input_data/faker.json");
const cakephp = require("./input_data/cakephp.json");
const PHPExcel = require("./input_data/PHPExcel.json");
const slim = require("./input_data/slim.json");

const app = express()
const port = 8080

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Routing
// app.use("/data", authenticateUser, studentRoutes);

app.get('/data/faker', (req, res) => {
    res.json(faker);
})
app.get('/data/cakephp', (req, res) => {
    res.json(cakephp);
})
app.get('/data/PHPExcel', (req, res) => {
    res.json(PHPExcel);
})
app.get('/data/slim', (req, res) => {
    res.json(slim);
})

app.listen(port, () => {
    // debug(`Start server at port : ${port}`);
    console.log(`Example app listening at http://localhost:${port}`)
})