import { Card, CardBody, Chip } from '@nextui-org/react'
import type { Employee } from '@/types'
import { FRENCH_LABELS } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'

interface EmployeeDetailProps {
  employee: Employee
  onEdit: () => void
  onDelete: () => void
  onChangePassword: () => void
}

export function EmployeeDetail({ employee, onEdit, onDelete, onChangePassword }: EmployeeDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {employee.firstName} {employee.lastName}
            </h2>
            <Chip
              color={employee.isActive ? 'success' : 'default'}
              variant="flat"
            >
              {employee.isActive ? FRENCH_LABELS.active : FRENCH_LABELS.inactive}
            </Chip>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">{FRENCH_LABELS.email}</p>
              <p className="font-medium">{employee.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">{FRENCH_LABELS.role}</p>
              <p className="font-medium capitalize">{employee.role}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">{FRENCH_LABELS.createdAt}</p>
              <p className="font-medium">{formatDate(employee.createdAt)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">{FRENCH_LABELS.updatedAt}</p>
              <p className="font-medium">{formatDate(employee.updatedAt)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">{FRENCH_LABELS.lastLogin}</p>
              <p className="font-medium">
                {employee.lastLoginAt ? formatDate(employee.lastLoginAt) : 'Jamais'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {FRENCH_LABELS.edit}
            </button>
            <button
              onClick={onChangePassword}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              {FRENCH_LABELS.changePassword}
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {FRENCH_LABELS.delete}
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
