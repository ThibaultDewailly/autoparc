import { Card, CardBody, Chip, Divider } from '@nextui-org/react'
import type { Car, CarStatus } from '@/types'
import { FRENCH_LABELS } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'

interface CarDetailProps {
  car: Car
}

function getStatusColor(status: CarStatus): 'success' | 'warning' | 'default' {
  switch (status) {
    case 'active':
      return 'success'
    case 'maintenance':
      return 'warning'
    case 'retired':
      return 'default'
    default:
      return 'default'
  }
}

function getStatusLabel(status: CarStatus): string {
  switch (status) {
    case 'active':
      return FRENCH_LABELS.active
    case 'maintenance':
      return FRENCH_LABELS.maintenance
    case 'retired':
      return FRENCH_LABELS.retired
    default:
      return status
  }
}

export function CarDetail({ car }: CarDetailProps) {
  return (
    <Card>
      <CardBody className="gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-mono">{car.license_plate}</h2>
          <Chip color={getStatusColor(car.status)} variant="flat">
            {getStatusLabel(car.status)}
          </Chip>
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem
            label={FRENCH_LABELS.brand}
            value={car.brand}
          />
          <DetailItem
            label={FRENCH_LABELS.model}
            value={car.model}
          />
          <DetailItem
            label={FRENCH_LABELS.greyCardNumber}
            value={car.grey_card_number}
          />
          <DetailItem
            label={FRENCH_LABELS.rentalStartDate}
            value={formatDate(car.rental_start_date)}
          />
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-semibold mb-2">
            {FRENCH_LABELS.insuranceCompany}
          </h3>
          {car.insurance_company && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-default-100 p-4 rounded-lg">
              <DetailItem
                label="Nom"
                value={car.insurance_company.name}
              />
              <DetailItem
                label="Contact"
                value={car.insurance_company.contact_person}
              />
              <DetailItem
                label="Téléphone"
                value={car.insurance_company.phone}
              />
              <DetailItem
                label="Email"
                value={car.insurance_company.email}
              />
              <DetailItem
                label="Numéro de police"
                value={car.insurance_company.policy_number}
              />
              <DetailItem
                label="Adresse"
                value={car.insurance_company.address}
              />
            </div>
          )}
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-default-500">
          <DetailItem
            label={FRENCH_LABELS.createdAt}
            value={formatDate(car.created_at)}
          />
          <DetailItem
            label={FRENCH_LABELS.updatedAt}
            value={formatDate(car.updated_at)}
          />
        </div>
      </CardBody>
    </Card>
  )
}

interface DetailItemProps {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <p className="text-sm text-default-500 mb-1">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  )
}
