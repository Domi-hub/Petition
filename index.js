const express = require("express");
const app = express();
const hb = require("express-handlebars");

app.use(
    express.urlencoded({
        extended: false
    })
);

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(function(req, res, next) {
    next();
});

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.get("/thanks", (req, res) => {
    res.render("thanks");
});

app.get("/signers", (req, res) => {
    res.render("signers");
});

app.listen(8080, () => console.log("Petition server is running..."));
