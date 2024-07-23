const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/IOE-Examination')

const StudentSchema = mongoose.Schema({
    UserId: {
        
        type: String
    },
    FullName: {
        
        type: String
    },
    PhoneNumber: {
       
        type: Number
    },
    Password: {
        
        type: String
    }
})


const StudentModel = mongoose.model("students", StudentSchema);
module.exports = StudentModel;