"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      if (email === 'admin@mailria.com') {
        // Redirect to admin page
        router.push('/admin')
      } else {
        // Redirect to inbox after successful login
        router.push('/inbox')
      }
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen justify-between bg-white p-4 pt-8">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Where Simplicity Meets Speed.
          </h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                id="email" 
                name="email"
                placeholder="example@mailria.com" 
                required 
                type="email"
                className="pl-10 h-12 text-base border-gray-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                id="password" 
                name="password"
                placeholder="Input password"
                required 
                type="password"
                className="pl-10 h-12 text-base border-gray-200"
              />
            </div>
          </div>
          <Button 
            className="w-full h-12 text-base font-medium bg-[#F7D65D] hover:bg-[#F7D65D]/90 text-black"
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Login"}
          </Button>
        </form>
      </div>
      <div className="w-full max-w-sm mx-auto mb-2 space-y-4 p-4 text-left">
        <h2 className="text-l font-semibold">Looking for reliable email services?</h2>
        <p className="text-sm text-gray-600">
          Mailria has you covered! Drop us a message at{" "}
          <a href="mailto:support@mailria.com" className="text-blue-600 hover:underline">
            support@mailria.com
          </a>
          {" "}for more details.
        </p>
      </div>
    </div>
  )
}