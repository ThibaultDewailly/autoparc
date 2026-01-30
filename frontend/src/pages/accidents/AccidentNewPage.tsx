import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody } from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { AccidentForm } from '@/components/accidents/AccidentForm'
import { useCreateAccident, useUploadPhoto } from '@/hooks/useAccidents'
import { useCars } from '@/hooks/useCars'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { CreateAccidentRequest, UpdateAccidentRequest, Car } from '@/types'

export function AccidentNewPage() {
  const navigate = useNavigate()
  const { data: carsData = [] } = useCars({})
  const createAccident = useCreateAccident()
  const uploadPhoto = useUploadPhoto()

  const cars = Array.isArray(carsData) ? carsData : carsData?.cars || []

  async function handleSubmit(data: CreateAccidentRequest | UpdateAccidentRequest, photos?: File[]) {
    const accident = await createAccident.mutateAsync(data as CreateAccidentRequest)
    
    if (photos && photos.length > 0) {
      await Promise.all(
        photos.map((photo) => uploadPhoto.mutateAsync({ accidentId: accident.id, file: photo }))
      )
    }
    
    navigate(ROUTES.accidents)
  }

  function handleCancel() {
    navigate(ROUTES.accidents)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="flat"
            onClick={handleCancel}
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

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {FRENCH_LABELS.addAccident}
        </h1>

        <Card>
          <CardBody>
            <AccidentForm
              cars={cars as Car[]}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createAccident.isPending || uploadPhoto.isPending}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
