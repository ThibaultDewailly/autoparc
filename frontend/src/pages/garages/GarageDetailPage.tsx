import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, Button, Spinner, Chip } from '@nextui-org/react'
import { useGarage, useUpdateGarage } from '@/hooks/useGarages'
import { useRepairs } from '@/hooks/useRepairs'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'

export function GarageDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: garage, isLoading, error } = useGarage(id)
  const { data: repairsData } = useRepairs({ garageId: Number(id) })
  const updateGarage = useUpdateGarage()

  async function handleToggleStatus() {
    if (!garage) return
    await updateGarage.mutateAsync({
      id: garage.id.toString(),
      data: { ...garage, isActive: !garage.isActive },
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label={FRENCH_LABELS.loading} />
      </div>
    )
  }

  if (error || !garage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-danger">{FRENCH_LABELS.error}: Garage introuvable</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  const repairs = repairsData?.repairs || []

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{FRENCH_LABELS.garageDetails}</h1>
          <div className="flex gap-2">
            <Button
              color="primary"
              onPress={() => navigate(`${ROUTES.garages}/${garage.id}/edit`)}
            >
              {FRENCH_LABELS.edit}
            </Button>
            <Button
              color={garage.isActive ? 'warning' : 'success'}
              onPress={handleToggleStatus}
              isLoading={updateGarage.isPending}
            >
              {garage.isActive ? FRENCH_LABELS.deactivate : FRENCH_LABELS.activate}
            </Button>
            <Button variant="light" onPress={() => navigate(ROUTES.garages)}>
              {FRENCH_LABELS.back}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.garageName}</p>
                <p className="font-semibold">{garage.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.status}</p>
                <Chip color={garage.isActive ? 'success' : 'default'} size="sm">
                  {garage.isActive ? FRENCH_LABELS.active : FRENCH_LABELS.inactive}
                </Chip>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.contactPerson}</p>
                <p className="font-semibold">{garage.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.phone}</p>
                <p className="font-semibold">{garage.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.address}</p>
                <p className="font-semibold">{garage.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.specialization}</p>
                <p className="font-semibold">{garage.specialization}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.createdAt}</p>
                <p className="font-semibold">{formatDate(garage.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.updatedAt}</p>
                <p className="font-semibold">{formatDate(garage.updatedAt)}</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{FRENCH_LABELS.relatedRepairs}</h2>
                <p className="text-sm text-gray-500">{repairs.length} réparation(s)</p>
              </div>
              {repairs.length === 0 ? (
                <p className="text-gray-500">{FRENCH_LABELS.noRepairsFound}</p>
              ) : (
                <div className="space-y-2">
                  {repairs.map((repair) => (
                    <Card
                      key={repair.id}
                      isPressable
                      onPress={() => navigate(`${ROUTES.repairs}/${repair.id}`)}
                      className="hover:bg-gray-50"
                    >
                      <CardBody>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">
                              {repair.repairType === 'accident'
                                ? FRENCH_LABELS.accident
                                : repair.repairType === 'maintenance'
                                ? FRENCH_LABELS.maintenanceRepair
                                : FRENCH_LABELS.inspection}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(repair.startDate)} - {formatDate(repair.endDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{repair.cost} €</p>
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
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
