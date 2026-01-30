import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody } from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { RepairForm } from '@/components/repairs/RepairForm'
import { useCreateRepair } from '@/hooks/useRepairs'
import { useCars } from '@/hooks/useCars'
import { useGarages } from '@/hooks/useGarages'
import { useAccidents } from '@/hooks/useAccidents'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import type { CreateRepairRequest, UpdateRepairRequest, Car } from '@/types'

export function RepairNewPage() {
  const navigate = useNavigate()
  const { data: carsData = [] } = useCars({})
  const { data: garagesData } = useGarages({})
  const { data: accidentsData } = useAccidents({})
  const createRepair = useCreateRepair()

  const cars = Array.isArray(carsData) ? carsData : carsData?.cars || []
  const garages = garagesData?.garages || []
  const accidents = accidentsData?.accidents || []

  async function handleSubmit(data: CreateRepairRequest | UpdateRepairRequest) {
    await createRepair.mutateAsync(data as CreateRepairRequest)
    navigate(ROUTES.repairs)
  }

  function handleCancel() {
    navigate(ROUTES.repairs)
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
          {FRENCH_LABELS.addRepair}
        </h1>

        <Card>
          <CardBody>
            <RepairForm
              cars={cars as Car[]}
              garages={garages}
              accidents={accidents}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createRepair.isPending}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
