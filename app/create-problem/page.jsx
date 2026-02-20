import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { currentUserRole } from "@/modules/auth/actions"
import CreateProblemForm from "@/modules/problems/components/create-problem-form"
//import { currentUser } from "@clerk/nextjs/dist/types/server"
import { currentUser } from '@clerk/nextjs/server'
import { UserRole } from "@prisma/client"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/dist/server/api-utils"
import Link from "next/link"
import React from "react"

const createProblemPage = async() => {
    const user = await currentUser()
    const userRole = await currentUserRole()

    // if (!userRole !== UserRole.ADMIN) {
    //     return redirect("/")
    // }
  return (
    <section className="flex flex-col items-center justify-center container mx-4 my-4">
        <div className="flex flex-row justify-between items-center w-full">
            <h1 className="text-2xl font-bold">Create Probelm</h1>
            <Link href={"/"}>
            <Button variant={"outline"} size ={"icon"}>
                <ArrowLeft className="size-4"/>
            </Button>
            </Link>
            <h1 className="text-3xl font-bold text-amber-400">
               Welcome {user?.firstName}! Create a Problem
             
            </h1>
              <ModeToggle/>
        </div>
        <CreateProblemForm/>
    </section>
  )
}

export default createProblemPage