"use client"

import { useState } from "react"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import DropdownMenuComponent from "@/components/DropdownMenuComponent"

export default function CreateSingleEmail() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(password)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Submitted:', username, password)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <Button variant="ghost" size="icon">
        <DropdownMenuComponent />
        </Button>
      </div>

      <div className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-center mb-8">Create Single Email</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yono"
              className="flex-1"
            />
            <span className="text-lg">@</span>
            <Input
              value="mailria.com"
              readOnly
              className="flex-1 bg-gray-50"
            />
          </div>
          
          <div className="flex gap-2">
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="!@#DF3"
              className="flex-1 bg-gray-100"
            />
            <Button 
              type="button"
              onClick={generateRandomPassword}
              className="bg-[#4ADE80] hover:bg-[#4ADE80]/90 text-black"
            >
              Random
            </Button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gray-700 hover:bg-gray-800 text-white"
          >
            SUBMIT
          </Button>
        </form>
      </div>
    </div>
  )
}

