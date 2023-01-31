const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('homepage', { 
        title: 'Homepage', 
        message: 'Welcome to the homepage' 
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router
