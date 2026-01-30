import { Select, SelectItem } from '@heroui/react'
import { CAR_STATUSES, FRENCH_LABELS } from '@/utils/constants'
import type { CarStatus } from '@/types'

interface FilterPanelProps {
  status?: CarStatus
  onStatusChange: (status: CarStatus | undefined) => void
}

export function FilterPanel({ status, onStatusChange }: FilterPanelProps) {
  function handleStatusChange(value: string) {
    if (value === '') {
      onStatusChange(undefined)
    } else {
      onStatusChange(value as CarStatus)
    }
  }

  return (
    <div className="flex gap-4 items-end">
      <Select
        label={FRENCH_LABELS.status}
        placeholder={FRENCH_LABELS.allStatuses}
        selectedKeys={status ? [status] : []}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="max-w-xs"
      >
        {CAR_STATUSES.map((item) => (
          <SelectItem key={item.value} className="text-foreground">
            {item.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}
