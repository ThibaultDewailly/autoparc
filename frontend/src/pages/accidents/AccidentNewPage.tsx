import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '@nextui-org/react'
import { AccidentForm } from '@/components/accidents/AccidentForm'
import { useCreateAccident, useUploadPhoto } from '@/hooks/useAccidents'
import { useCars } from '@/hooks/useCars'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { CreateAccidentRequest } from '@/types'

export function AccidentNewPage() {
  const navigate = useNavigate()
  const { data: cars = [] } = useCars({ isActive: true })
  const createAccident = useCreateAccident()
  const uploadPhoto = useUploadPhoto()

  async function handleSubmit(data: CreateAccidentRequest, photos?: File[]) {
    const accident = await createAccident.mutateAsync(data)
    
    if (photos && photos.length > 0) {
      await Promise.all(
        photos.map((photo) => uploadPhoto.mutateAsync({ accidentId: accident.id, photo }))
      )
    }
    
    navigate(ROUTES.accidents)
  }

  function handleCancel() {
    navigate(ROUTES.accidents)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">{FRENCH_LABELS.addAccident}</h1>
        </CardHeader>
        <CardBody>
          <AccidentForm
            cars={cars}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createAccident.isPending || uploadPhoto.isPending}
          />
        </CardBody>
      </Card>
    </div>
  )
}
