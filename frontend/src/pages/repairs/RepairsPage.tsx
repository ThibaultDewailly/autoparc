import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, Select, SelectItem } from '@nextui-org/react'
import { useRepairs, useDeleteRepair } from '@/hooks/useRepairs'
import { RepairTable } from '@/components/repairs/RepairTable'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { FRENCH_LABELS, ROUTES, DEFAULT_PAGE_SIZE, REPAIR_STATUSES, REPAIR_TYPES } from '@/utils/constants'
import type { RepairStatus, RepairType } from '@/types'

export function RepairsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RepairStatus | undefined>()
  const [typeFilter, setTypeFilter] = useState<RepairType | undefined>()

  const { data, isLoading } = useRepairs({
    page,
    limit: DEFAULT_PAGE_SIZE,
    status: statusFilter,
    repairType: typeFilter,
  })

  const deleteRepair = useDeleteRepair()

  function handleDelete(id: string) {
    if (confirm(FRENCH_LABELS.confirmDeleteRepair)) {
      deleteRepair.mutate(id)
    }
  }

  function handleAddRepair() {
    navigate(ROUTES.repairNew)
  }

  const repairs = data?.data || []
  const totalPages = data?.total_pages || 0

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{FRENCH_LABELS.repairManagement}</h1>
        <Button color="primary" onClick={handleAddRepair}>
          {FRENCH_LABELS.addRepair}
        </Button>
      </div>

      <Card className="mb-4">
        <CardBody>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher une réparation..."
              />
            </div>
            <div className="w-48">
              <Select
                label={FRENCH_LABELS.repairType}
                placeholder="Tous les types"
                selectedKeys={typeFilter ? [typeFilter] : []}
                onChange={(e) => setTypeFilter(e.target.value as RepairType || undefined)}
              >
                {REPAIR_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="w-48">
              <Select
                label={FRENCH_LABELS.status}
                placeholder="Tous les statuts"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onChange={(e) => setStatusFilter(e.target.value as RepairStatus || undefined)}
              >
                {REPAIR_STATUSES.map((status) => (
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
          <RepairTable
            repairs={repairs}
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
