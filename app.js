const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;

const app = express();

app.get('/', (req, res) => {
    res.send('Works');
})

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
});