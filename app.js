import * as dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';

const app = express();
const { Schema } = mongoose;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/usersDB");

const userSchema = new Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/")
    .get((req, res) => {
        res.render('home');
    });

app.route("/login")
    .get((req, res) => {
        res.render('login');
    })
    .post(async (req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        req.login(user, (err) => {
            if (err) {
                console.log(err);
                return;
            }
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        });
    });

app.route("/register")
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        User.register({ username: req.body.username }, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
                return;
            }
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        });
    });

app.route("/secrets")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render('secrets');
            return;
        }
        res.redirect("/login");
    });

app.route("/logout")
    .get((req, res, next) => {
        req.logout(err => {
            if (err) {
                return next(err)
            }
            res.redirect("/");
        });
    });

app.listen(3000 || process.env.PORT, () => {
    console.log("Server is running.");
});