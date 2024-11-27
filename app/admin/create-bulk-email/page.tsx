"use client"

import { useState } from "react"
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DropdownMenuComponent from "@/components/DropdownMenuComponent"

interface EmailForm {
  email: string;
  password: string;
}

export default function CreateBulkEmail() {
  const [count, setCount] = useState(2)
  const [forms, setForms] = useState<EmailForm[]>([
    { email: '', password: '' },
    { email: '', password: '' }
  ])

  const updateCount = (newCount: number) => {
    if (newCount >= 2 && newCount <= 100) {
      setCount(newCount)
      if (newCount > forms.length) {
        setForms([...forms, ...Array(newCount - forms.length).fill({ email: '', password: '' })])
      } else {
        setForms(forms.slice(0, newCount))
      }
    }
  }

  const generateRandomName = (isHuman: boolean) => {
    const humanNames = ["John", "Jane", "Mike", "Sarah", "David", "Emma"]
    const randomNames = ["user", "mail", "box", "inbox", "contact"]
    
    const base = isHuman ? 
      humanNames[Math.floor(Math.random() * humanNames.length)] :
      randomNames[Math.floor(Math.random() * randomNames.length)]
    
    return base + Math.floor(Math.random() * 1000)
  }

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
        <h2 className="text-2xl font-bold text-center mb-8">Create Bulk Email</h2>
        
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
          <div className="flex gap-2">
            <div 
              onClick={() => {
                setForms(forms.map(form => ({
                  ...form,
                  email: generateRandomName(true)
                })))
              }}
              className="flex-1 cursor-pointer border border-gray-300 rounded p-2 text-center"
            >
              Random Human Name
            </div>
            <div 
              onClick={() => {
                setForms(forms.map(form => ({
                  ...form,
                  email: generateRandomName(false)
                })))
              }}
              className="flex-1 cursor-pointer border border-gray-300 rounded p-2 text-center"
            >
              Random Name
            </div>
          </div>

          {forms.map((form, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={form.email}
                  onChange={(e) => {
                    const newForms = [...forms]
                    newForms[index].email = e.target.value
                    setForms(newForms)
                  }}
                  placeholder="Email"
                  className="flex-1"
                />
                <span className="text-lg">@</span>
                <Select defaultValue="mailria.com">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mailria.com">mailria.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={form.password}
                  onChange={(e) => {
                    const newForms = [...forms]
                    newForms[index].password = e.target.value
                    setForms(newForms)
                  }}
                  placeholder="Password"
                  className="flex-1"
                />
                <div 
                  onClick={() => {
                    const newForms = [...forms]
                    newForms[index].password = generateRandomPassword()
                    setForms(newForms)
                  }}
                  className="cursor-pointer border border-gray-300 rounded p-2 text-center"
                >
                  Random
                </div>
              </div>
            </div>
          ))}

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