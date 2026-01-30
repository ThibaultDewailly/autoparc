import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Divider,
  useDisclosure,
  Tabs,
  Tab,
} from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { CarDetail } from '@/components/cars/CarDetail'
import { AssignmentDialog } from '@/components/operators/AssignmentDialog'
import { UnassignmentDialog } from '@/components/operators/UnassignmentDialog'
import { AssignmentHistoryTable } from '@/components/operators/AssignmentHistoryTable'
import { useCar, useDeleteCar } from '@/hooks/useCars'
import { useAccidents } from '@/hooks/useAccidents'
import { useRepairs } from '@/hooks/useRepairs'
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
  const { data: accidentsData } = useAccidents({ carId: id })
  const { data: repairsData } = useRepairs({ carId: id })
  const deleteMutation = useDeleteCar()
  const assignMutation = useAssignOperatorToCar()
  const unassignMutation = useUnassignOperatorFromCar()

  const accidents = accidentsData?.accidents || []
  const repairs = repairsData?.repairs || []

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

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Accidents et Réparations
              </h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <Tabs aria-label="Accidents et Réparations">
                <Tab key="accidents" title={`${FRENCH_LABELS.accidents} (${accidents.length})`}>
                  <div className="space-y-4 mt-4">
                    {accidents.length === 0 ? (
                      <p className="text-center text-default-500">Aucun accident enregistré</p>
                    ) : (
                      accidents.map((accident) => (
                        <Card key={accident.id} className="shadow-sm">
                          <CardBody>
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="font-semibold">{formatDate(accident.accidentDate)}</p>
                                <p className="text-sm text-gray-600">{accident.location}</p>
                                <p className="text-sm">{accident.description}</p>
                                <p className="text-sm">
                                  <span className="font-semibold">Statut:</span>{' '}
                                  {accident.status === 'declared' ? 'Déclaré' : 
                                   accident.status === 'under_review' ? 'En examen' :
                                   accident.status === 'approved' ? 'Approuvé' : 'Fermé'}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                color="primary"
                                variant="light"
                                onPress={() => navigate(`/accidents/${accident.id}`)}
                              >
                                Détails
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </div>
                </Tab>
                <Tab key="repairs" title={`${FRENCH_LABELS.repairs} (${repairs.length})`}>
                  <div className="space-y-4 mt-4">
                    {repairs.length === 0 ? (
                      <p className="text-center text-default-500">Aucune réparation enregistrée</p>
                    ) : (
                      repairs.map((repair) => (
                        <Card key={repair.id} className="shadow-sm">
                          <CardBody>
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="font-semibold">
                                  {repair.repairType === 'accident' ? 'Accident' :
                                   repair.repairType === 'maintenance' ? 'Maintenance' : 'Inspection'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Début: {formatDate(repair.startDate)}
                                  {repair.endDate && ` - Fin: ${formatDate(repair.endDate)}`}
                                </p>
                                <p className="text-sm">{repair.description}</p>
                                <p className="text-sm">
                                  <span className="font-semibold">Statut:</span>{' '}
                                  {repair.status === 'scheduled' ? 'Programmé' :
                                   repair.status === 'in_progress' ? 'En cours' :
                                   repair.status === 'completed' ? 'Terminé' : 'Annulé'}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                color="primary"
                                variant="light"
                                onPress={() => navigate(`/repairs/${repair.id}`)}
                              >
                                Détails
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </div>
                </Tab>
              </Tabs>
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
