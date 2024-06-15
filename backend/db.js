require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected to VeloPay database..."))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
});

const User = mongoose.model("User", userSchema);

module.exports = {
    User
}