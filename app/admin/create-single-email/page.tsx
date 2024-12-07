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
import LoadingProcessingPage from "@/components/ProcessLoading"

// interface Domain {
//   ID: number;
//   Domain: string;
// }

const CreateSingleEmail: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState("mailria.com")
  const token = useAuthStore((state) => state.token);
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

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
      if (password.length < 6) {
        toast({
          description: "Password must be at least 6 characters long. Please try again.",
          variant: "destructive",
        })
        return
      }
      setIsLoading(true)
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/`,
        {
          email: `${username}@${selectedDomain}`,
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
        description: `email: ${username}@${selectedDomain} password: ${password} successfully created!`,
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex-1 overflow-auto pb-20">
        <div className="p-4 border-b flex items-center justify-between">
          <Toaster />
        </div>

        <div className="max-w-md mx-auto p-6">
          {/* <h2 className="text-xl font-bold text-center mb-8">Create Single Email</h2> */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2">
              <Input
                value={username}
                onChange={(e) => {
                  const value = e.target.value;
                  setUsername(value.replace(/\s/g, '')); // Remove spaces
                }}
                placeholder="Email"
                className="flex-1 h-12"
              />
              <span className="text-lg">@</span>
              <DomainSelector
                value={selectedDomain}
                onChange={(value) => setSelectedDomain(value)}
                className="w-[180px] h-12"
              />
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value.replace(/\s/g, '')); // Remove spaces
                }}
                placeholder="Password"
                className="flex-1 h-12"
              />
              <Button
                type="button"
                onClick={generateRandomPassword}
                className="w-[180px] h-12 font-bold bg-[#ffeeac] hover:bg-yellow-300  text-black "
              >
                Random Password
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                className={`h-11 w-3/4 max-w-xs font-bold  text-black ${!username || !password
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#ffeeac] hover:bg-yellow-300"
                  }`}
                disabled={!username || !password}
              >
                Create
              </Button>
            </div>
          </form>
        </div>
      </div>
      {isLoading && (
        <LoadingProcessingPage/>
      )}
      <FooterAdminNav />
    </div>
  )
}

export default withAuth(CreateSingleEmail);