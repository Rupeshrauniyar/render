const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/IOE-Examination')

const TeacherSchema = mongoose.Schema({
    TeacherId: {
        
        type: String
    },
    LoginCode: {
        
        type: String
    },
    Password: {
        
        type: String
    }
})


const TeacherModel = mongoose.model("teachers", TeacherSchema);
module.exports = TeacherModel;