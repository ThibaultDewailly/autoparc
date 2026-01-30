import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, CardBody, Spinner } from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { CarForm } from '@/components/cars/CarForm'
import { useCar, useCreateCar, useUpdateCar } from '@/hooks/useCars'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { CreateCarData, UpdateCarData } from '@/services/carService'

export function CarFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const { data: car, isLoading: isLoadingCar } = useCar(id)
  const createMutation = useCreateCar()
  const updateMutation = useUpdateCar()

  async function handleSubmit(data: CreateCarData | UpdateCarData) {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({
        id,
        data: data as UpdateCarData,
      })
      navigate(ROUTES.carDetail(id))
    } else {
      const newCar = await createMutation.mutateAsync(data as CreateCarData)
      navigate(ROUTES.carDetail(newCar.id))
    }
  }

  function handleCancel() {
    if (isEditMode && id) {
      navigate(ROUTES.carDetail(id))
    } else {
      navigate(ROUTES.cars)
    }
  }

  if (isEditMode && isLoadingCar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

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
          {isEditMode ? FRENCH_LABELS.editCar : FRENCH_LABELS.newCar}
        </h1>

        <Card>
          <CardBody>
            <CarForm
              car={car}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
