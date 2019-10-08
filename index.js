const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: "secret",
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/registration", (req, res) => {
    res.render("register");
});

app.post("/registration", (req, res) => {});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {});

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const signature = req.body.signature;

    db.addSigner(firstName, lastName, signature)
        .then(result => {
            req.session.signatureId = result.rows[0].id;
            console.log("session: ", req.session);
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log(err);
            res.render("petition", { error: true });
        });
});

app.get("/thanks", (req, res) => {
    const id = req.session.signatureId;
    db.getSignature(id)
        .then(result => {
            res.render("thanks", { signature: result.rows[0].signature });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then(function(result) {
            res.render("signers", { signers: result.rows });
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.listen(8080, () => console.log("Petition server is running..."));
