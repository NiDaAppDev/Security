import * as dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const app = express();
const { Schema } = mongoose;
const saltRounds = 10;

mongoose.connect("mongodb://localhost:27017/usersDB");

const userSchema = new Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.route("/")
    .get((req, res) => {
        res.render('home');
    });

app.route("/login")
    .get((req, res) => {
        res.render('login');
    })
    .post(async (req, res) => {
        const email = req.body.username,
            password = req.body.password,
            user = await User.findOne({ email: email }).exec();

        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if(result) {
                    res.render('secrets');
                } else {
                    console.log('Wrong password.');
                }
            });
        } else {
            console.log('User not found.');
        }
    });

app.route("/register")
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        bcrypt.hash(req.body.password, saltRounds, async(err, hash) => {
            if (err) {
                res.send(err);
            } else {
                const user = new User({
                    email: req.body.username,
                    password: hash
                });
                await user.save()
                    .then(() => {
                        res.render('secrets');
                    })
                    .catch(e => console.log(e));
            }
        });
    });

app.listen(3000 || process.env.PORT, () => {
    console.log("Server is running.");
});