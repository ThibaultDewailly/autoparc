import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@nextui-org/react'
import type { CarOperatorAssignment } from '@/types/operator'
import { FRENCH_LABELS } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'

interface AssignmentHistoryTableProps {
  assignments: CarOperatorAssignment[]
  showOperator?: boolean
  showCar?: boolean
  isLoading?: boolean
}

function calculateDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  if (days < 30) {
    return `${days} jours`
  } else if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} mois`
  } else {
    const years = Math.floor(days / 365)
    const remainingMonths = Math.floor((days % 365) / 30)
    if (remainingMonths > 0) {
      return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`
    }
    return `${years} an${years > 1 ? 's' : ''}`
  }
}

export function AssignmentHistoryTable({
  assignments,
  isLoading,
}: AssignmentHistoryTableProps) {
  return (
    <Table aria-label="Historique d'attributions">
      <TableHeader>
        <TableColumn>{FRENCH_LABELS.startDate}</TableColumn>
        <TableColumn>{FRENCH_LABELS.endDate}</TableColumn>
        <TableColumn>Durée</TableColumn>
        <TableColumn>{FRENCH_LABELS.status}</TableColumn>
        <TableColumn>{FRENCH_LABELS.notes}</TableColumn>
      </TableHeader>
      <TableBody
        items={assignments}
        isLoading={isLoading}
        emptyContent="Aucun historique d'attribution"
      >
        {(assignment) => (
          <TableRow
            key={assignment.id}
            className={!assignment.end_date ? 'bg-blue-50' : ''}
          >
            <TableCell>{formatDate(assignment.start_date)}</TableCell>
            <TableCell>
              {assignment.end_date ? formatDate(assignment.end_date) : (
                <Chip color="primary" size="sm" variant="flat">
                  En cours
                </Chip>
              )}
            </TableCell>
            <TableCell>
              {calculateDuration(assignment.start_date, assignment.end_date)}
            </TableCell>
            <TableCell>
              <Chip
                color={!assignment.end_date ? 'success' : 'default'}
                size="sm"
                variant="flat"
              >
                {!assignment.end_date ? 'Active' : 'Terminée'}
              </Chip>
            </TableCell>
            <TableCell>
              <span className="text-sm text-gray-600">
                {assignment.notes || '-'}
              </span>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
