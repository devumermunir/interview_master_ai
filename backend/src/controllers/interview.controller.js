const { interviewModel } = require("../models/interview.model")
const { generateContent } = require("../services/ai.services")
const jwt = require("jsonwebtoken")
const { PDFParse } = require("pdf-parse")

function createSimplePdf(lines) {
    const streamContent = [
        'BT',
        '/F1 12 Tf',
        '50 740 Td',
        '16 TL',
        ...lines.map(line => `(${line.replace(/[()\\]/g, '\\$&')}) '`),
        'ET'
    ].join('\n')

    const streamLength = Buffer.byteLength(streamContent)
    let pdf = '%PDF-1.4\n'
    const offsets = []

    function addObj(content) {
        offsets.push(Buffer.byteLength(pdf))
        pdf += content + '\n'
    }

    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj')
    addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj')
    addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj')
    addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj')
    addObj(`5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`)

    const startXref = Buffer.byteLength(pdf)
    pdf += 'xref\n'
    pdf += `0 ${offsets.length + 1}\n`
    pdf += '0000000000 65535 f \n'
    for (const offset of offsets) {
        pdf += String(offset).padStart(10, '0') + ' 00000 n \n'
    }
    pdf += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`

    return Buffer.from(pdf)
}

async function generateInterviewQuestions(req, res) {
    try {
        const jobDescription = req.body.jobDescription || req.body.job_description || ""
        const selfDescription = req.body.selfDescription || req.body.self_description || ""
        let resume = ""

        if (req.file) {
            const parser = new PDFParse({ data: req.file.buffer })
            const pdfData = await parser.getText()
            resume = pdfData.text
            await parser.destroy()
        }

        if (!resume && !selfDescription) {
            return res.status(400).json({
                success: false,
                message: "Please provide either a resume file or a self description"
            })
        }

        const userId = req.user.id

        const content = await generateContent(resume, jobDescription, selfDescription)
        let cleanContent = content.trim()
        if (cleanContent.startsWith("```json")) {
            cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "")
        } else if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "")
        }
        const aiData = JSON.parse(cleanContent)

        const result = await interviewModel.create({
            ...aiData,
            resume,
            jobDescription,
            selfDescription,
            user: userId
        })

        res.status(201).json({
            success: true,
            message: "Interview questions generated successfully",
            interviewReport: result,
            data: result
        })
    } catch (error) {
        console.error("Error generating interview questions:", error)
        res.status(500).json({
            success: false,
            message: "Failed to generate interview strategy",
            error: error.message
        })
    }
}

async function getInterviewById(req, res) {
    try {
        const id = req.params.interviewId
        const userId = req.user.id
        const interview = await interviewModel.findOne({ _id: id, user: userId })
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            })
        }
        res.status(200).json({
            success: true,
            interviewReport: interview,
            data: interview
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching interview report",
            error: error.message
        })
    }
}

async function getAllInterview(req, res) {
    try {
        const id = req.user.id
        const interview = await interviewModel.find({ user: id }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            interviewReports: interview,
            data: interview
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching interview reports",
            error: error.message
        })
    }
}

async function generateResumePdfController(req, res) {
    try {
        const id = req.params.interviewReportId
        const userId = req.user.id
        const interview = await interviewModel.findOne({ _id: id, user: userId })
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found"
            })
        }

        const lines = [
            `AI RESUME STRATEGY REPORT`,
            `Position: ${interview.title || 'Target Role'}`,
            `Match Score: ${interview.matchScore}%`,
            `Generated: ${new Date(interview.createdAt).toLocaleDateString()}`,
            ``,
            `KEY SKILL GAPS:`,
            ...(interview.skillGaps || []).map(g => `- [${g.severity.toUpperCase()}] ${g.skill}`),
            ``,
            `TECHNICAL TALKING POINTS:`,
            ...(interview.technicalQuestions || []).slice(0, 3).map(q => `Q: ${q.question}`),
            ``,
            `PREPARATION ROADMAP:`,
            ...(interview.preparationPlan || []).map(p => `Day ${p.day}: ${p.focus}`)
        ]

        const pdfBuffer = createSimplePdf(lines)

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename="resume_${id}.pdf"`)
        return res.send(pdfBuffer)
    } catch (error) {
        console.error("Error generating resume PDF:", error)
        res.status(500).json({
            success: false,
            message: "Failed to generate resume PDF",
            error: error.message
        })
    }
}

module.exports = {
    generateInterviewQuestions,
    getInterviewById,
    getAllInterview,
    generateResumePdfController
}