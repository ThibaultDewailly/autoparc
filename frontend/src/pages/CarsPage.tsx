import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react'
import { Navbar } from '@/components/common/Navbar'
import { SearchBar } from '@/components/common/SearchBar'
import { FilterPanel } from '@/components/common/FilterPanel'
import { Pagination } from '@/components/common/Pagination'
import { CarTable } from '@/components/cars/CarTable'
import { useCars, useDeleteCar } from '@/hooks/useCars'
import { FRENCH_LABELS, ROUTES, DEFAULT_PAGE_SIZE } from '@/utils/constants'
import type { CarStatus } from '@/types'

export function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState<CarStatus | undefined>(
    (searchParams.get('status') as CarStatus) || undefined
  )
  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  )
  const [carToDelete, setCarToDelete] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: carsData, isLoading } = useCars({
    page,
    limit: DEFAULT_PAGE_SIZE,
    status,
    search,
  })

  const deleteMutation = useDeleteCar()

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (page > 1) params.set('page', page.toString())
    setSearchParams(params)
  }, [search, status, page, setSearchParams])

  function handleDeleteClick(id: string) {
    setCarToDelete(id)
    onOpen()
  }

  async function handleDeleteConfirm() {
    if (carToDelete) {
      await deleteMutation.mutateAsync(carToDelete)
      onClose()
      setCarToDelete(null)
    }
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {FRENCH_LABELS.cars}
          </h1>
          <Link to={ROUTES.carNew}>
            <Button color="primary">
              {FRENCH_LABELS.addCar}
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardBody className="gap-4">
            <SearchBar
              value={search}
              onChange={setSearch}
            />
            <FilterPanel
              status={status}
              onStatusChange={setStatus}
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CarTable
              cars={carsData?.data || []}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />
            
            {carsData && (
              <Pagination
                currentPage={page}
                totalPages={carsData.total_pages}
                onPageChange={handlePageChange}
              />
            )}
          </CardBody>
        </Card>
      </main>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>{FRENCH_LABELS.deleteCar}</ModalHeader>
          <ModalBody>
            <p>{FRENCH_LABELS.confirmDelete}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onClick={onClose}
              isDisabled={deleteMutation.isPending}
            >
              {FRENCH_LABELS.cancel}
            </Button>
            <Button
              color="danger"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
            >
              {FRENCH_LABELS.delete}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
