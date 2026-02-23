import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Domain {
  ID: number
  Domain: string
}

interface DomainSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function DomainSelector({ value, onChange, className }: DomainSelectorProps) {
  const [domains, setDomains] = useState<Domain[]>([])

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await apiClient.get("/domain/dropdown")
        const data: Domain[] = response.data
        setDomains(data)
        if (data.length > 0) {
          const currentValueExists = value && data.some(d => d.Domain === value)
          if (!currentValueExists) {
            onChange(data[0].Domain)
          }
        }
      } catch (error) {
        console.error('Failed to fetch domains:', error)
      }
    }

    fetchDomains()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedLabel = domains.find(d => d.Domain === value)?.Domain

  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className={className || "w-[180px]"}>
        {selectedLabel
          ? <span>{selectedLabel}</span>
          : <SelectValue placeholder="Select domain" />
        }
      </SelectTrigger>
      <SelectContent>
        {domains.map((domain) => (
          <SelectItem key={domain.ID} value={domain.Domain}>
            {domain.Domain}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}