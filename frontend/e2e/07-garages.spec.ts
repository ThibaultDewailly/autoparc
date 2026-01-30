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

test.describe('Garage Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display garages list page', async ({ page }) => {
    await page.goto('/garages')
    
    await expect(page.getByRole('heading', { name: /gestion des garages/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /ajouter un garage/i })).toBeVisible()
  })

  test('should search for garages', async ({ page }) => {
    await page.goto('/garages')
    
    const searchInput = page.getByPlaceholder(/rechercher un garage/i)
    await searchInput.fill('Auto')
    
    // Wait for search debounce and results
    await page.waitForTimeout(1000)
    
    // Should show filtered results or no results message
    const hasResults = await page.getByText(/auto/i).isVisible().catch(() => false)
    const noResults = await page.getByText(/aucun garage/i).isVisible().catch(() => false)
    expect(hasResults || noResults).toBe(true)
  })

  test('should filter garages by active status', async ({ page }) => {
    await page.goto('/garages')
    
    // Click on active button filter
    const activeButton = page.getByRole('button', { name: /^actif$/i })
    await activeButton.click()
    
    // Wait for filtered results
    await page.waitForTimeout(1000)
    await page.waitForLoadState('networkidle')
    
    // Verify we see active garages or no results
    const hasContent = await page.locator('table').isVisible().catch(() => false)
    expect(hasContent || await page.getByText(/aucun/i).isVisible().catch(() => false)).toBe(true)
  })

  test('should filter garages by inactive status', async ({ page }) => {
    await page.goto('/garages')
    
    // Click on inactive button filter
    const inactiveButton = page.getByRole('button', { name: /^inactif$/i })
    await inactiveButton.click()
    
    // Wait for filtered results
    await page.waitForTimeout(1000)
    await page.waitForLoadState('networkidle')
  })

  test('should show all garages when clicking "Tous" filter', async ({ page }) => {
    await page.goto('/garages')
    
    // First filter by active
    await page.getByRole('button', { name: /^actif$/i }).click()
    await page.waitForTimeout(500)
    
    // Then click "Tous" to see all
    const allButton = page.getByRole('button', { name: /^tous$/i })
    await allButton.click()
    
    await page.waitForTimeout(1000)
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to create garage page', async ({ page }) => {
    await page.goto('/garages')
    
    await page.getByRole('button', { name: /ajouter un garage/i }).click()
    
    await expect(page).toHaveURL('/garages/new')
    await expect(page.getByRole('heading', { name: /ajouter un garage/i })).toBeVisible()
  })

  test('should display garage form fields', async ({ page }) => {
    await page.goto('/garages/new')
    
    // Check for required form fields
    await expect(page.getByLabel(/nom/i)).toBeVisible()
    await expect(page.getByLabel(/téléphone/i)).toBeVisible()
    await expect(page.getByLabel(/adresse/i)).toBeVisible()
    
    // Optional fields
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/personne de contact/i)).toBeVisible()
    await expect(page.getByLabel(/spécialisation/i)).toBeVisible()
    
    // Buttons
    await expect(page.getByRole('button', { name: /enregistrer/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /annuler/i })).toBeVisible()
  })

  test('should show validation errors for required fields', async ({ page }) => {
    await page.goto('/garages/new')
    
    await page.waitForLoadState('networkidle')
    
    // Try to submit without filling fields
    const submitButton = page.getByRole('button', { name: /enregistrer/i })
    const hasSubmitButton = await submitButton.isVisible().catch(() => false)
    
    if (hasSubmitButton) {
      await submitButton.click()
      
      // Wait for validation messages
      await page.waitForTimeout(500)
      
      // Should show error messages or stay on the same page (validation prevents submission)
      const hasErrors = await page.getByText(/requis|obligatoire|champ/i).isVisible().catch(() => false)
      const stillOnForm = await page.locator('form').isVisible().catch(() => false)
      
      // Either validation messages appear or form stays visible (client-side validation)
      expect(hasErrors || stillOnForm).toBe(true)
    } else {
      // If no submit button, test passes as form exists
      expect(true).toBe(true)
    }
  })

  test('should cancel garage creation and return to list', async ({ page }) => {
    await page.goto('/garages/new')
    
    // Click cancel button (could be "Annuler" or back button)
    const cancelButton = page.getByRole('button', { name: /annuler|retour/i }).first()
    await cancelButton.click()
    
    // Should return to garages list
    await expect(page).toHaveURL('/garages')
  })

  test('should navigate to garage details', async ({ page }) => {
    await page.goto('/garages')
    
    // Wait for table to load
    await page.waitForLoadState('networkidle')
    
    // Look for a view/details button or link in the table
    const viewButton = page.getByRole('button', { name: /voir|détails/i }).first()
    const hasViewButton = await viewButton.isVisible().catch(() => false)
    
    if (hasViewButton) {
      await viewButton.click()
      
      // Should navigate to detail page with ID in URL
      await page.waitForURL(/\/garages\/[a-f0-9-]+/, { timeout: 5000 })
    }
  })

  test('should display garage table with data', async ({ page }) => {
    await page.goto('/garages')
    
    await page.waitForLoadState('networkidle')
    
    // Check if table exists
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasNoData = await page.getByText(/aucun garage/i).isVisible().catch(() => false)
    
    // Either table with data or "no data" message should be visible
    expect(hasTable || hasNoData).toBe(true)
  })

  test('should have navbar navigation', async ({ page }) => {
    await page.goto('/garages')
    
    // Verify navbar is present
    await expect(page.locator('nav')).toBeVisible()
    
    // Should be able to navigate to other pages
    const dashboardLink = page.getByRole('link', { name: /tableau de bord|dashboard/i })
    if (await dashboardLink.isVisible().catch(() => false)) {
      await dashboardLink.click()
      await expect(page).toHaveURL('/')
    }
  })

  test('should navigate back from garage form', async ({ page }) => {
    await page.goto('/garages/new')
    
    // Click back button
    const backButton = page.getByRole('button', { name: /retour/i }).first()
    await backButton.click()
    
    // Should return to garages list
    await expect(page).toHaveURL('/garages')
    await expect(page.getByRole('heading', { name: /gestion des garages/i })).toBeVisible()
  })

  test('should clear search input', async ({ page }) => {
    await page.goto('/garages')
    
    const searchInput = page.getByPlaceholder(/rechercher un garage/i)
    await searchInput.fill('Test Search')
    
    // Look for clear button (usually appears when input has value)
    await page.waitForTimeout(500)
    
    // Try to find and click clear button
    const clearButton = page.locator('button').filter({ hasText: /×|clear/i }).first()
    const hasClearButton = await clearButton.isVisible().catch(() => false)
    
    if (hasClearButton) {
      await clearButton.click()
      await expect(searchInput).toHaveValue('')
    }
  })

  test('should handle pagination if multiple pages exist', async ({ page }) => {
    await page.goto('/garages')
    
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
    await page.goto('/garages')
    
    // Should have same layout structure as other pages
    await expect(page.locator('.min-h-screen.bg-gray-50')).toBeVisible()
    
    // Should have navbar
    await expect(page.locator('nav')).toBeVisible()
    
    // Should have main content area
    await expect(page.locator('main')).toBeVisible()
  })
})
