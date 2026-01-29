import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '@nextui-org/react'
import { RepairForm } from '@/components/repairs/RepairForm'
import { useCreateRepair } from '@/hooks/useRepairs'
import { useCars } from '@/hooks/useCars'
import { useGarages } from '@/hooks/useGarages'
import { useAccidents } from '@/hooks/useAccidents'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { CreateRepairRequest } from '@/types'

export function RepairNewPage() {
  const navigate = useNavigate()
  const { data: cars = [] } = useCars({ isActive: true })
  const { data: garagesData } = useGarages({ isActive: true })
  const { data: accidentsData } = useAccidents({ status: 'approved' })
  const createRepair = useCreateRepair()

  const garages = garagesData?.garages || []
  const accidents = accidentsData?.accidents || []

  async function handleSubmit(data: CreateRepairRequest) {
    await createRepair.mutateAsync(data)
    navigate(ROUTES.repairs)
  }

  function handleCancel() {
    navigate(ROUTES.repairs)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">{FRENCH_LABELS.addRepair}</h1>
        </CardHeader>
        <CardBody>
          <RepairForm
            cars={cars}
            garages={garages}
            accidents={accidents}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createRepair.isPending}
          />
        </CardBody>
      </Card>
    </div>
  )
}
