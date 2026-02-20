import { getJudge0LangiageId, pollBatchResults, submitBatch } from "@/lib/judge0";
import { currentUserRole, getCurrentUser } from "@/modules/auth/actions";
import { currentUserRole } from "@/modules/auth/actions";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST(request) {
    try {

        const userRole = await currentUserRole()
        const user = await getCurrentUser()
        
        if (userRole !== UserRole.ADMIN) {
            return NextResponse.json({error:"Unathorized"}, {status:401})
        }

        const body = await request.json()

        const {title,
            description,
            difficulty,
            tags,
            examples,
            constraints,
            testCases,
            codeSnippets,
            referenceSolutions
        } = body

        if (!title || !description || !difficulty || !testCases || !codeSnippets || !referenceSolutions) {
            return NextResponse.json(
                {error: "Missing required fields"},
                {status: 400}
            )
        }

        if (!Array.isArray(testCases) || testCases.length ===0 ) {
            return NextResponse.json(
                {error: "At least one test case is required"},
                {status: 400}
            )
        }
        if (!referenceSolutions || typeof referenceSolutions !== "object") {
            return NextResponse.json(
                {error: "Reference solutions must be provided for all supported languages"},
                {status: 400}
            )
        }
        for(const [language, solutionsCode] of Object.entries(referenceSolutions)) {
            //Get Judge0 Language ID for the current language
            const languageId =  getJudge0LangiageId(language)
            if (!languageId) {
                return NextResponse.json(
                    {error: `Unsupported language: ${language}`},
                    {status: 400}
                )
            }
            //Prepare the judge0 submission for all the test cases
            const submission = testCases.map((input, output) =>({
                source_code: solutionsCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))

            //submit all test cases in one batch

        }
        
        const submissionResults = await submitBatch(submission)
        const tokens = submissionResults.map((res) =>res.token)

        const results = await pollBatchResults(tokens)

        for (let i=0 ; i <results.length; i++){
            const result = results[i]
            if (result.status.id !== 3) {
                return NextResponse.json(
                    {
                        error: `Validation failed for ${language}`,
                        testCases :{
                            input : submission[i].stdin,
                            expectedOutput: submission[i].expected_output,
                            actualOutput: result.stdout,
                            error: result.stderr || result.compile_output
                        },
                        details: result
                    },
                    {status: 400}
                )
            }
        }
        //step 3- save the problem to db
        const newProblem = await db.problem.create({
            data:{
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testCases,
                codeSnippets,
                referenceSolutions,
                userId: user.id,
            }
        })


        return NextResponse.json({
            success: true,
            message: "Problem created successfully",
            data: newProblem
        }, {status: 201})
     } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json(
            {error: "Failed to save problem to database"},
            {status: 500}
        )
        
        
    }
    
}