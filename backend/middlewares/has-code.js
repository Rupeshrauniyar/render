const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const StudentModel = require('../models/student-model');
const TeacherModel = require('../models/teacher-model');
const CookieParser = require('cookie-parser');
app.use(CookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hascode = (req, res, next) => {
    const token = req.cookies.LoginToken;
    if (!token) {
        res.redirect('/teacher');
    } else {
        jwt.verify(token, "SECRET_KEY", async (err, decoded) => {
            const Teacher = await TeacherModel.findOne({ LoginCode: decoded.LoginCode });
            if (!Teacher) {
                res.redirect('/teacher');
            } else {
                res.Teacher = Teacher;
                next();
                
            }
        });
    }
 
}
module.exports = hascode;