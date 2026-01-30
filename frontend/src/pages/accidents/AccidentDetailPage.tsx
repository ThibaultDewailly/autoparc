import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, Button, Spinner, Chip, Image } from '@heroui/react'
import { useAccident, useUpdateAccidentStatus } from '@/hooks/useAccidents'
import { useCars } from '@/hooks/useCars'
import { FRENCH_LABELS, ROUTES } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'
import type { Car, AccidentStatus } from '@/types'

export function AccidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: accident, isLoading, error } = useAccident(id!)
  const { data: carsData = [] } = useCars({})
  const updateStatus = useUpdateAccidentStatus()

  const cars = Array.isArray(carsData) ? carsData : carsData?.cars || []
  const car = cars.find((c: Car) => c.id === accident?.carId)

  async function handleStatusChange(newStatus: string) {
    if (!accident) return
    await updateStatus.mutateAsync({ id: accident.id, status: newStatus as AccidentStatus })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label={FRENCH_LABELS.loading} />
      </div>
    )
  }

  if (error || !accident) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-danger">{FRENCH_LABELS.error}: Accident introuvable</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{FRENCH_LABELS.accidentDetails}</h1>
          <div className="flex gap-2">
            <Button
              color="primary"
              onPress={() => navigate(`${ROUTES.accidents}/${accident.id}/edit`)}
            >
              {FRENCH_LABELS.edit}
            </Button>
            <Button variant="light" onPress={() => navigate(ROUTES.accidents)}>
              {FRENCH_LABELS.back}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* Accident Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.vehicle}</p>
                <p className="font-semibold">{car?.licensePlate || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.status}</p>
                <div className="flex gap-2 items-center">
                  <Chip
                    color={
                      accident.status === 'approved'
                        ? 'success'
                        : accident.status === 'under_review'
                        ? 'warning'
                        : accident.status === 'closed'
                        ? 'default'
                        : 'primary'
                    }
                    size="sm"
                  >
                    {accident.status === 'declared'
                      ? FRENCH_LABELS.declared
                      : accident.status === 'under_review'
                      ? FRENCH_LABELS.underReview
                      : accident.status === 'approved'
                      ? FRENCH_LABELS.approved
                      : FRENCH_LABELS.closed}
                  </Chip>
                  {accident.status !== 'closed' && (
                    <div className="flex gap-1">
                      {accident.status === 'declared' && (
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          onPress={() => handleStatusChange('under_review')}
                          isLoading={updateStatus.isPending}
                        >
                          {FRENCH_LABELS.underReview}
                        </Button>
                      )}
                      {(accident.status === 'declared' || accident.status === 'under_review') && (
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          onPress={() => handleStatusChange('approved')}
                          isLoading={updateStatus.isPending}
                        >
                          {FRENCH_LABELS.approved}
                        </Button>
                      )}
                      {accident.status === 'approved' && (
                        <Button
                          size="sm"
                          color="default"
                          variant="flat"
                          onPress={() => handleStatusChange('closed')}
                          isLoading={updateStatus.isPending}
                        >
                          {FRENCH_LABELS.closed}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.accidentDate}</p>
                <p className="font-semibold">{formatDate(accident.accidentDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.location}</p>
                <p className="font-semibold">{accident.location}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">{FRENCH_LABELS.description}</p>
                <p className="font-semibold">{accident.description}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">{FRENCH_LABELS.damagesDescription}</p>
                <p className="font-semibold">{accident.damagesDescription}</p>
              </div>
              {accident.responsibleParty && (
                <div>
                  <p className="text-sm text-gray-500">{FRENCH_LABELS.responsibleParty}</p>
                  <p className="font-semibold">{accident.responsibleParty}</p>
                </div>
              )}
              {accident.policeReportNumber && (
                <div>
                  <p className="text-sm text-gray-500">{FRENCH_LABELS.policeReportNumber}</p>
                  <p className="font-semibold">{accident.policeReportNumber}</p>
                </div>
              )}
              {accident.insuranceClaimNumber && (
                <div>
                  <p className="text-sm text-gray-500">{FRENCH_LABELS.insuranceClaimNumber}</p>
                  <p className="font-semibold">{accident.insuranceClaimNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.createdAt}</p>
                <p className="font-semibold">{formatDate(accident.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{FRENCH_LABELS.updatedAt}</p>
                <p className="font-semibold">{formatDate(accident.updatedAt)}</p>
              </div>
            </div>

            {/* Photos Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">{FRENCH_LABELS.photos}</h2>
              {accident.photos && accident.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {accident.photos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <Image
                        src={photo.photoUrl}
                        alt={`Accident photo ${photo.id}`}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        onClick={() => window.open(photo.photoUrl, '_blank')}
                      />
                      <p className="text-xs text-gray-500 mt-1">{formatDate(photo.uploadedAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{FRENCH_LABELS.noPhotos}</p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
