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
} from '@heroui/react'
import type { OperatorWithCurrentCar } from '@/types/operator'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'

interface OperatorTableProps {
  operators: OperatorWithCurrentCar[]
  onDelete: (id: string) => void
  isLoading?: boolean
}

export function OperatorTable({ operators, onDelete, isLoading }: OperatorTableProps) {
  const navigate = useNavigate()

  function handleView(id: string) {
    navigate(ROUTES.operatorDetail(id))
  }

  function handleEdit(id: string) {
    navigate(ROUTES.operatorEdit(id))
  }

  return (
    <Table aria-label="Table des opérateurs">
      <TableHeader>
        <TableColumn>{FRENCH_LABELS.employeeNumber}</TableColumn>
        <TableColumn>{FRENCH_LABELS.firstName}</TableColumn>
        <TableColumn>{FRENCH_LABELS.lastName}</TableColumn>
        <TableColumn>{FRENCH_LABELS.department}</TableColumn>
        <TableColumn>{FRENCH_LABELS.currentCar}</TableColumn>
        <TableColumn>{FRENCH_LABELS.status}</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody
        items={operators}
        isLoading={isLoading}
        emptyContent={FRENCH_LABELS.noOperatorsFound}
      >
        {(operator) => (
          <TableRow key={operator.id}>
            <TableCell>
              <span className="font-mono">{operator.employee_number}</span>
            </TableCell>
            <TableCell>{operator.first_name}</TableCell>
            <TableCell>{operator.last_name}</TableCell>
            <TableCell>{operator.department || '-'}</TableCell>
            <TableCell>
              {operator.current_car ? (
                <div className="flex flex-col">
                  <span className="font-mono text-sm">
                    {operator.current_car.license_plate}
                  </span>
                  <span className="text-xs text-gray-500">
                    {operator.current_car.brand} {operator.current_car.model}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell>
              <Chip 
                color={operator.is_active ? 'success' : 'default'} 
                size="sm" 
                variant="flat"
              >
                {operator.is_active ? FRENCH_LABELS.active : FRENCH_LABELS.inactive}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Tooltip content={FRENCH_LABELS.view} className="text-foreground">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => handleView(operator.id)}
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
                    color="primary"
                    onClick={() => handleEdit(operator.id)}
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
                    onClick={() => onDelete(operator.id)}
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
