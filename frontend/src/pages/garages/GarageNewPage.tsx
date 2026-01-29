import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '@nextui-org/react'
import { GarageForm } from '@/components/garages/GarageForm'
import { useCreateGarage } from '@/hooks/useGarages'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { CreateGarageRequest } from '@/types'

export function GarageNewPage() {
  const navigate = useNavigate()
  const createGarage = useCreateGarage()

  async function handleSubmit(data: CreateGarageRequest) {
    await createGarage.mutateAsync(data)
    navigate(ROUTES.garages)
  }

  function handleCancel() {
    navigate(ROUTES.garages)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">{FRENCH_LABELS.addGarage}</h1>
        </CardHeader>
        <CardBody>
          <GarageForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createGarage.isPending}
          />
        </CardBody>
      </Card>
    </div>
  )
}
