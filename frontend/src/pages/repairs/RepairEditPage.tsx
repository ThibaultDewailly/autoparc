import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, Spinner } from '@heroui/react'
import { RepairForm } from '@/components/repairs/RepairForm'
import { useRepair, useUpdateRepair } from '@/hooks/useRepairs'
import { useCars } from '@/hooks/useCars'
import { useGarages } from '@/hooks/useGarages'
import { useAccidents } from '@/hooks/useAccidents'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { UpdateRepairRequest, Car } from '@/types'

export function RepairEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: repair, isLoading, error } = useRepair(id!)
  const { data: carsData = [] } = useCars({})
  const { data: garagesData } = useGarages({})
  const { data: accidentsData } = useAccidents({})
  const updateRepair = useUpdateRepair()

  const cars = Array.isArray(carsData) ? carsData : carsData?.cars || []
  const garages = garagesData?.garages || []
  const accidents = accidentsData?.accidents || []

  async function handleSubmit(data: UpdateRepairRequest) {
    await updateRepair.mutateAsync({ id: id!, data })
    navigate(ROUTES.repairs)
  }

  function handleCancel() {
    navigate(ROUTES.repairs)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !repair) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-danger">Réparation non trouvée</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">{FRENCH_LABELS.editRepair}</h1>
        </CardHeader>
        <CardBody>
          <RepairForm
            repair={repair}
            cars={cars as Car[]}
            garages={garages}
            accidents={accidents}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateRepair.isPending}
          />
        </CardBody>
      </Card>
    </div>
  )
}
