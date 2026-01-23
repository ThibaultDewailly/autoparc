import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Tooltip,
} from '@nextui-org/react'
import type { Car, CarStatus } from '@/types'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'

interface CarTableProps {
  cars: Car[]
  onDelete: (id: string) => void
  isLoading?: boolean
}

function getStatusColor(status: CarStatus): 'success' | 'warning' | 'default' {
  switch (status) {
    case 'active':
      return 'success'
    case 'maintenance':
      return 'warning'
    case 'retired':
      return 'default'
    default:
      return 'default'
  }
}

function getStatusLabel(status: CarStatus): string {
  switch (status) {
    case 'active':
      return FRENCH_LABELS.active
    case 'maintenance':
      return FRENCH_LABELS.maintenance
    case 'retired':
      return FRENCH_LABELS.retired
    default:
      return status
  }
}

export function CarTable({ cars, onDelete, isLoading }: CarTableProps) {
  const navigate = useNavigate()

  function handleView(id: string) {
    navigate(ROUTES.carDetail(id))
  }

  function handleEdit(id: string) {
    navigate(ROUTES.carEdit(id))
  }

  return (
    <Table aria-label="Table des véhicules">
      <TableHeader>
        <TableColumn>{FRENCH_LABELS.licensePlate}</TableColumn>
        <TableColumn>{FRENCH_LABELS.brand}</TableColumn>
        <TableColumn>{FRENCH_LABELS.model}</TableColumn>
        <TableColumn>{FRENCH_LABELS.status}</TableColumn>
        <TableColumn>{FRENCH_LABELS.rentalStartDate}</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody
        items={cars}
        isLoading={isLoading}
        emptyContent={FRENCH_LABELS.noCarsFound}
      >
        {(car) => (
          <TableRow key={car.id}>
            <TableCell>
              <span className="font-mono">{car.license_plate}</span>
            </TableCell>
            <TableCell>{car.brand}</TableCell>
            <TableCell>{car.model}</TableCell>
            <TableCell>
              <Chip color={getStatusColor(car.status)} size="sm" variant="flat">
                {getStatusLabel(car.status)}
              </Chip>
            </TableCell>
            <TableCell>{formatDate(car.rental_start_date)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Tooltip content={FRENCH_LABELS.view}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => handleView(car.id)}
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
                <Tooltip content={FRENCH_LABELS.edit}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="primary"
                    onClick={() => handleEdit(car.id)}
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
                <Tooltip content={FRENCH_LABELS.delete}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onClick={() => onDelete(car.id)}
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
