const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')
app.set("view engine", "ejs")
const path = require("path");
const CookieParser = require('cookie-parser');
app.use(CookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
const StudentModel = require('./models/student-model')
const TeacherModel = require('./models/teacher-model')
const ExaminationModel = require('./models/exam-model')
const ResultModel = require('./models/result-model')
const isLoggedin = require("./middlewares/is-loggedin")
const isteacher = require("./middlewares/is-teacher")
const hascode = require("./middlewares/has-code")
const bcrypt = require('bcryptjs')

app.get("/", isLoggedin, async (req, res) => {
    const token = req.cookies.token;
    const DecodedUserId = jwt.verify(token, "SECRET_KEY")
    const UserId = DecodedUserId.UserId
    const Student = await StudentModel.findOne({ UserId })
    const Exams = await ExaminationModel.find()
    res.render("index", { Student, Exams })

})
app.get("/login", (req, res) => {
    res.render("login")
})
app.post("/login", async (req, res) => {
    const { UserId, Password } = req.body;
    const Student = await StudentModel.findOne({ UserId })
    if (Student) {
        bcrypt.compare(Password, Student.Password, async (error, result) => {
            if (result) {
                const token = jwt.sign({ UserId: Student.UserId }, "SECRET_KEY")
                res.cookie("token", token)
                res.send(token)
            } else {
                res.redirect("/login")
            }
        })
    }
    else {
        res.redirect("/login")
    }

})
app.get("/register", (req, res) => {
    res.render("register")
})
app.post("/register", async (req, res) => {
    const { UserId, FullName, PhoneNumber, Password } = req.body;
    const SearchedStudent = await StudentModel.findOne({ UserId })
    if (SearchedStudent) {
        res.render("register")
    }
    else {
        const salt = bcrypt.genSalt(10, async (error, salt) => {
            bcrypt.hash(Password, salt, async (error, hash) => {
                const Student = await StudentModel.create({
                    UserId,
                    FullName,
                    PhoneNumber,
                    Password: hash
                })

                const token = jwt.sign({ UserId: Student.UserId }, "SECRET_KEY")
                res.cookie("token", token)
                res.redirect("/")
            })
        })
    }
})
app.post("/exam", isLoggedin, (req, res) => {
    res.render("exam")
})
// app.get("/teacher/register", (req, res) => {
//     res.render("teacher-register")
// })
// app.post("/teacher/register", async (req, res) => {
//     const { TeacherId, LoginCode, Password } = req.body;

//     const salt = bcrypt.genSalt(10, async (error, salt) => {
//         bcrypt.hash(Password, salt, async (error, PasswordHash) => {
//             bcrypt.hash(LoginCode, salt, async (error, LoginCodeHash) => {
//             const Teacher = await TeacherModel.create({
//                 TeacherId, 
//                 LoginCode : LoginCodeHash,
//                 Password: PasswordHash
//             })

//             const token = jwt.sign({ TeacherId: Teacher.TeacherId }, "SECRET_KEY")
//             res.cookie("token", token)
//             res.redirect("/teacher")
//         })
//     })
//     })

// })
app.get("/teacher/login", (req, res) => {
    res.render("teacher-login")
})
app.post("/teacher/login", async (req, res) => {
    const { TeacherId, LoginCode, Password } = req.body
    const Teacher = await TeacherModel.findOne({ TeacherId })
    if (Teacher) {
        bcrypt.compare(Password, Teacher.Password, async (error, result) => {
            if (result) {
                bcrypt.compare(LoginCode, Teacher.LoginCode, async (error, TeacherResult) => {
                    if (TeacherResult) {
                        const token = jwt.sign({ TeacherId: Teacher.TeacherId }, "SECRET_KEY")
                        res.cookie("token", token)
                        res.redirect("/teacher")
                    }
                    else {
                        res.redirect("/teacher/login")
                    }
                })
            }
            else {
                res.redirect("/teacher/login")
            }
        })
    }
    else {
        res.redirect("/teacher/login")
    }
})
app.get("/teacher", isteacher, async (req, res) => {
    const Exams = await ExaminationModel.find();
    res.render("teacher", { Exams })
})
app.post("/teacher", isteacher, async (req, res) => {
    const { TeacherId, LoginCode } = req.body;
    const Teacher = await TeacherModel.findOne({ TeacherId })
    if (Teacher) {
        bcrypt.compare(LoginCode, Teacher.LoginCode, (error, result) => {
            if (result) {
                const LoginToken = jwt.sign({ LoginCode: Teacher.LoginCode }, "SECRET_KEY")
                res.cookie("LoginToken", LoginToken)
                res.redirect("/teacher/exam/create")
            }
            else {
                res.redirect("/teacher")
            }
        })
    } else {
        res.redirect("/teacher")
    }
})
app.get("/teacher/exam/create", isteacher, hascode, async (req, res) => {
    res.render("exam-create")
})
app.post('/teacher/exam/create', async (req, res) => {
    try {
        const { Questions, ExamName, TotalQuestions, Duration, GroupAQuestions, GroupBQuestions, Status } = req.body;
        const questionPaper = new ExaminationModel({
            ExamName,
            TotalQuestions,
            Duration,
            GroupAQuestions,
            GroupBQuestions,
            Status,
            Questions: {
                GroupA: Questions.GroupA,
                GroupB: Questions.GroupB
            }
        });
        await questionPaper.save();
        res.redirect("/teacher");
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while saving the questions.');
    }
});

app.get("/teacher/exam/edit/:id", isteacher, hascode, async (req, res) => {
    const Exam = await ExaminationModel.findById(req.params.id);
    res.render("exam-edit", { Exam })
})
app.post("/teacher/exam/edit/:id", isteacher, hascode, async (req, res) => {
    const Exam = await ExaminationModel.findById(req.params.id);
    try {
        const { Questions, ExamName, TotalQuestions, Duration, GroupAQuestions, GroupBQuestions, Status } = req.body;
        const QuestionPaper = await ExaminationModel.findOneAndUpdate(Exam, {
            Questions,
            ExamName,
            TotalQuestions,
            Duration,
            GroupAQuestions,
            GroupBQuestions,
            Status
        });
        res.redirect("/teacher")
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while saving the questions.');
    }
})
app.post("/teacher/exam/delete/:id", isteacher, hascode, async (req, res) => {
    const Exam = await ExaminationModel.findById(req.params.id);
    try {
        const Delete = await ExaminationModel.findOneAndDelete(Exam);
        res.redirect("/teacher")
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while saving the questions.');
    }
})

app.get("/exam/:id", isLoggedin, async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const questionsPerPage = 20;

    const exam = await ExaminationModel.findById(id).lean();
    const totalQuestions = exam.GroupAQuestions + exam.GroupBQuestions;

    // Calculate the range of questions to display
    const startIndex = (page - 1) * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, totalQuestions);

    const questions = [];
    let groupAEnd = Math.min(exam.GroupAQuestions, endIndex);
    let groupBStart = Math.max(0, startIndex - exam.GroupAQuestions);
    let groupBEnd = Math.min(groupBStart + questionsPerPage, exam.GroupBQuestions);

    if (startIndex < exam.GroupAQuestions) {
        questions.push(...exam.Questions.GroupA.slice(startIndex, groupAEnd));
    }
    if (endIndex > exam.GroupAQuestions) {
        questions.push(...exam.Questions.GroupB.slice(groupBStart, groupBEnd));
    }


    res.render("exam", { exam, questions, currentPage: page, totalQuestions, questionsPerPage });




});
app.post("/exam/:id/submit", isLoggedin, async (req, res) => {
    const id = req.params.id;
    const exam = await ExaminationModel.findById(id).lean();

    const AttemptedOptionsGroupA = req.body.GroupAoption || [];
    const AttemptedOptionsGroupB = req.body.GroupBoption || [];

    const correctOptionGroupA = exam.Questions.GroupA.map(question => question.correctOption);
    const correctOptionGroupB = exam.Questions.GroupB.map(question => question.correctOption);

    let AttemptedCorrectOptionGroupA = 0;
    let AttemptedCorrectOptionGroupB = 0;
    let NegativeAnswersGroupA = 0;
    let NegativeAnswersGroupB = 0;

    // Calculate AttemptedCorrectOptionGroupA for Group A
    for (let i = 0; i < correctOptionGroupA.length; i++) {
        const attemptedAnswer = AttemptedOptionsGroupA[i];
        if (attemptedAnswer !== undefined && correctOptionGroupA[i] === parseInt(attemptedAnswer)) {
            AttemptedCorrectOptionGroupA += 1;
        } else if (attemptedAnswer !== undefined) { // count only if the question was attempted
            NegativeAnswersGroupA += 1;
        }
    }

    // Calculate AttemptedCorrectOptionGroupB for Group B
    for (let i = 0; i < correctOptionGroupB.length; i++) {
        const attemptedAnswer = AttemptedOptionsGroupB[i];
        if (attemptedAnswer !== undefined && correctOptionGroupB[i] === parseInt(attemptedAnswer)) {
            AttemptedCorrectOptionGroupB += 1;
        } else if (attemptedAnswer !== undefined) { // count only if the question was attempted
            NegativeAnswersGroupB += 1;
        }
    }

    const decoded = jwt.verify(req.cookies.token, "SECRET_KEY");
    const UserId = decoded.UserId;
    const TotalQuestions = exam.TotalQuestions;
    const GroupAQuestions = exam.GroupAQuestions;
    const GroupBQuestions = exam.GroupBQuestions;
    const NegativeMarkingGroupA = NegativeAnswersGroupA * 0.10;
    const NegativeMarkingGroupB = (NegativeAnswersGroupB ) * 0.20;
    const TotalMarks = (AttemptedCorrectOptionGroupA + (AttemptedCorrectOptionGroupB * 2)) - (NegativeMarkingGroupA + NegativeMarkingGroupB);
    const TotalUnansweredQuestions = TotalQuestions - (AttemptedOptionsGroupA.length + AttemptedOptionsGroupB.length);

    const result = {
        UserId,
        ScoreSheet: {
            TotalQuestions,
            GroupAQuestions,
            GroupBQuestions,
            CorrectOptionsGroupA: correctOptionGroupA,
            CorrectOptionsGroupB: correctOptionGroupB,
            AttemptedOptionsGroupA,
            AttemptedOptionsGroupB,
            AttemptedCorrectOptionGroupA,
            AttemptedCorrectOptionGroupB,
            NegativeMarkingGroupA,
            NegativeMarkingGroupB,
            TotalMarks,
            TotalUnansweredQuestions
        }
    };

    try {
        const SubmitResult = await ExaminationModel.findOneAndUpdate(
            { _id: id },
            { $push: { Results: result } },
            { new: true }
        );
        res.redirect("/");
    } catch (error) {
        res.status(500).send({ error: 'Failed to submit results.' });
    }
});






app.listen("3000")