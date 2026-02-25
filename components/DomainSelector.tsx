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
  value?: string
  onChange: (value: string) => void
  className?: string
  defaultIndex?: number
  selectedIndex?: number
}

export default function DomainSelector({
  value,
  onChange,
  className,
  defaultIndex = 0,
  selectedIndex,
}: DomainSelectorProps) {
  const [domains, setDomains] = useState<Domain[]>([])

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await apiClient.get("/domain/dropdown")
        const data: Domain[] = Array.isArray(response.data) ? response.data : []
        setDomains(data)
      } catch (error) {
        console.error('Failed to fetch domains:', error)
      }
    }
    fetchDomains()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (domains.length === 0) return

    // Backward-compat: if caller still passes index as string ("0", "1"), map it.
    if (value && /^\d+$/.test(value)) {
      const fromValueIndex = domains[Number(value)]?.Domain
      if (fromValueIndex && fromValueIndex !== value) {
        onChange(fromValueIndex)
      }
      return
    }

    if (typeof selectedIndex === "number") {
      const selectedDomainByIndex = domains[selectedIndex]?.Domain
      if (selectedDomainByIndex && selectedDomainByIndex !== value) {
        onChange(selectedDomainByIndex)
      }
      return
    }

    if (!value) {
      const defaultDomain = domains[defaultIndex]?.Domain ?? domains[0]?.Domain
      if (defaultDomain) {
        onChange(defaultDomain)
      }
    }
  }, [domains, value, selectedIndex, defaultIndex, onChange])

  return (
    <Select
      value={value || undefined}
      onValueChange={onChange}
    >
      <SelectTrigger className={className || "w-[180px]"}>
        <SelectValue placeholder="Select domain" />
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
