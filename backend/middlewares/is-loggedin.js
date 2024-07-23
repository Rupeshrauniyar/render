const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const StudentModel = require('../models/student-model');
const CookieParser = require('cookie-parser');
app.use(CookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.redirect('/login');
    } else {
        jwt.verify(token, "SECRET_KEY", async (err, decoded) => {
            const Student = await StudentModel.findOne({ UserId: decoded.UserId });
            if (!Student) {
                res.redirect('/login');
            } else {
                res.Student = Student;
                next();
                
            }
        });
    }
 
}
module.exports = isLoggedIn;