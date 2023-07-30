const app = require("express")();

app.get("/", (req, res) => res.send("Welcome to e-commerce APIs!"));

app.use("/role", require("./role.routes"));
app.use("/user", require("./user.routes"));
app.use("/product", require("./product.routes"));
app.use("/cart", require("./cart.routes"));

module.exports = app;