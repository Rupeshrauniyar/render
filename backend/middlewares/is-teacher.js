const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const TeacherModel = require('../models/teacher-model');
const CookieParser = require('cookie-parser');
app.use(CookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isTeacher = async (req,res,next) => {
    const token = req.cookies.token;
    if(!token){
        res.redirect("/teacher/login")
    }
    else{
        jwt.verify(token,"SECRET_KEY", async (err,decoded)=>{
            const TeacherId = decoded.TeacherId
            const Teacher = await TeacherModel.findOne({TeacherId})
            if(Teacher){
                res.teacher = Teacher
                next()
            }
            else{
                res.redirect("/teacher/login")
            }
        })
    }
}
module.exports = isTeacher;