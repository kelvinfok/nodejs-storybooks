const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const exphbs = require('express-handlebars');
const port = process.env.PORT || 3000;
const authRoute = require('./routes/auth');
const indexRoute = require('./routes/index');
const keys = require('./config/keys');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

// Load user model
require('./models/User');

// Passport Config
require('./config/passport')(passport);

// // Map global Promises
// mongoose.Promise = global.Promise;

// Mongoose Connect
mongoose.connect(keys.mongoURI, { useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Session middleware
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global vars
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
})

// Load Routes
app.use('/auth', authRoute);
app.use('/', indexRoute);

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
});
