import { Chip } from '@heroui/react'
import type { AccidentStatus } from '@/types'
import { FRENCH_LABELS } from '@/utils/constants'

interface AccidentStatusBadgeProps {
  status: AccidentStatus
  size?: 'sm' | 'md' | 'lg'
}

function getStatusColor(status: AccidentStatus): 'default' | 'primary' | 'warning' | 'success' {
  switch (status) {
    case 'declared':
      return 'warning'
    case 'under_review':
      return 'primary'
    case 'approved':
      return 'success'
    case 'closed':
      return 'default'
    default:
      return 'default'
  }
}

function getStatusLabel(status: AccidentStatus): string {
  switch (status) {
    case 'declared':
      return FRENCH_LABELS.declared
    case 'under_review':
      return FRENCH_LABELS.underReview
    case 'approved':
      return FRENCH_LABELS.approved
    case 'closed':
      return FRENCH_LABELS.closed
    default:
      return status
  }
}

export function AccidentStatusBadge({ status, size = 'sm' }: AccidentStatusBadgeProps) {
  return (
    <Chip color={getStatusColor(status)} size={size} variant="flat">
      {getStatusLabel(status)}
    </Chip>
  )
}
