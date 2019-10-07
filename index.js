const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
// const cookies = require("cookies-session");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(express.static("./public"));

// app.use(
//     cookieSession({
//         secret: `I'm always angry.`,
//         maxAge: 1000 * 60 * 60 * 24 * 14
//     })
// );

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const signature = req.body.signature;

    db.addSigner(firstName, lastName, signature)
        .then(() => {
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/thanks", (req, res) => {
    res.render("thanks");
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
});

app.listen(8080, () => console.log("Petition server is running..."));
