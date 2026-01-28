import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Divider,
  useDisclosure,
} from '@nextui-org/react'
import { Navbar } from '@/components/common/Navbar'
import { CarDetail } from '@/components/cars/CarDetail'
import { AssignmentDialog } from '@/components/operators/AssignmentDialog'
import { UnassignmentDialog } from '@/components/operators/UnassignmentDialog'
import { AssignmentHistoryTable } from '@/components/operators/AssignmentHistoryTable'
import { useCar, useDeleteCar } from '@/hooks/useCars'
import {
  useCarAssignmentHistory,
  useAssignOperatorToCar,
  useUnassignOperatorFromCar,
} from '@/hooks/useOperators'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'
import type { AssignOperatorRequest, UnassignOperatorRequest } from '@/types/operator'

export function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: car, isLoading } = useCar(id)
  const { data: assignmentHistory = [] } = useCarAssignmentHistory(id)
  const deleteMutation = useDeleteCar()
  const assignMutation = useAssignOperatorToCar()
  const unassignMutation = useUnassignOperatorFromCar()

  const {
    isOpen: isAssignOpen,
    onOpen: onAssignOpen,
    onClose: onAssignClose,
  } = useDisclosure()
  const {
    isOpen: isUnassignOpen,
    onOpen: onUnassignOpen,
    onClose: onUnassignClose,
  } = useDisclosure()

  const currentAssignment = assignmentHistory.find((a) => !a.end_date)

  async function handleDelete() {
    if (!id) return

    if (window.confirm(FRENCH_LABELS.confirmDelete)) {
      await deleteMutation.mutateAsync(id)
      navigate(ROUTES.cars)
    }
  }

  function handleEdit() {
    if (id) {
      navigate(ROUTES.carEdit(id))
    }
  }

  async function handleAssign(data: AssignOperatorRequest) {
    if (!id) return
    await assignMutation.mutateAsync({ carId: id, data })
  }

  async function handleUnassign(data: UnassignOperatorRequest) {
    if (!id) return
    await unassignMutation.mutateAsync({ carId: id, data })
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

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody>
              <p className="text-center text-default-500">
                {FRENCH_LABELS.noCarsFound}
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
            onClick={() => navigate(ROUTES.cars)}
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
            {FRENCH_LABELS.carDetails}
          </h1>
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              onClick={handleEdit}
            >
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

        <CarDetail car={car} />

        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {FRENCH_LABELS.currentOperator}
              </h2>
              {currentAssignment ? (
                <Button
                  color="warning"
                  variant="flat"
                  size="sm"
                  onClick={onUnassignOpen}
                >
                  {FRENCH_LABELS.unassignCar}
                </Button>
              ) : (
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  onClick={onAssignOpen}
                >
                  {FRENCH_LABELS.assignOperator}
                </Button>
              )}
            </CardHeader>
            <Divider />
            <CardBody>
              {currentAssignment ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">
                      {FRENCH_LABELS.operator}:
                    </span>{' '}
                    Opérateur assigné
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{FRENCH_LABELS.since}:</span>{' '}
                    {formatDate(currentAssignment.start_date)}
                  </p>
                  {currentAssignment.notes && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{FRENCH_LABELS.notes}:</span>{' '}
                      {currentAssignment.notes}
                    </p>
                  )}
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
              <AssignmentHistoryTable assignments={assignmentHistory} />
            </CardBody>
          </Card>
        </div>
      </main>

      <AssignmentDialog
        isOpen={isAssignOpen}
        onClose={onAssignClose}
        onSubmit={handleAssign}
        isLoading={assignMutation.isPending}
      />

      <UnassignmentDialog
        isOpen={isUnassignOpen}
        onClose={onUnassignClose}
        onSubmit={handleUnassign}
        currentAssignment={currentAssignment}
        isLoading={unassignMutation.isPending}
      />
    </div>
  )
}
