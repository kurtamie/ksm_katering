import { LoginForm } from '@/components/auth/login-form'
import React from 'react'
import Imgauth from "../../asset/login.svg"

function page() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <img
          src={Imgauth.src}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover object-top dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
