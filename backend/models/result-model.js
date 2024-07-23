const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    ExamName: String,
    Duration: Number,
    Participants: [{
        UserId: String,
        Result: [{
            TotalQuestions: Number,
            GroupAQuestions: Number,
            GroupBQuestions: Number,
            CorrectOptionsGroupA: [],
            CorrectOptionsGroupB: [],
            AttemptedOptionsGroupA: [],
            AttemptedOptionsGroupB: [],
            AttemptedCorrectOptionGroupA: Number,
            AttemptedCorrectOptionGroupB: Number,
            NegativeMarkingGroupA: Number,
            NegativeMarkingGroupB: Number,
            TotalMarks: Number,
            TotalUnansweredQuestions: Number,
        }]
    }],

});

const ResultModel = mongoose.model('results', ResultSchema);
module.exports = ResultModel;
