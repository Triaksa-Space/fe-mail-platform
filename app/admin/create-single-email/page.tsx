'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FooterAdminNav from "@/components/FooterAdminNav"
import { useAuthStore } from "@/stores/useAuthStore";
import axios from 'axios'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import DomainSelector from "@/components/DomainSelector"
import LoadingProcessingPage from "@/components/ProcessLoading"
import { useRouter } from "next/navigation"

// interface Domain {
//   ID: number;
//   Domain: string;
// }

const CreateSingleEmail: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState("mailria.com")
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  // Move the token check to useEffect
  useEffect(() => {
    const storedToken = useAuthStore.getState().getStoredToken();
    if (!storedToken) {
      router.replace("/");
      return;
    }
  }, [router]);

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isRandomPasswordActive, setIsRandomPasswordActive] = useState(false);

  const toggleRandomPassword = () => {
    if (!isRandomPasswordActive) {
      generateRandomPassword();
      setIsRandomPasswordActive(true);
    } else {
      setPassword("");
      setIsRandomPasswordActive(false);
    }
  };

  const generateRandomPassword = () => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    const allChars = lower + upper + numbers + symbols;

    // Ensure at least one character from each category
    let password = "";
    password += lower.charAt(Math.floor(Math.random() * lower.length));
    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the remaining characters
    for (let i = 4; i < 8; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to randomize character positions
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    setPassword(password);
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
      // // Regular expression to ensure password complexity
      // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

      // if (!passwordRegex.test(password)) {
      //   toast({
      //     description: "Password must include a number, lowercase, uppercase, and symbol.",
      //     variant: "destructive",
      //   });
      //   return;
      // }
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
        variant: "default",
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
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex-1 overflow-auto pb-20">
        <div className="p-4 border-b flex items-center justify-between shadow appearance-non">
          <Toaster />
        </div>

        <div className="max-w-md mx-auto p-6">
          {/* <h2 className="text-xl font-bold text-center mb-8">Create Single Email</h2> */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2">
              <Input
                value={username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  setUsername(value.replace(/\s/g, '')); // Remove spaces
                  const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
                  setUsername(sanitizedValue);
                }}
                placeholder="Email"
                className="shadow appearance-non flex-1 h-12"
              />
              <span className="text-lg">@</span>
              <DomainSelector
                value={selectedDomain}
                onChange={(value) => setSelectedDomain(value)}
                className="shadow appearance-non w-[180px] h-12"
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
                className={isRandomPasswordActive ? "shadow appearance-non flex-1 h-12 bg-gray-300" : "shadow appearance-non flex-1 h-12"}
                disabled={isRandomPasswordActive}
              />
              <span className="text-lg text-white">@</span>
              <Button
                type="button"
                onClick={toggleRandomPassword}
                className={`shadow appearance-none w-[180px] h-12 font-bold text-black ${isRandomPasswordActive
                  ? "bg-yellow-300 hover:bg-yellow-400"
                  : "bg-[#ffeeac] hover:bg-yellow-300"
                  }`}
              >
                {isRandomPasswordActive ? "Random Password" : "Random Password"}
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                className={`shadow appearance-non h-11 w-3/4 max-w-xs font-bold  text-black ${!username || !password
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
        <LoadingProcessingPage />
      )}
      <FooterAdminNav />
    </div>
  )
}

export default CreateSingleEmail;