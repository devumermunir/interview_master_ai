const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    intention: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high']
    }
})

const roadmapDaySchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true
    },
    focus: {
        type: String,
        required: true
    },
    tasks: {
        type: [String],
        default: []
    }
})

const interviewSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "Target Role Strategy"
    },
    matchScore: {
        type: Number,
        required: true
    },
    skillGaps: {
        type: [skillGapSchema],
        default: []
    },
    technicalQuestions: {
        type: [questionSchema],
        default: []
    },
    behavioralQuestions: {
        type: [questionSchema],
        default: []
    },
    preparationPlan: {
        type: [roadmapDaySchema],
        default: []
    },
    jobDescription: {
        type: String
    },
    selfDescription: {
        type: String
    },
    resume: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})

const interviewModel = mongoose.model("Interview", interviewSchema)

module.exports = { interviewModel }
