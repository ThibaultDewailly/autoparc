import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, Select, SelectItem } from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{FRENCH_LABELS.repairManagement}</h1>
        <Button color="primary" onClick={handleAddRepair}>
          {FRENCH_LABELS.addRepair}
        </Button>
      </div>

        <Card className="mb-6">
          <CardBody className="gap-4">
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
                placeholder="Tous les types"
                selectedKeys={typeFilter ? [typeFilter] : []}
                onChange={(e) => setTypeFilter(e.target.value as RepairType || undefined)}
              >
                {[{ value: '', label: 'Tous' }, ...REPAIR_TYPES].map((type) => (
                  <SelectItem key={type.value} className="text-foreground">
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="w-48">
              <Select
                placeholder="Tous les statuts"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onChange={(e) => setStatusFilter(e.target.value as RepairStatus || undefined)}
              >
                {[{ value: '', label: 'Tous' }, ...REPAIR_STATUSES].map((status) => (
                  <SelectItem key={status.value} className="text-foreground">
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
      </main>
    </div>
  )
}
