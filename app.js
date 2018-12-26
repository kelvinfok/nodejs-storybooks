const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const auth = require('./routes/auth');

// Passport Config
require('./config/passport')(passport);



const port = process.env.PORT || 3000;

const app = express();

// Use Routes
app.use('/auth', auth);

app.get('/', (req, res) => {
    res.send('Works');
})



app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
});