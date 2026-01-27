import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react'
import { Navbar } from '@/components/common/Navbar'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees'
import { FRENCH_LABELS, ROUTES, DEFAULT_PAGE_SIZE } from '@/utils/constants'

export function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  )
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: employeesData, isLoading } = useEmployees({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search,
  })

  const deleteMutation = useDeleteEmployee()

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (page > 1) params.set('page', page.toString())
    setSearchParams(params)
  }, [search, page, setSearchParams])

  function handleDeleteClick(id: string) {
    setEmployeeToDelete(id)
    onOpen()
  }

  async function handleDeleteConfirm() {
    if (employeeToDelete) {
      await deleteMutation.mutateAsync(employeeToDelete)
      onClose()
      setEmployeeToDelete(null)
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
            {FRENCH_LABELS.employees}
          </h1>
          <Link to={ROUTES.employeeNew}>
            <Button color="primary">
              {FRENCH_LABELS.addEmployee}
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardBody>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher par nom ou email..."
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <EmployeeTable
              employees={employeesData?.employees || []}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />
            
            {employeesData && (
              <Pagination
                currentPage={page}
                totalPages={employeesData.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>{FRENCH_LABELS.deleteEmployee}</ModalHeader>
            <ModalBody>
              <p>{FRENCH_LABELS.confirmDeleteEmployee}</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                {FRENCH_LABELS.cancel}
              </Button>
              <Button
                color="danger"
                onPress={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
              >
                {FRENCH_LABELS.delete}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </div>
  )
}
