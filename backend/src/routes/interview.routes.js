const express = require('express')

const interviewRouter = express.Router()
const multer = require('multer')
const {
    generateInterviewQuestions,
    getInterviewById,
    getAllInterview,
    generateResumePdfController
} = require('../controllers/interview.controller')


const upload = multer({ storage: multer.memoryStorage() })
const authMiddleware = require('../middlewares/auth.middleware')

interviewRouter.use(authMiddleware)

interviewRouter.post('/', upload.single("resume"), generateInterviewQuestions)
interviewRouter.get('/', getAllInterview)
interviewRouter.get('/report/:interviewId', getInterviewById)
interviewRouter.post('/resume/pdf/:interviewReportId', generateResumePdfController)

module.exports = interviewRouter