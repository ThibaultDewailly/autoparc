import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, Spinner } from '@heroui/react'
import { GarageForm } from '@/components/garages/GarageForm'
import { useGarage, useUpdateGarage } from '@/hooks/useGarages'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { UpdateGarageRequest } from '@/types'

export function GarageEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: garage, isLoading, error } = useGarage(id!)
  const updateGarage = useUpdateGarage()

  async function handleSubmit(data: UpdateGarageRequest) {
    await updateGarage.mutateAsync({ id: id!, data })
    navigate(ROUTES.garages)
  }

  function handleCancel() {
    navigate(ROUTES.garages)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !garage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-danger">Garage non trouvé</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">{FRENCH_LABELS.editGarage}</h1>
        </CardHeader>
        <CardBody>
          <GarageForm
            garage={garage}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateGarage.isPending}
          />
        </CardBody>
      </Card>
    </div>
  )
}
