const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    ExamName: String,
    TotalQuestions: Number,
    Duration: Number,
    GroupAQuestions: Number,
    GroupBQuestions: Number,
    Status: String,
    Participants: [],
    Questions: {
        GroupA: [{
            question: String,
            options: [String],
            correctOption: Number,
            Marks: Number,
        }],
        GroupB: [{
            question: String,
            options: [String],
            correctOption: Number,
            Marks: Number,
        }]
    },
    Results: [{
        UserId: String,
        ScoreSheet: {
            TotalQuestions: Number,
            GroupAQuestions: Number,
            GroupBQuestions: Number,
            CorrectOptionsGroupA: [Number],
            CorrectOptionsGroupB: [Number],
            AttemptedOptionsGroupA: [Number],
            AttemptedOptionsGroupB: [Number],
            AttemptedCorrectOptionGroupA: Number,
            AttemptedCorrectOptionGroupB: Number,
            NegativeMarkingGroupA: Number,
            NegativeMarkingGroupB: Number,
            TotalMarks: Number,
            TotalUnansweredQuestions: Number,
        }
    }]
});

const QuestionModel = mongoose.model('Examinations', questionSchema);
module.exports = QuestionModel;
