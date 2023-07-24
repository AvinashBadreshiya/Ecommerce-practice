const app = require("express")();

app.get("/", (req, res) => res.send("Welcome to e-commerce APIs!"));

app.use("/role", require("./role.routes"));
app.use("/user", require("./user.routes"));

module.exports = app;