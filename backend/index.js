const express = require("express");
const main = require("./routes/index");
const app = express();
var cors = require("cors")

app.use(cors());
app.use(express.json());
app.use("/api/v1", main);
app.listen(3000);