import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody } from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { GarageForm } from '@/components/garages/GarageForm'
import { useCreateGarage } from '@/hooks/useGarages'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { CreateGarageRequest, UpdateGarageRequest } from '@/types'

export function GarageNewPage() {
  const navigate = useNavigate()
  const createGarage = useCreateGarage()

  async function handleSubmit(data: CreateGarageRequest | UpdateGarageRequest) {
    await createGarage.mutateAsync(data as CreateGarageRequest)
    navigate(ROUTES.garages)
  }

  function handleCancel() {
    navigate(ROUTES.garages)
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
          {FRENCH_LABELS.addGarage}
        </h1>

        <Card>
          <CardBody>
            <GarageForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createGarage.isPending}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
