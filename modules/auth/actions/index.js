"use server"

import { db } from "@/lib/db"
import { currentUser } from  "@clerk/nextjs/server"


import { success } from "zod"


export const onBoardUser = async() => {
    try {
        const user = await currentUser()

        if (!user) {
            return {success: false, error: "No authenticated user found"}
        }
        const {id, firstName, lastName, imageUrl, emailAddressess} = user

        const newUser = await db.user.upsert({
            where:{
                clerkId: id
            },
            update:{
                firstName: firstName || null,
                lastName: lastName || null,
                imageUrl: imageUrl || null,
                email: emailAddressess[0]?.emailAddressess || ""
            },
            create:{
                clerkId: id,
                firstName: firstName || null,
                lastName: lastName || null,
                imageUrl: imageUrl || null,
                email: emailAddressess[0]?.emailAddressess || ""

            }
        })
        return {
            success: true,
            user: newUser,
            messaage: "User onBoarded Successfully"
        }
    } catch (error) {
        console.error(" ❌  Error Onboarding user:", error);
        return {
            success: false,
            error: "failed to onboard user"
        }
        
    }
}