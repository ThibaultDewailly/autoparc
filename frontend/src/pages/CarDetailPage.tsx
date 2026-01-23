import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, CardBody, Spinner } from '@nextui-org/react'
import { Navbar } from '@/components/common/Navbar'
import { CarDetail } from '@/components/cars/CarDetail'
import { useCar, useDeleteCar } from '@/hooks/useCars'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'

export function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: car, isLoading } = useCar(id)
  const deleteMutation = useDeleteCar()

  async function handleDelete() {
    if (!id) return
    
    if (window.confirm(FRENCH_LABELS.confirmDelete)) {
      await deleteMutation.mutateAsync(id)
      navigate(ROUTES.cars)
    }
  }

  function handleEdit() {
    if (id) {
      navigate(ROUTES.carEdit(id))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody>
              <p className="text-center text-default-500">
                {FRENCH_LABELS.noCarsFound}
              </p>
            </CardBody>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="flat"
            onClick={() => navigate(ROUTES.cars)}
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

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {FRENCH_LABELS.carDetails}
          </h1>
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              onClick={handleEdit}
            >
              {FRENCH_LABELS.edit}
            </Button>
            <Button
              color="danger"
              variant="flat"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              {FRENCH_LABELS.delete}
            </Button>
          </div>
        </div>

        <CarDetail car={car} />
      </main>
    </div>
  )
}
