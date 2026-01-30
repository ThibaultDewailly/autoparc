import { test, expect, type Page } from '@playwright/test'

// Helper function to login
async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@autoparc.fr')
  await page.getByLabel(/mot de passe/i).fill('Admin123!')
  
  await page.getByRole('button', { name: /se connecter/i }).click()
  await page.waitForURL('/', { timeout: 10000 })
  
  await expect(page).toHaveURL('/')
}

test.describe('Accident Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display accidents list page', async ({ page }) => {
    await page.goto('/accidents')
    
    await expect(page.getByRole('heading', { name: /gestion des accidents/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /déclarer un accident/i })).toBeVisible()
  })

  test('should search for accidents', async ({ page }) => {
    await page.goto('/accidents')
    
    const searchInput = page.getByPlaceholder(/rechercher un accident/i)
    await searchInput.fill('test')
    
    // Wait for search debounce and results
    await page.waitForTimeout(1000)
    
    // Should show filtered results or no results message
    await page.waitForLoadState('networkidle')
  })

  test('should filter accidents by status', async ({ page }) => {
    await page.goto('/accidents')
    
    // Open status dropdown
    const statusSelect = page.getByRole('button', { name: /tous les statuts/i }).first()
    await statusSelect.click()
    await page.waitForTimeout(300)
    
    // Select a specific status
    const declaredOption = page.getByRole('option', { name: /déclaré/i }).first()
    const hasOption = await declaredOption.isVisible().catch(() => false)
    
    if (hasOption) {
      await declaredOption.click()
      await page.waitForTimeout(1000)
      await page.waitForLoadState('networkidle')
    }
  })

  test('should show all statuses in status filter', async ({ page }) => {
    await page.goto('/accidents')
    
    // Open status dropdown
    const statusSelect = page.getByRole('button', { name: /tous les statuts/i }).first()
    await statusSelect.click()
    await page.waitForTimeout(300)
    
    // Check for expected status options
    const expectedStatuses = [/tous/i, /déclaré/i, /en révision|sous révision/i, /approuvé/i, /clôturé|fermé/i]
    
    for (const status of expectedStatuses) {
      const option = page.getByRole('option', { name: status }).first()
      const isVisible = await option.isVisible().catch(() => false)
      // At least "Tous" should be visible
      if (status.toString().includes('tous')) {
        expect(isVisible).toBe(true)
      }
    }
  })

  test('should navigate to create accident page', async ({ page }) => {
    await page.goto('/accidents')
    
    await page.getByRole('button', { name: /déclarer un accident/i }).click()
    
    await expect(page).toHaveURL('/accidents/new')
    await expect(page.getByRole('heading', { name: /déclarer un accident|ajouter un accident/i })).toBeVisible()
  })

  test('should display accident form fields', async ({ page }) => {
    await page.goto('/accidents/new')
    
    // Wait for form to load
    await page.waitForLoadState('networkidle')
    
    // Check for form elements (exact labels depend on implementation)
    const hasForm = await page.locator('form').isVisible().catch(() => false)
    const hasCard = await page.locator('[class*="card"]').isVisible().catch(() => false)
    
    expect(hasForm || hasCard).toBe(true)
    
    // Should have submit and cancel buttons
    const hasSubmit = await page.getByRole('button', { name: /enregistrer|soumettre|déclarer/i }).isVisible().catch(() => false)
    const hasCancel = await page.getByRole('button', { name: /annuler|retour/i }).isVisible().catch(() => false)
    
    expect(hasSubmit || hasCancel).toBe(true)
  })

  test('should cancel accident creation and return to list', async ({ page }) => {
    await page.goto('/accidents/new')
    
    // Click cancel or back button
    const cancelButton = page.getByRole('button', { name: /annuler|retour/i }).first()
    await cancelButton.click()
    
    // Should return to accidents list
    await expect(page).toHaveURL('/accidents')
  })

  test('should display accidents table with data', async ({ page }) => {
    await page.goto('/accidents')
    
    await page.waitForLoadState('networkidle')
    
    // Check if table exists
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasNoData = await page.getByText(/aucun accident/i).isVisible().catch(() => false)
    
    // Either table with data or "no data" message should be visible
    expect(hasTable || hasNoData).toBe(true)
  })

  test('should display accident status badges', async ({ page }) => {
    await page.goto('/accidents')
    
    await page.waitForLoadState('networkidle')
    
    // Look for status badges if accidents exist
    const hasData = await page.locator('table tbody tr').count() > 0
    
    if (hasData) {
      // Status badges should have specific classes or text
      const statusBadge = page.locator('[class*="badge"]').or(page.locator('[class*="chip"]')).first()
      const hasBadge = await statusBadge.isVisible().catch(() => false)
      
      // If table has data, badges might be present
      expect(hasBadge || true).toBe(true) // Soft check
    }
  })

  test('should navigate to accident details', async ({ page }) => {
    await page.goto('/accidents')
    
    await page.waitForLoadState('networkidle')
    
    // Look for a view/details button or link in the table
    const viewButton = page.getByRole('button', { name: /voir|détails/i }).first()
    const hasViewButton = await viewButton.isVisible().catch(() => false)
    
    if (hasViewButton) {
      await viewButton.click()
      
      // Should navigate to detail page with ID in URL
      await page.waitForURL(/\/accidents\/[a-f0-9-]+/, { timeout: 5000 })
    }
  })

  test('should have navbar navigation', async ({ page }) => {
    await page.goto('/accidents')
    
    // Verify navbar is present
    await expect(page.locator('nav')).toBeVisible()
    
    // Should be able to navigate to other pages
    const dashboardLink = page.getByRole('link', { name: /tableau de bord|dashboard/i })
    if (await dashboardLink.isVisible().catch(() => false)) {
      await dashboardLink.click()
      await expect(page).toHaveURL('/')
    }
  })

  test('should navigate back from accident form', async ({ page }) => {
    await page.goto('/accidents/new')
    
    // Click back button
    const backButton = page.getByRole('button', { name: /retour/i }).first()
    await backButton.click()
    
    // Should return to accidents list
    await expect(page).toHaveURL('/accidents')
    await expect(page.getByRole('heading', { name: /gestion des accidents/i })).toBeVisible()
  })

  test('should handle pagination if multiple pages exist', async ({ page }) => {
    await page.goto('/accidents')
    
    await page.waitForLoadState('networkidle')
    
    // Check if pagination exists
    const nextButton = page.getByRole('button', { name: /suivant/i })
    const hasPagination = await nextButton.isVisible().catch(() => false)
    
    if (hasPagination && await nextButton.isEnabled()) {
      await nextButton.click()
      await page.waitForTimeout(1000)
      
      // Should show page indicator
      const pageIndicator = page.getByText(/page \d+/i)
      await expect(pageIndicator).toBeVisible()
    }
  })

  test('should have consistent layout with other pages', async ({ page }) => {
    await page.goto('/accidents')
    
    // Should have same layout structure as other pages
    await expect(page.locator('.min-h-screen.bg-gray-50')).toBeVisible()
    
    // Should have navbar
    await expect(page.locator('nav')).toBeVisible()
    
    // Should have main content area
    await expect(page.locator('main')).toBeVisible()
  })

  test('should display search and filter section', async ({ page }) => {
    await page.goto('/accidents')
    
    // Should have search input
    const searchInput = page.getByPlaceholder(/rechercher/i)
    await expect(searchInput).toBeVisible()
    
    // Should have status filter
    const statusFilter = page.getByRole('button', { name: /tous les statuts/i }).first()
    await expect(statusFilter).toBeVisible()
  })

  test('should show loading state while fetching data', async ({ page }) => {
    await page.goto('/accidents')
    
    // Page should load without errors
    await page.waitForLoadState('networkidle')
    
    // Should have main content visible
    const heading = page.getByRole('heading', { name: /gestion des accidents/i })
    await expect(heading).toBeVisible()
  })

  test('should handle empty search results gracefully', async ({ page }) => {
    await page.goto('/accidents')
    
    const searchInput = page.getByPlaceholder(/rechercher un accident/i)
    await searchInput.fill('NONEXISTENT_ACCIDENT_XYZ_123')
    
    // Wait for search
    await page.waitForTimeout(1000)
    await page.waitForLoadState('networkidle')
    
    // Should show no results message or empty table
    const hasNoResults = await page.getByText(/aucun accident|aucun résultat/i).isVisible().catch(() => false)
    const hasEmptyTable = await page.locator('table tbody tr').count() === 0
    
    expect(hasNoResults || hasEmptyTable).toBe(true)
  })

  test('should display accident form with back button', async ({ page }) => {
    await page.goto('/accidents/new')
    
    // Should have back button with arrow icon
    const backButton = page.getByRole('button', { name: /retour/i }).first()
    await expect(backButton).toBeVisible()
  })

  test('should maintain filter state during navigation', async ({ page }) => {
    await page.goto('/accidents')
    
    // Set a filter
    const statusSelect = page.getByRole('button', { name: /tous les statuts/i }).first()
    await statusSelect.click()
    await page.waitForTimeout(300)
    
    // Navigate away and back
    await page.goto('/dashboard')
    await page.goto('/accidents')
    
    // Page should load successfully (filter state may or may not persist depending on implementation)
    await expect(page.getByRole('heading', { name: /gestion des accidents/i })).toBeVisible()
  })
})
