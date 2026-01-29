import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody } from '@nextui-org/react'
import { useGarages, useDeleteGarage } from '@/hooks/useGarages'
import { GarageTable } from '@/components/garages/GarageTable'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { FRENCH_LABELS, ROUTES, DEFAULT_PAGE_SIZE } from '@/utils/constants'

export function GaragesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true)

  const { data, isLoading } = useGarages({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search,
    isActive: isActiveFilter,
  })

  const deleteGarage = useDeleteGarage()

  function handleDelete(id: string) {
    if (confirm(FRENCH_LABELS.confirmDeleteGarage)) {
      deleteGarage.mutate(id)
    }
  }

  function handleAddGarage() {
    navigate(ROUTES.garageNew)
  }

  const garages = data?.data || []
  const totalPages = data?.total_pages || 0

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{FRENCH_LABELS.garageManagement}</h1>
        <Button color="primary" onClick={handleAddGarage}>
          {FRENCH_LABELS.addGarage}
        </Button>
      </div>

      <Card className="mb-4">
        <CardBody>
          <div className="flex gap-4 items-center">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher un garage..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                color={isActiveFilter === true ? 'primary' : 'default'}
                variant={isActiveFilter === true ? 'solid' : 'bordered'}
                onClick={() => setIsActiveFilter(true)}
              >
                {FRENCH_LABELS.active}
              </Button>
              <Button
                size="sm"
                color={isActiveFilter === false ? 'primary' : 'default'}
                variant={isActiveFilter === false ? 'solid' : 'bordered'}
                onClick={() => setIsActiveFilter(false)}
              >
                {FRENCH_LABELS.inactive}
              </Button>
              <Button
                size="sm"
                color={isActiveFilter === undefined ? 'primary' : 'default'}
                variant={isActiveFilter === undefined ? 'solid' : 'bordered'}
                onClick={() => setIsActiveFilter(undefined)}
              >
                Tous
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <GarageTable
            garages={garages}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
