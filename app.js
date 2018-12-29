const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const port = process.env.PORT || 3000;
const keys = require('./config/keys');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

// Load models
require('./models/User');
require('./models/Story')

// Handlebars Helpers
const {
    truncate,
    stripTags,
    formatDate,
    select,
    editIcon
} = require('./helper/hbs');

// Routes
const authRoute = require('./routes/auth');
const indexRoute = require('./routes/index');
const storiesRoute = require('./routes/stories');

// Passport Config
require('./config/passport')(passport);

// // Map global Promises
// mongoose.Promise = global.Promise;

// Mongoose Connect
mongoose.connect(keys.mongoURI, { useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const app = express();

// Method Override Middleware
app.use(methodOverride('_method'));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handlebars Middleware
app.engine('handlebars', exphbs({
    helpers: {
        truncate: truncate,
        stripTags: stripTags,
        formatDate: formatDate,
        select: select,
        editIcon: editIcon
    },
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

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Load Routes
app.use('/auth', authRoute);
app.use('/', indexRoute);
app.use('/stories', storiesRoute);

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
});









