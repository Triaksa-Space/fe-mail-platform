"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { CircleX, Download } from 'lucide-react'
import FooterAdminNav from '@/components/FooterAdminNav'
import { useAuthStore } from '@/stores/useAuthStore'

export default function UserDetail() {
  const router = useRouter()
  const userEmail = useAuthStore((state) => state.email)
  const searchParams = useSearchParams()
  const email = JSON.parse(searchParams.get('email'))

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        <div className="flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 [&_svg]:size-5"
              onClick={() => router.back()}
            >
              <CircleX className="h-12 w-12" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {userEmail}
          </div>
        </div>

        <div className="space-y-2 text-xs p-1">
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-gray-500">From</span>
            <span className="font-medium">{email.SenderName} - {email.SenderEmail}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-gray-500">Subject</span>
            <span className="font-medium">{email.Subject}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="font-medium">{email.RelativeTime}</span>
          </div>
        </div>

        <div className="border rounded-lg p-2 text-sm">
          <div dangerouslySetInnerHTML={{ __html: email.Body }} />
        </div>

        {email.Attachments && email.Attachments.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Attachments</h3>
            <div className="space-y-2">
              {email.Attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span>{attachment.Name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(attachment.URL, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <FooterAdminNav />
    </div>
  )
}