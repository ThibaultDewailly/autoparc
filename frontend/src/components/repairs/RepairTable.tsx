import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Tooltip,
} from '@nextui-org/react'
import type { Repair } from '@/types'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'
import { RepairStatusBadge } from './RepairStatusBadge'
import { RepairTypeBadge } from './RepairTypeBadge'

interface RepairTableProps {
  repairs: Repair[]
  onDelete: (id: string) => void
  isLoading?: boolean
}

export function RepairTable({ repairs, onDelete, isLoading }: RepairTableProps) {
  const navigate = useNavigate()

  function handleView(id: string) {
    navigate(ROUTES.repairDetail(id))
  }

  function handleEdit(id: string) {
    navigate(ROUTES.repairEdit(id))
  }

  return (
    <Table aria-label="Table des réparations">
      <TableHeader>
        <TableColumn>{FRENCH_LABELS.vehicle}</TableColumn>
        <TableColumn>{FRENCH_LABELS.repairType}</TableColumn>
        <TableColumn>{FRENCH_LABELS.garage}</TableColumn>
        <TableColumn>{FRENCH_LABELS.startDate}</TableColumn>
        <TableColumn>{FRENCH_LABELS.endDate}</TableColumn>
        <TableColumn>{FRENCH_LABELS.cost}</TableColumn>
        <TableColumn>{FRENCH_LABELS.status}</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody
        items={repairs}
        isLoading={isLoading}
        emptyContent={FRENCH_LABELS.noRepairsFound}
      >
        {(repair) => (
          <TableRow key={repair.id}>
            <TableCell>
              <span className="font-mono">
                {repair.car?.licensePlate || repair.carId}
              </span>
            </TableCell>
            <TableCell>
              <RepairTypeBadge repairType={repair.repairType} />
            </TableCell>
            <TableCell>
              {repair.garage?.name || '-'}
            </TableCell>
            <TableCell>{formatDate(repair.startDate)}</TableCell>
            <TableCell>{repair.endDate ? formatDate(repair.endDate) : '-'}</TableCell>
            <TableCell>
              {repair.cost ? `${repair.cost.toFixed(2)} €` : '-'}
            </TableCell>
            <TableCell>
              <RepairStatusBadge status={repair.status} />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Tooltip content={FRENCH_LABELS.view} className="text-foreground">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => handleView(repair.id)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </Button>
                </Tooltip>
                <Tooltip content={FRENCH_LABELS.edit} className="text-foreground">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => handleEdit(repair.id)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Button>
                </Tooltip>
                <Tooltip content={FRENCH_LABELS.delete} className="text-foreground">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onClick={() => onDelete(repair.id)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
