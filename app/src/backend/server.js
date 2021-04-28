const express = require('express')
const cors = require("cors");
const bodyParser = require("body-parser");
// const debug = require("debug")("http");
// Import Routes
const dataRoutes = require("./routes/data.js");
const generateRoutes = require("./routes/generate.js");



const app = express()
const port = 8080

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Routing
app.use("/data", dataRoutes);
app.use("/generate", generateRoutes);




app.listen(port, () => {
    // debug(`Start server at port : ${port}`);
    console.log(`Example app listening at http://localhost:${port}`)
})