import express from 'express';
import mongoose from 'mongoose';
import encrypt from 'mongoose-encryption';

const app = express();
const { Schema } = mongoose;

mongoose.connect("mongodb://localhost:27017/usersDB");

const userSchema = new Schema({
    email: String,
    password: String
});

const secret = "Thisisourlittlesecret.";

userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

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
        user = await User.findOne({email: email}).exec();
        if(user && user.password === password) {
            res.render('secrets');
        } else {
            console.log('Password is wrong or user not found.');
        }
    });

app.route("/register")
    .get((req, res) => {
        res.render('register');
    })
    .post(async (req, res) => {
        const user = new User({
            email: req.body.username,
            password: req.body.password
        });
        await user.save()
            .then(() => {
                res.render('secrets');
            })
            .catch(e => console.log(e));
    });

app.listen(3000 || process.env.PORT, () => {
    console.log("Server is running.");
});