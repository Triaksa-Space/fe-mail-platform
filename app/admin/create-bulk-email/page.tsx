"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import FooterAdminNav from "@/components/FooterAdminNav"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuthStore } from "@/stores/useAuthStore"
import axios from 'axios'

interface EmailForm {
  email: string
}

export default function CreateBulkEmail() {
  const [count, setCount] = useState(2)
  const [forms, setForms] = useState<EmailForm[]>([])
  const [password, setPassword] = useState("")
  const [baseName, setBaseName] = useState("")
  const [firstNames, setFirstNames] = useState<string[]>([])
  const [lastNames, setLastNames] = useState<string[]>([])
  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)
  const [receiveEmail, setReceiveEmail] = useState("");

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const response = await fetch("/names.csv")
        const csvText = await response.text()
        const { firstNames, lastNames } = parseCSV(csvText)
        setFirstNames(firstNames)
        setLastNames(lastNames)
      } catch (error) {
        console.error("Failed to fetch names:", error)
      }
    }

    fetchNames()
  }, [])

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split("\n")
    const firstNames: string[] = []
    const lastNames: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const [firstName, lastName] = lines[i].split(",")
      firstNames.push(firstName.trim())
      lastNames.push(lastName.trim())
    }

    return { firstNames, lastNames }
  }

  const updateCount = (newCount: number) => {
    if (newCount >= 2 && newCount <= 100) {
      setCount(newCount)
    }
  }

  const generateRandomNames = (method: string) => {
    let newForms: EmailForm[] = []
    const usedNames = new Set<string>()
    for (let i = 0; i < count; i++) {
      let emailName = ""
      if (method === 'randomName') {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        emailName = `${firstName}.${lastName}`.toLowerCase()
      } else if (method === 'nameWithNumeric') {
        emailName = `${baseName}${i + 1}`
      }
      // Ensure uniqueness
      while (usedNames.has(emailName)) {
        emailName += Math.floor(Math.random() * 1000)
      }
      usedNames.add(emailName)
      newForms.push({ email: emailName })
    }
    setForms(newForms)
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
        className: "bg-red-500 text-white border-0",
      })
      return
    }
    try {
      const users = forms.map((form) => ({
        email: `${form.email}@mailria.com`,
        password: password,
      }))
      await axios.post(
        'http://localhost:8080/user/bulk',
        { users },
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
      setBaseName("");
      setPassword("");
      setForms([]);
      setReceiveEmail("");
    } catch (error) {
      let errorMessage = "Failed to create users. Please try again.";
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
    <>
      <div className="min-h-screen bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
          </div>
        </div>

        <div className="max-w-md mx-auto p-6">
          <h2 className="text-xl font-bold text-center mb-8">Create Bulk Email</h2>
          <Toaster />
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateCount(count - 1)}
              disabled={count <= 2}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500">
              {count} accounts
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateCount(count + 1)}
              disabled={count >= 100}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-sm text-red-500 mb-6">
            Minimum 2, max 100
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                className="w-1/2"
                onClick={() => generateRandomNames('randomName')}
              >
                Random Name from List
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-1/2"
                onClick={() => generateRandomNames('nameWithNumeric')}
              >
                Name + Unique Numeric
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                placeholder="Base name for numeric"
                className="flex-1 bg-gray-100"
              />
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password for all accounts"
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

            {forms.slice(0, 2).map((form, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={form.email}
                    readOnly
                    placeholder="Email"
                    className="flex-1"
                  />
                  <span className="text-lg">@</span>
                  <Input
                    value="mailria.com"
                    readOnly
                    className="flex-1 bg-gray-50"
                  />
                </div>
              </div>
            ))}

            {count > 2 && (
              <p className="text-center text-sm text-gray-500">
                and {count - 2} more accounts...
              </p>
            )}

<div>
              <label className="block text-sm font-medium text-gray-700">
                Email for receiving list
              </label>
              <Input
                type="email"
                value={receiveEmail}
                onChange={(e) => setReceiveEmail(e.target.value)}
                placeholder="youremail@example.com"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-400 hover:bg-yellow-300 text-black"
              disabled={!receiveEmail || !password}
            >
              Create
            </Button>
          </form>
        </div>
        <FooterAdminNav />
      </div>
    </>
  )
}