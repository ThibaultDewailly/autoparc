import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Chip,
  Divider,
} from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { AssignmentHistoryTable } from '@/components/operators/AssignmentHistoryTable'
import { useOperator, useDeleteOperator } from '@/hooks/useOperators'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'

export function OperatorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: operator, isLoading } = useOperator(id)
  const deleteMutation = useDeleteOperator()

  async function handleDelete() {
    if (!id) return

    if (window.confirm(FRENCH_LABELS.confirmDeleteOperator)) {
      await deleteMutation.mutateAsync(id)
      navigate(ROUTES.operators)
    }
  }

  function handleEdit() {
    if (id) {
      navigate(ROUTES.operatorEdit(id))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody>
              <p className="text-center text-default-500">
                {FRENCH_LABELS.noOperatorsFound}
              </p>
            </CardBody>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="flat"
            onClick={() => navigate(ROUTES.operators)}
            startContent={
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            }
          >
            {FRENCH_LABELS.back}
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {FRENCH_LABELS.operatorDetails}
          </h1>
          <div className="flex gap-2">
            <Button color="primary" variant="flat" onClick={handleEdit}>
              {FRENCH_LABELS.edit}
            </Button>
            <Button
              color="danger"
              variant="flat"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              {FRENCH_LABELS.delete}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Informations générales</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {FRENCH_LABELS.employeeNumber}
                  </p>
                  <p className="font-mono font-medium">
                    {operator.employee_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{FRENCH_LABELS.status}</p>
                  <Chip
                    color={operator.is_active ? 'success' : 'default'}
                    size="sm"
                    variant="flat"
                  >
                    {operator.is_active
                      ? FRENCH_LABELS.active
                      : FRENCH_LABELS.inactive}
                  </Chip>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {FRENCH_LABELS.firstName}
                  </p>
                  <p className="font-medium">{operator.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {FRENCH_LABELS.lastName}
                  </p>
                  <p className="font-medium">{operator.last_name}</p>
                </div>
                {operator.email && (
                  <div>
                    <p className="text-sm text-gray-500">{FRENCH_LABELS.email}</p>
                    <p className="font-medium">{operator.email}</p>
                  </div>
                )}
                {operator.phone && (
                  <div>
                    <p className="text-sm text-gray-500">{FRENCH_LABELS.phone}</p>
                    <p className="font-medium">{operator.phone}</p>
                  </div>
                )}
                {operator.department && (
                  <div>
                    <p className="text-sm text-gray-500">
                      {FRENCH_LABELS.department}
                    </p>
                    <p className="font-medium">{operator.department}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">
                    {FRENCH_LABELS.createdAt}
                  </p>
                  <p className="font-medium">{formatDate(operator.created_at)}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {FRENCH_LABELS.currentAssignment}
              </h2>
            </CardHeader>
            <Divider />
            <CardBody>
              {operator.current_assignment ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {FRENCH_LABELS.vehicle}
                      </p>
                      <p className="font-medium">Véhicule attribué</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {FRENCH_LABELS.since}
                      </p>
                      <p className="font-medium">
                        {formatDate(operator.current_assignment.start_date)}
                      </p>
                    </div>
                    {operator.current_assignment.notes && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">
                          {FRENCH_LABELS.notes}
                        </p>
                        <p className="font-medium">
                          {operator.current_assignment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-default-500">
                  {FRENCH_LABELS.noAssignment}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {FRENCH_LABELS.assignmentHistory}
              </h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <AssignmentHistoryTable
                assignments={operator.assignment_history}
              />
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  )
}
