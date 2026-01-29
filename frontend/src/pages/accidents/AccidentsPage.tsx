import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, Select, SelectItem } from '@nextui-org/react'
import { useAccidents, useDeleteAccident } from '@/hooks/useAccidents'
import { AccidentTable } from '@/components/accidents/AccidentTable'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { FRENCH_LABELS, ROUTES, DEFAULT_PAGE_SIZE, ACCIDENT_STATUSES } from '@/utils/constants'
import type { AccidentStatus } from '@/types'

export function AccidentsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AccidentStatus | undefined>()

  const { data, isLoading } = useAccidents({
    page,
    limit: DEFAULT_PAGE_SIZE,
    status: statusFilter,
  })

  const deleteAccident = useDeleteAccident()

  function handleDelete(id: string) {
    if (confirm(FRENCH_LABELS.confirmDeleteAccident)) {
      deleteAccident.mutate(id)
    }
  }

  function handleAddAccident() {
    navigate(ROUTES.accidentNew)
  }

  const accidents = data?.data || []
  const totalPages = data?.total_pages || 0

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{FRENCH_LABELS.accidentManagement}</h1>
        <Button color="primary" onClick={handleAddAccident}>
          {FRENCH_LABELS.declareAccident}
        </Button>
      </div>

      <Card className="mb-4">
        <CardBody>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un accident..."
              />
            </div>
            <div className="w-64">
              <Select
                label={FRENCH_LABELS.status}
                placeholder="Tous les statuts"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onChange={(e) => setStatusFilter(e.target.value as AccidentStatus || undefined)}
              >
                {ACCIDENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <AccidentTable
            accidents={accidents}
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
