import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, Button, Spinner, Chip } from '@nextui-org/react'
import { useRepair, useUpdateRepairStatus } from '@/hooks/useRepairs'
import { useCars } from '@/hooks/useCars'
import { useGarages } from '@/hooks/useGarages'
import { useAccidents } from '@/hooks/useAccidents'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'

export function RepairDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: repair, isLoading, error } = useRepair(Number(id))
  const { data: cars = [] } = useCars({})
  const { data: garagesData } = useGarages({})
  const { data: accidentsData } = useAccidents({})
  const updateStatus = useUpdateRepairStatus()

  const car = cars.find((c) => c.id === repair?.carId)
  const garage = garagesData?.garages.find((g) => g.id === repair?.garageId)
  const _accident = accidentsData?.accidents.find((a) => a.id === repair?.accidentId)

  async function handleStatusChange(newStatus: string) {
    if (!repair) return
    await updateStatus.mutateAsync({ id: repair.id, status: newStatus })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label={FRENCH_LABELS.loading} />
      </div>
    )
  }

  if (error || !repair) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-danger">{FRENCH_LABELS.error}: Réparation introuvable</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{FRENCH_LABELS.repairDetails}</h1>
          <div className="flex gap-2">
            <Button
              color="primary"
              onPress={() => navigate(`${ROUTES.repairs}/${repair.id}/edit`)}
            >
              {FRENCH_LABELS.edit}
            </Button>
            <Button variant="light" onPress={() => navigate(ROUTES.repairs)}>
              {FRENCH_LABELS.back}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* Repair Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.vehicle}</p>
                <p className="font-semibold">{car?.licensePlate || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.garage}</p>
                <p className="font-semibold">{garage?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.repairType}</p>
                <p className="font-semibold">
                  {repair.repairType === 'accident'
                    ? FRENCH_LABELS.accident
                    : repair.repairType === 'maintenance'
                    ? FRENCH_LABELS.maintenanceRepair
                    : FRENCH_LABELS.inspection}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.status}</p>
                <div className="flex gap-2 items-center">
                  <Chip
                    color={
                      repair.status === 'completed'
                        ? 'success'
                        : repair.status === 'in_progress'
                        ? 'primary'
                        : repair.status === 'cancelled'
                        ? 'danger'
                        : 'default'
                    }
                    size="sm"
                  >
                    {repair.status === 'scheduled'
                      ? FRENCH_LABELS.scheduled
                      : repair.status === 'in_progress'
                      ? FRENCH_LABELS.inProgress
                      : repair.status === 'completed'
                      ? FRENCH_LABELS.completed
                      : FRENCH_LABELS.cancelled}
                  </Chip>
                  {repair.status !== 'completed' && repair.status !== 'cancelled' && (
                    <div className="flex gap-1">
                      {repair.status === 'scheduled' && (
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleStatusChange('in_progress')}
                          isLoading={updateStatus.isPending}
                        >
                          {FRENCH_LABELS.inProgress}
                        </Button>
                      )}
                      {(repair.status === 'scheduled' || repair.status === 'in_progress') && (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => handleStatusChange('completed')}
                            isLoading={updateStatus.isPending}
                          >
                            {FRENCH_LABELS.completed}
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleStatusChange('cancelled')}
                            isLoading={updateStatus.isPending}
                          >
                            {FRENCH_LABELS.cancelled}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {repair.accidentId && (
                <div>
                  <p className="text-sm text-gray-500">{FRENCH_LABELS.accident}</p>
                  <Button
                    size="sm"
                    color="primary"
                    variant="light"
                    onPress={() => navigate(`${ROUTES.accidents}/${repair.accidentId}`)}
                  >
                    Voir accident #{repair.accidentId}
                  </Button>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.startDate}</p>
                <p className="font-semibold">{formatDate(repair.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.endDate}</p>
                <p className="font-semibold">{formatDate(repair.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.cost}</p>
                <p className="font-semibold">{repair.cost} €</p>
              </div>
              {repair.invoiceNumber && (
                <div>
                  <p className="text-sm text-gray-500">{FRENCH_LABELS.invoiceNumber}</p>
                  <p className="font-semibold">{repair.invoiceNumber}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-500">{FRENCH_LABELS.description}</p>
                <p className="font-semibold">{repair.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.createdAt}</p>
                <p className="font-semibold">{formatDate(repair.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.updatedAt}</p>
                <p className="font-semibold">{formatDate(repair.updatedAt)}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
