import { Chip } from '@nextui-org/react'
import type { RepairStatus } from '@/types'
import { FRENCH_LABELS } from '@/utils/constants'

interface RepairStatusBadgeProps {
  status: RepairStatus
  size?: 'sm' | 'md' | 'lg'
}

function getStatusColor(status: RepairStatus): 'default' | 'warning' | 'primary' | 'success' {
  switch (status) {
    case 'scheduled':
      return 'default'
    case 'in_progress':
      return 'primary'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'warning'
    default:
      return 'default'
  }
}

function getStatusLabel(status: RepairStatus): string {
  switch (status) {
    case 'scheduled':
      return FRENCH_LABELS.scheduled
    case 'in_progress':
      return FRENCH_LABELS.inProgress
    case 'completed':
      return FRENCH_LABELS.completed
    case 'cancelled':
      return FRENCH_LABELS.cancelled
    default:
      return status
  }
}

export function RepairStatusBadge({ status, size = 'sm' }: RepairStatusBadgeProps) {
  return (
    <Chip color={getStatusColor(status)} size={size} variant="flat">
      {getStatusLabel(status)}
    </Chip>
  )
}
