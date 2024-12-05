'use client'

import { useState } from "react"
import { Minus, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FooterAdminNav from "@/components/FooterAdminNav"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuthStore } from "@/stores/useAuthStore"
import axios from 'axios'
import withAuth from "@/components/hoc/withAuth";
import DomainSelector from "@/components/DomainSelector"

const CreateBulkEmail: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState("mailria.com")
  const [count, setCount] = useState(2)
  const [password, setPassword] = useState("")
  const [baseName, setBaseName] = useState("")
  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)
  const [receiveEmail, setReceiveEmail] = useState("")
  const [isRandom, setIsRandom] = useState(false)

  const updateCount = (newCount: number) => {
    if (newCount >= 2 && newCount <= 100) {
      setCount(newCount)
    }
  }

  const generateRandomNames = () => {
    setIsRandom(true)
  }

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let randomPassword = ""
    for (let i = 0; i < 8; i++) {
      randomPassword += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(randomPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      toast({
        description: "Please provide a password.",
        variant: "destructive",
      })
      return
    }
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/bulk`,
        {
          base_name: baseName || "random",
          quantity: count,
          password: password,
          send_to: receiveEmail,
          domain: selectedDomain
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast({
        description: `Successfully created ${count} accounts.`,
        className: "bg-green-500 text-white border-0",
      })
      // Reset the form
      setBaseName("")
      setPassword("")
      setReceiveEmail("")
      setIsRandom(false)
    } catch (error) {
      let errorMessage = "Failed to create users. Please try again."
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      toast({
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white">
      <div className="flex-1 overflow-auto pb-20">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <h2 className="text-xl font-bold text-center mb-8">Create Bulk Email</h2> */}
          </div>
        </div>
        <div className="max-w-xl mx-auto p-6 space-y-6">
          <Toaster />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="bg-[#ffeeac] font-bold hover:bg-yellow-300 border border-black/20 h-12 px-4 flex-1"
                onClick={generateRandomNames}
              >
                Random Name
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-12 rounded-none border-black/20"
                  onClick={() => updateCount(count - 1)}
                  disabled={count <= 2}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => updateCount(parseInt(e.target.value))}
                  className="w-32 h-12 text-center border-black/20"
                  min={2}
                  max={100}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-12 rounded-none border-black/20"
                  onClick={() => updateCount(count + 1)}
                  disabled={count >= 100}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-center text-sm text-red-500">
              Minimum 2, max 100
            </p>

            <div className="flex items-center gap-4">
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="flex-1 h-12 border-black/20"
              />
              <Button
                type="button"
                onClick={generateRandomPassword}
                className="h-12 font-bold bg-[#ffeeac] hover:bg-yellow-300 border border-black/20 text-black"
              >
                Random Password
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={isRandom ? "random" : baseName}
                placeholder="Base Name"
                className="flex-1 h-12 border-black/20"
                onChange={(e) => setBaseName(e.target.value)}
                disabled={isRandom}
              />
              <span className="text-lg">@</span>
              <DomainSelector
                value={selectedDomain}
                onChange={(value) => setSelectedDomain(value)}
                className="w-[180px]"
              />
            </div>

            <Input
              type="email"
              value={receiveEmail}
              onChange={(e) => setReceiveEmail(e.target.value)}
              placeholder="Email for receiving list"
              className="h-12 border-black/20"
            />

            <Button
              type="submit"
              className={`h-12 w-full font-bold border border-black/20 text-black ${!receiveEmail || !password
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-300 hover:bg-yellow-300"
                }`}
              disabled={!receiveEmail || !password}
            >
              Create
            </Button>
          </form>
        </div>
        </div>
        <FooterAdminNav />
      </div>
    </>
  )
}

export default withAuth(CreateBulkEmail)