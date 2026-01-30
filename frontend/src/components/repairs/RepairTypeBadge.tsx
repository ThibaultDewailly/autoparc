import { Chip } from '@heroui/react'
import type { RepairType } from '@/types'
import { FRENCH_LABELS } from '@/utils/constants'

interface RepairTypeBadgeProps {
  repairType: RepairType
  size?: 'sm' | 'md' | 'lg'
}

function getTypeColor(repairType: RepairType): 'danger' | 'primary' | 'secondary' {
  switch (repairType) {
    case 'accident':
      return 'danger'
    case 'maintenance':
      return 'primary'
    case 'inspection':
      return 'secondary'
    default:
      return 'primary'
  }
}

function getTypeLabel(repairType: RepairType): string {
  switch (repairType) {
    case 'accident':
      return FRENCH_LABELS.accident
    case 'maintenance':
      return FRENCH_LABELS.maintenanceRepair
    case 'inspection':
      return FRENCH_LABELS.inspection
    default:
      return repairType
  }
}

function getTypeIcon(repairType: RepairType): JSX.Element {
  switch (repairType) {
    case 'accident':
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
      )
    case 'maintenance':
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      )
    case 'inspection':
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      )
    default:
      return <></>
  }
}

export function RepairTypeBadge({ repairType, size = 'sm' }: RepairTypeBadgeProps) {
  return (
    <Chip 
      color={getTypeColor(repairType)} 
      size={size} 
      variant="flat"
      startContent={getTypeIcon(repairType)}
    >
      {getTypeLabel(repairType)}
    </Chip>
  )
}
