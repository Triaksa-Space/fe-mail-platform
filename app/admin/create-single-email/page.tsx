"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FooterAdminNav from "@/components/FooterAdminNav"
import { useAuthStore } from "@/stores/useAuthStore";
import axios from 'axios'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function CreateSingleEmail() {
  const token = useAuthStore((state) => state.token);
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        'http://localhost:8080/user/',
        {
          email: `${username}@mailria.com`,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // Show success toast
      toast({
        description: `email: ${username}@mailria.com password: ${password} successfully created!`,
        className: "bg-green-500 text-white border-0",
      })
      setUsername("")
      setPassword("")
    } catch (error) {
      let errorMessage = "Failed to create user. Please try again.";
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      toast({
        description: errorMessage,
        className: "bg-red-500 text-white border-0",
      });
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        {/* <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <Button variant="ghost" size="icon">
        <DropdownMenuComponent />
        </Button> */}
        <Toaster />
      </div>

      <div className="max-w-md mx-auto p-6">
        <h2 className="text-xl font-bold text-center mb-8">Create Single Email</h2>
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
              Random Password
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-gray-400 hover:bg-yellow-300 text-black"
            disabled={!username || !password}
          >
            Create
          </Button>
        </form>
      </div>
      <FooterAdminNav />
    </div>
  )
}

