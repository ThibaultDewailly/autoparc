import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
} from '@heroui/react'
import { Navbar } from '@/components/common/Navbar'
import { Pagination } from '@/components/common/Pagination'
import { OperatorTable } from '@/components/operators/OperatorTable'
import { useOperators, useDeleteOperator } from '@/hooks/useOperators'
import { FRENCH_LABELS, ROUTES, DEFAULT_PAGE_SIZE } from '@/utils/constants'

export function OperatorsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [department, setDepartment] = useState(searchParams.get('department') || '')
  const [isActive, setIsActive] = useState<boolean | undefined>(
    searchParams.get('is_active') === 'true' ? true :
    searchParams.get('is_active') === 'false' ? false : undefined
  )
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [operatorToDelete, setOperatorToDelete] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: operatorsData, isLoading } = useOperators({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search,
    department: department || undefined,
    is_active: isActive,
  })

  const deleteMutation = useDeleteOperator()

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (department) params.set('department', department)
    if (isActive !== undefined) params.set('is_active', isActive.toString())
    if (page > 1) params.set('page', page.toString())
    setSearchParams(params)
  }, [search, department, isActive, page, setSearchParams])

  function handleDeleteClick(id: string) {
    setOperatorToDelete(id)
    onOpen()
  }

  async function handleDeleteConfirm() {
    if (operatorToDelete) {
      await deleteMutation.mutateAsync(operatorToDelete)
      onClose()
      setOperatorToDelete(null)
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
            {FRENCH_LABELS.operators}
          </h1>
          <Link to={ROUTES.operatorNew}>
            <Button color="primary">{FRENCH_LABELS.addOperator}</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardBody className="gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Rechercher par nom, numéro d'employé, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
                isClearable
                onClear={() => setSearch('')}
              />
              <Input
                placeholder={FRENCH_LABELS.department}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full md:w-48"
                isClearable
                onClear={() => setDepartment('')}
              />
              <Select
                placeholder={FRENCH_LABELS.status}
                selectedKeys={isActive !== undefined ? [isActive.toString()] : []}
                onChange={(e) => {
                  const value = e.target.value
                  setIsActive(value === '' ? undefined : value === 'true')
                }}
                className="w-full md:w-48"
              >
                <SelectItem key="" className="text-foreground">
                  Tous
                </SelectItem>
                <SelectItem key="true" className="text-foreground">
                  {FRENCH_LABELS.active}
                </SelectItem>
                <SelectItem key="false" className="text-foreground">
                  {FRENCH_LABELS.inactive}
                </SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <OperatorTable
              operators={operatorsData?.data || []}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />

            {operatorsData && (
              <Pagination
                currentPage={page}
                totalPages={operatorsData.total_pages || 1}
                onPageChange={handlePageChange}
              />
            )}
          </CardBody>
        </Card>
      </main>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>{FRENCH_LABELS.deleteOperator}</ModalHeader>
          <ModalBody>
            <p className="text-gray-900">
              {FRENCH_LABELS.confirmDeleteOperator}
            </p>
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
