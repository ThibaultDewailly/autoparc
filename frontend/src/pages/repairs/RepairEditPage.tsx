import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, Spinner } from '@nextui-org/react'
import { RepairForm } from '@/components/repairs/RepairForm'
import { useRepair, useUpdateRepair } from '@/hooks/useRepairs'
import { useCars } from '@/hooks/useCars'
import { useGarages } from '@/hooks/useGarages'
import { useAccidents } from '@/hooks/useAccidents'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { UpdateRepairRequest } from '@/types'

export function RepairEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: repair, isLoading, error } = useRepair(Number(id))
  const { data: cars = [] } = useCars({ isActive: true })
  const { data: garagesData } = useGarages({ isActive: true })
  const { data: accidentsData } = useAccidents({ status: 'approved' })
  const updateRepair = useUpdateRepair()

  const garages = garagesData?.garages || []
  const accidents = accidentsData?.accidents || []

  async function handleSubmit(data: UpdateRepairRequest) {
    await updateRepair.mutateAsync({ id: Number(id), data })
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
            cars={cars}
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
