var express = require('express');
var cors = require("cors");
var bodyParser = require("body-parser");
// const debug = require("debug")("http");
var faker = require("./input_data/faker.json");
var app = express();
var port = 8080;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.get('/data/faker', function (req, res) {
    res.json(faker);
});
app.listen(port, function () {
    //   debug(`Start server at port : ${port}`);
    console.log("Example app listening at http://localhost:" + port);
});
//# sourceMappingURL=server.js.map