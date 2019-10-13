const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const { hash, compare } = require("./bcrypt");
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

app.use((req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();

    if (req.session.userId) {
        if (["/login", "/registration"].includes(req.url)) {
            res.redirect("/");
            return;
        } else {
            if (req.session.signatureId) {
                if (["/petition"].includes(req.url)) {
                    res.redirect("/thanks");
                    return;
                }
            } else {
                if (["/thanks", "/signers"].includes(req.url)) {
                    res.redirect("/");
                    return;
                }
            }
        }
    } else {
        if (!["/login", "/registration", "/logout"].includes(req.url)) {
            res.redirect("/registration");
            return;
        }
    }

    next();
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/registration", (req, res) => {
    res.render("register");
});

app.post("/registration", (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    hash(password).then(hash => {
        db.addUser(firstName, lastName, email, hash)
            .then(result => {
                req.session.userId = result.rows[0].id;
                res.redirect("/profile");
            })
            .catch(() => {
                res.render("register", { error: true });
            });
    });
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    const { age, city, homepage } = req.body;
    const userId = req.session.userId;

    if (age != "" || city != "" || homepage != "") {
        if (
            homepage != "" &&
            !homepage.startsWith("http://") &&
            !homepage.startsWith("https://")
        ) {
            res.render("profile", { error: true });
        } else {
            db.upsertUserProfile(age, city, homepage, userId)
                .then(id => {
                    req.session.profileId = id.rows[0].id;
                    res.redirect("/");
                })
                .catch(() => {
                    res.render("profile", { error: true });
                });
        }
    } else {
        res.redirect("/");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.getUser(email)
        .then(result => {
            const user = result.rows[0];
            return compare(password, user.password).then(isValid => {
                if (isValid) {
                    req.session.userId = user.user_id;
                    req.session.signatureId = user.signature_id;
                    res.redirect("/petition");
                } else {
                    res.render("login", { error: true });
                }
            });
        })
        .catch(() => {
            res.render("login", { error: true });
        });
});

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    const userId = req.session.userId;
    const signature = req.body.signature;

    db.addSigner(userId, signature)
        .then(result => {
            req.session.signatureId = result.rows[0].id;
            res.redirect("/thanks");
        })
        .catch(() => {
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
        .then(result => {
            res.render("signers", { signers: result.rows });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/signers/:city", (req, res) => {
    const city = req.params.city;

    db.getSignersByCity(city)
        .then(city => {
            res.render("signers", { signers: city.rows });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/profile/edit", (req, res) => {
    const userId = req.session.userId;

    db.getUserInfo(userId)
        .then(result => {
            res.render("editprofile", { user: result.rows[0] });
        })
        .catch(err => {
            console.log(err);
        });
});

app.post("/profile/edit", (req, res) => {
    const userId = req.session.userId;
    const {
        firstName,
        lastName,
        email,
        password,
        age,
        city,
        homepage
    } = req.body;

    db.updateUser(firstName, lastName, email, userId)
        .then(() => {
            if (password) {
                return hash(password).then(hash => {
                    db.updateUserPassword(hash, userId);
                });
            }
        })
        .then(db.upsertUserProfile(age, city, homepage, userId))
        .then(res.redirect("/"))
        .catch(err => {
            console.log(err);
        });
});

app.post("/profile/delete", (req, res) => {
    const signatureId = req.session.signatureId;
    const userId = req.session.userId;

    db.deleteSignature(signatureId)
        .then(() => {
            req.session.signatureId = null;
        })
        .then(db.deleteUserProfile(userId))
        .then(db.deleteUser(userId))
        .then(res.redirect("/logout"))
        .catch(err => {
            console.log(err);
        });
});

app.post("/signature/delete", (req, res) => {
    const signatureId = req.session.signatureId;

    db.deleteSignature(signatureId)
        .then(() => {
            req.session.signatureId = null;
            res.redirect("/");
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/registration");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server is running...")
);
