const { GoogleGenAI } = require("@google/genai")
const z = require("zod")


const ai = new GoogleGenAI({
    apiKey: process.env["GOOGLE_API_KEY"]
})

const jsonSchema = z.object({
    title: z.string().describe("A professional, concise job title for the role being targeted (e.g., 'Senior Full Stack Engineer', 'Backend Node.js Developer')."),
    matchScore: z.number().min(0).max(100).describe("Overall candidate match and readiness score from 0 to 100 based on technical depth, relevant experience, and alignment between the candidate profile and job requirements."),
    skillGaps: z.array(
        z.object({
            skill: z.string().describe("Specific skill, technology, or domain area requiring improvement or practice (e.g., 'System Design at Scale', 'Docker & Kubernetes', 'PostgreSQL Query Optimization')."),
            severity: z.enum(['low', 'medium', 'high']).describe("Priority or gap level: 'high' for critical job prerequisites, 'medium' for important competencies, 'low' for nice-to-have capabilities.")
        })
    ).describe("Key skill gaps identified between the candidate's profile and the target job description."),

    technicalQuestions: z.array(
        z.object({
            question: z.string().describe("In-depth, realistic technical interview question testing concepts, architecture, or coding practices essential for this role."),
            intention: z.string().describe("What the interviewer is specifically evaluating (e.g., understanding of concurrency, caching, data structures, trade-offs)."),
            answer: z.string().describe("Comprehensive, exemplary model response explaining best practices, implementation considerations, and trade-offs.")
        })
    ).describe("Targeted technical interview questions tailored to the candidate and role."),

    behavioralQuestions: z.array(
        z.object({
            question: z.string().describe("Contextual behavioral question framed around the STAR methodology assessing past experience, leadership, communication, or conflict resolution."),
            intention: z.string().describe("Core behavioral competency being evaluated (e.g., cross-functional leadership, ownership under tight deadlines, adaptability)."),
            answer: z.string().describe("Structured model answer following the STAR framework (Situation, Task, Action, Result).")
        })
    ).describe("Targeted behavioral questions evaluating communication and cultural alignment."),

    preparationPlan: z.array(
        z.object({
            day: z.number().describe("Day number of the preparation plan (e.g., 1, 2, 3, 4, 5, 6, 7)."),
            focus: z.string().describe("Primary topic or core theme for this day (e.g., 'Core Architecture & System Design', 'Hands-on Coding & Algorithms', 'Behavioral & Scenario Drills')."),
            tasks: z.array(z.string()).describe("List of concrete, actionable study tasks, coding exercises, or review checklists for this day.")
        })
    ).describe("Structured day-by-day interview preparation roadmap (e.g., 5 to 7 days).")
})

async function generateContent(resume, jobDescription, selfDescription) {
    const prompt = `You are an expert technical interviewer, talent assessor, and career coach.
Analyze the candidate's background against the target job requirements to generate a complete, structured interview preparation strategy.

[Target Job Description]
${jobDescription || "Not provided"}

[Candidate Self Description]
${selfDescription || "Not provided"}

[Candidate Resume]
${resume || "Not provided"}`;

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: z.toJSONSchema(jsonSchema)
        }
    });

    console.log(result.text)
    return result.text
}


module.exports = { generateContent }