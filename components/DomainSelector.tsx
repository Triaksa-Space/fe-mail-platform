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
  const [effectiveValue, setEffectiveValue] = useState(value)

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await apiClient.get("/domain/dropdown")
        const data: Domain[] = response.data
        setDomains(data)
        if (data.length > 0) {
          const currentValueExists = effectiveValue && data.some(d => d.Domain === effectiveValue)
          if (!currentValueExists) {
            setEffectiveValue(data[0].Domain)
            onChange(data[0].Domain)
          }
        }
      } catch (error) {
        console.error('Failed to fetch domains:', error)
      }
    }

    fetchDomains()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setEffectiveValue(value)
  }, [value])

  const selectedLabel = domains.find(d => d.Domain === effectiveValue)?.Domain

  return (
    <Select
      value={effectiveValue}
      onValueChange={(v) => {
        setEffectiveValue(v)
        onChange(v)
      }}
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
