'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FooterAdminNav from "@/components/FooterAdminNav"
import { useAuthStore } from "@/stores/useAuthStore";
import axios from 'axios'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import DomainSelector from "@/components/DomainSelector"
import withAuth from "@/components/hoc/withAuth";

// interface Domain {
//   ID: number;
//   Domain: string;
// }

const CreateSingleEmail: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState("")
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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/`,
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
        <Toaster />
      </div>

      <div className="max-w-md mx-auto p-6">
        {/* <h2 className="text-xl font-bold text-center mb-8">Create Single Email</h2> */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yono"
              className="flex-1 h-12"
            />
            <span className="text-lg">@</span>
            <DomainSelector
              value={selectedDomain}
              onChange={setSelectedDomain}
              className="w-[180px] h-12"
            />
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="!@#DF3"
              className="h-12 flex-1 bg-gray-100"
            />
            <Button
                type="button"
                onClick={generateRandomPassword}
                className="h-12 font-bold bg-[#ffeeac] hover:bg-yellow-300 border border-black/20 text-black"
              >
                Random Password
              </Button>
          </div>

          <Button
              type="submit"
              className={`h-12 w-full font-bold border border-black/20 text-black ${!username || !password
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-300 hover:bg-yellow-300"
                }`}
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

export default withAuth(CreateSingleEmail);