import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
      <div className="backdrop-blur-lg bg-white/20 border-4 border-yellow-400 rounded-3xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-6 relative"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', borderImage: 'linear-gradient(45deg, #FFD700, #FF69B4) 1' }}>
        <h1 className="text-3xl font-extrabold text-white text-center mb-2 drop-shadow-lg font-mono tracking-widest">Login</h1>
        <form className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-lg text-yellow-200 font-bold font-mono drop-shadow">Email:</Label>
            <Input type="email" id="email" name="email" required className="rounded-lg border-2 border-pink-400 bg-white/40 text-purple-700 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md transition-all duration-200" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-lg text-yellow-200 font-bold font-mono drop-shadow">Password:</Label>
            <Input type="password" id="password" name="password" required className="rounded-lg border-2 border-pink-400 bg-white/40 text-purple-700 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md transition-all duration-200" />
          </div>
          <Button type="submit" className="cursor-pointer mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white font-extrabold text-xl shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-transform duration-150 font-mono tracking-widest">Login</Button>
        </form>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-pink-400 border-4 border-yellow-300 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl font-extrabold text-yellow-200 drop-shadow-lg">♥</span>
        </div>
      </div>
    </div>
  )
}

export default page
