require('dotenv').config();
const express = require("express");
const main = require("./routes/index");
const app = express();
var cors = require("cors")
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/api/v1", main);
app.listen(port,() => {
    console.log(`Server running at http://localhost:${port}/`);
});