const express = require('express')
const cors = require("cors");
const bodyParser = require("body-parser");
// const debug = require("debug")("http");

const faker = require("./input_data/faker.json");

const app = express()
const port = 8080

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/data/faker', (req, res) => {
    res.json(faker);
})

app.listen(port, () => {
    //   debug(`Start server at port : ${port}`);
    console.log(`Example app listening at http://localhost:${port}`)
})