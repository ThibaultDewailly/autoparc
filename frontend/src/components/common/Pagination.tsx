import { Button } from '@nextui-org/react'
import { FRENCH_LABELS } from '@/utils/constants'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  function handlePrevious() {
    if (canGoPrevious) {
      onPageChange(currentPage - 1)
    }
  }

  function handleNext() {
    if (canGoNext) {
      onPageChange(currentPage + 1)
    }
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        size="sm"
        variant="flat"
        isDisabled={!canGoPrevious}
        onClick={handlePrevious}
      >
        {FRENCH_LABELS.previous}
      </Button>

      <span className="text-sm text-default-500">
        {FRENCH_LABELS.page} {currentPage} {FRENCH_LABELS.of} {totalPages}
      </span>

      <Button
        size="sm"
        variant="flat"
        isDisabled={!canGoNext}
        onClick={handleNext}
      >
        {FRENCH_LABELS.next}
      </Button>
    </div>
  )
}
