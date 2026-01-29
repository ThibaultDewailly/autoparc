import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, Spinner } from '@nextui-org/react'
import { AccidentForm } from '@/components/accidents/AccidentForm'
import { useAccident, useUpdateAccident } from '@/hooks/useAccidents'
import { useCars } from '@/hooks/useCars'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { UpdateAccidentRequest } from '@/types'

export function AccidentEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: accident, isLoading, error } = useAccident(Number(id))
  const { data: cars = [] } = useCars({ isActive: true })
  const updateAccident = useUpdateAccident()

  async function handleSubmit(data: UpdateAccidentRequest) {
    await updateAccident.mutateAsync({ id: Number(id), data })
    navigate(ROUTES.accidents)
  }

  function handleCancel() {
    navigate(ROUTES.accidents)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !accident) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-danger">Accident non trouvé</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">{FRENCH_LABELS.editAccident}</h1>
        </CardHeader>
        <CardBody>
          <AccidentForm
            accident={accident}
            cars={cars}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateAccident.isPending}
          />
        </CardBody>
      </Card>
    </div>
  )
}
