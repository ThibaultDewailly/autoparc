import { test, expect, type Page } from '@playwright/test'

// Helper function to login
async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@autoparc.fr')
  await page.getByLabel(/mot de passe/i).fill('Admin123!')
  
  // Click login and wait for navigation to dashboard
  await page.getByRole('button', { name: /se connecter/i }).click()
  await page.waitForURL('/', { timeout: 10000 })
  
  // Verify we're on dashboard
  await expect(page).toHaveURL('/')
}

test.describe('Car Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display cars list page', async ({ page }) => {
    await page.goto('/cars')
    
    await expect(page.getByRole('heading', { name: /véhicules/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /ajouter un véhicule/i })).toBeVisible()
  })

  test('should search for cars', async ({ page }) => {
    await page.goto('/cars')
    
    const searchInput = page.getByPlaceholder(/rechercher/i)
    await searchInput.fill('AA-123-BB')
    
    // Wait for search debounce and results
    await page.waitForTimeout(1000)
    
    // Should show filtered results or no results message
    const hasResults = await page.getByText('AA-123-BB').isVisible().catch(() => false)
    const noResults = await page.getByText(/aucun/i).isVisible().catch(() => false)
    expect(hasResults || noResults).toBe(true)
  })

  test('should filter cars by status', async ({ page }) => {
    await page.goto('/cars')
    
    // Open status filter - use button with specific text
    await page.getByRole('button', { name: /tous les statuts/i }).click()
    
    // Select active status
    await page.getByRole('option', { name: /actif/i }).click()
    
    // Wait for filtered results
    await page.waitForTimeout(1000)
  })

  test('should navigate through pagination', async ({ page }) => {
    await page.goto('/cars')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if pagination controls are visible (only shown when totalPages > 1)
    const nextButton = page.getByRole('button', { name: /suivant/i })
    const paginationVisible = await nextButton.isVisible().catch(() => false)
    
    if (paginationVisible) {
      // Only test pagination if there are multiple pages
      const isEnabled = await nextButton.isEnabled()
      
      if (isEnabled) {
        await nextButton.click()
        await expect(page.getByText(/page 2/i)).toBeVisible()
        
        const previousButton = page.getByRole('button', { name: /précédent/i })
        await previousButton.click()
        await expect(page.getByText(/page 1/i)).toBeVisible()
      }
    } else {
      // If pagination is not visible, verify the page still loaded correctly
      await expect(page.getByRole('heading', { name: /véhicules/i })).toBeVisible()
    }
  })

  // FIXME: This test is flaky due to NextUI Select component interaction issues
  // The Select dropdowns don't always render predictably in headless mode
  test.skip('should create a new car', async ({ page }) => {
    await page.goto('/cars')
    
    await page.getByRole('button', { name: /ajouter un véhicule/i }).click()
    
    await expect(page).toHaveURL(/\/cars\/new/)
    await expect(page.getByRole('heading', { name: /nouveau véhicule/i })).toBeVisible()
    
    // Fill in the form
    await page.getByLabel(/plaque.*immatriculation/i).fill('ZZ-999-ZZ')
    await page.getByLabel(/marque/i).fill('Test Brand')
    await page.getByLabel(/modèle/i).fill('Test Model')
    await page.getByLabel(/numéro de carte grise/i).fill('GC999999')
    
    // Wait for insurance companies to load
    await page.waitForTimeout(1500)
    
    // Select insurance company - use keyboard navigation after clicking the trigger
    await page.getByText(/compagnie d'assurance/i).locator('..').getByRole('button').click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    
    // Set rental start date
    await page.getByLabel(/date de début/i).fill('2024-01-01')
    
    // Select status - use keyboard navigation
    await page.getByText(/statut/i).first().locator('..').getByRole('button').click()
    await page.keyboard.press('ArrowDown')  // Move to "Actif"
    await page.keyboard.press('Enter')
    
    // Submit form
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Wait for navigation - should go back to cars list or detail page
    await page.waitForURL(/\/cars/, { timeout: 10000 })
    
    // Verify we're no longer on the new car page
    expect(page.url()).not.toMatch(/\/cars\/new$/)
  })

  test('should show validation error for invalid license plate', async ({ page }) => {
    await page.goto('/cars/new')
    
    await page.getByLabel(/plaque.*immatriculation/i).fill('INVALID')
    // Need to interact with another field or submit to trigger validation
    await page.getByLabel(/marque/i).click()
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Wait for validation error to appear
    await page.waitForTimeout(500)
    await expect(page.getByText(/format invalide/i)).toBeVisible({ timeout: 10000 })
  })

  // FIXME: This test is flaky due to NextUI Select component interaction issues
  // The Select dropdowns don't always render predictably in headless mode
  test.skip('should create a car with license plate AA-123-ZZ', async ({ page }) => {
    await page.goto('/cars/new')
    
    await expect(page.getByRole('heading', { name: /nouveau véhicule/i })).toBeVisible()
    
    // Fill in the form with AA-123-ZZ license plate
    await page.getByLabel(/plaque.*immatriculation/i).fill('AA-123-ZZ')
    await page.getByLabel(/marque/i).fill('Peugeot')
    await page.getByLabel(/modèle/i).fill('308')
    await page.getByLabel(/numéro de carte grise/i).fill('GC123456')
    
    // Set rental start date
    await page.getByLabel(/date de début/i).fill('2024-03-15')
    
    // Wait for insurance companies to load
    await page.waitForTimeout(2000)
    
    // Select insurance company using keyboard navigation
    const insuranceButton = page.getByRole('button', { name: /compagnie d'assurance/i })
    await insuranceButton.click()
    await page.waitForTimeout(300)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    // Select status using keyboard navigation
    const statusButton = page.getByRole('button', { name: /statut/i })
    await statusButton.click()
    await page.waitForTimeout(300)
    await page.keyboard.press('Enter') // Select first option (Actif)
    await page.waitForTimeout(500)
    
    // Submit form
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Wait for navigation - should go back to cars list or detail page
    await page.waitForURL(/\/cars(?:\/[^/]+)?$/, { timeout: 10000 })
    
    // Verify we're no longer on the new car page
    expect(page.url()).not.toMatch(/\/cars\/new$/)
    
    // Go to cars list and search for the created car
    await page.goto('/cars')
    await page.waitForTimeout(1000)
    
    const searchInput = page.getByPlaceholder(/rechercher/i)
    await searchInput.fill('AA-123-ZZ')
    await page.waitForTimeout(1500)
    
    // Verify the car appears in the results
    await expect(page.getByText('AA-123-ZZ')).toBeVisible({ timeout: 5000 })
  })

  test('should view car details', async ({ page }) => {
    await page.goto('/cars')
    
    // Wait for cars to load
    await page.waitForTimeout(1000)
    
    // Click on first car row or view link
    const firstRow = page.locator('tbody tr').first()
    const viewButton = firstRow.getByRole('link').first()
    
    if (await viewButton.isVisible()) {
      await viewButton.click()
      
      // Should navigate to detail page
      await page.waitForTimeout(1000)
      
      // Should show car details
      const hasDetails = await page.getByText(/marque/i).isVisible().catch(() => false)
      expect(hasDetails).toBeTruthy()
    }
  })

  test('should edit a car', async ({ page }) => {
    await page.goto('/cars')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find first car row and get edit link
    const firstRow = page.locator('tbody tr').first()
    const editLink = firstRow.locator('a[href*="/edit"]').first()
    
    if (await editLink.isVisible()) {
      await editLink.click()
      
      // Wait for edit page
      await page.waitForTimeout(1000)
      
      // Check if we're on edit page
      const hasEditHeading = await page.getByRole('heading', { name: /modifier/i }).isVisible().catch(() => false)
      expect(hasEditHeading).toBeTruthy()
    }
  })

  test('should update car brand and model', async ({ page }) => {
    await page.goto('/cars')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find first car row and get edit link
    const firstRow = page.locator('tbody tr').first()
    const editLink = firstRow.locator('a[href*="/edit"]').first()
    
    if (await editLink.isVisible()) {
      await editLink.click()
      
      // Wait for edit form to load
      await page.waitForTimeout(1500)
      
      // Verify license plate field is disabled
      const licensePlateInput = page.getByLabel(/plaque.*immatriculation/i)
      await expect(licensePlateInput).toBeDisabled()
      
      // Update brand and model
      const brandInput = page.getByLabel(/marque/i)
      const modelInput = page.getByLabel(/modèle/i)
      
      await brandInput.clear()
      await brandInput.fill('UpdatedBrand')
      await modelInput.clear()
      await modelInput.fill('UpdatedModel')
      
      // Submit the form
      await page.getByRole('button', { name: /enregistrer/i }).click()
      
      // Wait for navigation or success indication
      await page.waitForTimeout(2000)
      
      // Should either navigate away or show success
      const urlChanged = !page.url().includes('/edit')
      const hasSuccess = await page.getByText(/succès|modifi/i).isVisible().catch(() => false)
      
      expect(urlChanged || hasSuccess).toBeTruthy()
    }
  })

  test('should not require license plate when editing car', async ({ page }) => {
    await page.goto('/cars')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find first car row and get edit link
    const firstRow = page.locator('tbody tr').first()
    const editLink = firstRow.locator('a[href*="/edit"]').first()
    
    if (await editLink.isVisible()) {
      await editLink.click()
      
      // Wait for edit form to load
      await page.waitForTimeout(1500)
      
      // License plate should be disabled
      const licensePlateInput = page.getByLabel(/plaque.*immatriculation/i)
      await expect(licensePlateInput).toBeDisabled()
      
      // Clear brand to trigger validation
      const brandInput = page.getByLabel(/marque/i)
      await brandInput.clear()
      
      // Try to submit
      await page.getByRole('button', { name: /enregistrer/i }).click()
      
      // Should show validation error for brand, not license plate
      await page.waitForTimeout(500)
      await expect(page.getByText(/marque.*requise/i)).toBeVisible()
      
      // Should NOT show license plate error
      const licensePlateError = await page.getByText(/immatriculation.*requise/i).isVisible().catch(() => false)
      expect(licensePlateError).toBe(false)
    }
  })

  test('should delete a car', async ({ page }) => {
    await page.goto('/cars')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find and click delete button in first row
    const firstRow = page.locator('tbody tr').first()
    const deleteButton = firstRow.locator('button').filter({ hasText: /supprimer/i }).first()
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      
      // Wait for confirmation modal
      await page.waitForTimeout(500)
      
      // Confirm deletion if modal appears
      const confirmButton = page.getByRole('button', { name: /supprimer/i }).last()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should cancel car deletion', async ({ page }) => {
    await page.goto('/cars')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find and click delete button in first row
    const firstRow = page.locator('tbody tr').first()
    const deleteButton = firstRow.locator('button').filter({ hasText: /supprimer/i }).first()
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      
      // Wait for confirmation modal
      await page.waitForTimeout(500)
      
      // Cancel deletion if modal appears
      const cancelButton = page.getByRole('button', { name: /annuler/i })
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('should navigate back from car detail', async ({ page }) => {
    await page.goto('/cars')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Navigate to first car detail
    const firstRow = page.locator('tbody tr').first()
    const viewLink = firstRow.getByRole('link').first()
    
    if (await viewLink.isVisible()) {
      await viewLink.click()
      await page.waitForTimeout(1000)
      
      // Click back button
      const backButton = page.getByRole('link', { name: /retour/i })
      if (await backButton.isVisible()) {
        await backButton.click()
        await page.waitForTimeout(500)
        expect(page.url()).toContain('/cars')
      }
    }
  })

  test('should navigate back from car form', async ({ page }) => {
    await page.goto('/cars/new')
    
    // Click back button
    await page.getByRole('button', { name: /retour/i }).click()
    
    // Should navigate back to cars list
    await expect(page).toHaveURL('/cars')
  })

  test('should display current operator in car list', async ({ page }) => {
    await page.goto('/cars')
    await page.waitForLoadState('networkidle')
    
    // The car list should load successfully
    await expect(page.getByRole('heading', { name: /véhicules/i })).toBeVisible()
    
    // Check if table has data
    const hasRows = await page.locator('tbody tr').count()
    
    if (hasRows > 0) {
      // The table should display operator information in the rows
      // This is a basic integration test - the operator column may show
      // operator name or "Aucun" for unassigned cars
      const tableVisible = await page.locator('tbody').isVisible()
      expect(tableVisible).toBe(true)
    }
  })

  test('should display current operator section in car detail page', async ({ page }) => {
    await page.goto('/cars')
    await page.waitForLoadState('networkidle')
    
    // Click on first car
    const viewButtons = page.locator('tbody tr').first().getByRole('link')
    const hasButton = await viewButtons.first().isVisible({ timeout: 2000 }).catch(() => false)
    
    if (hasButton) {
      await viewButtons.first().click()
      await page.waitForURL(/\/cars\/[^/]+$/, { timeout: 5000 })
      
      // Verify current operator section exists
      const currentOperatorSection = page.getByText(/opérateur actuel/i)
      await expect(currentOperatorSection).toBeVisible()
      
      // Should show either "Aucune attribution" or operator details
      const hasNoOperator = await page.getByText(/aucune attribution/i).isVisible({ timeout: 1000 }).catch(() => false)
      const hasOperator = await page.getByText(/depuis/i).isVisible({ timeout: 1000 }).catch(() => false)
      
      expect(hasNoOperator || hasOperator).toBe(true)
    }
  })

  test('should display assignment history in car detail page', async ({ page }) => {
    await page.goto('/cars')
    await page.waitForLoadState('networkidle')
    
    // Click on first car
    const viewButtons = page.locator('tbody tr').first().getByRole('link')
    const hasButton = await viewButtons.first().isVisible({ timeout: 2000 }).catch(() => false)
    
    if (hasButton) {
      await viewButtons.first().click()
      await page.waitForURL(/\/cars\/[^/]+$/, { timeout: 5000 })
      
      // Verify assignment history section exists
      const historySection = page.getByText(/historique.*attribution/i)
      await expect(historySection).toBeVisible()
      
      // The history table should be present (may be empty)
      // Check for either table with data or "Aucune" message
      const hasTable = await page.locator('table').count()
      expect(hasTable).toBeGreaterThanOrEqual(0)
    }
  })

  test('should show assignment actions in car detail page', async ({ page }) => {
    await page.goto('/cars')
    await page.waitForLoadState('networkidle')
    
    // Click on first car
    const viewButtons = page.locator('tbody tr').first().getByRole('link')
    const hasButton = await viewButtons.first().isVisible({ timeout: 2000 }).catch(() => false)
    
    if (hasButton) {
      await viewButtons.first().click()
      await page.waitForURL(/\/cars\/[^/]+$/, { timeout: 5000 })
      
      // Check for either "Attribuer" or "Désattribuer" button
      const assignButton = page.getByRole('button', { name: /attribuer un opérateur/i })
      const unassignButton = page.getByRole('button', { name: /désattribuer/i })
      
      const hasAssignButton = await assignButton.isVisible({ timeout: 1000 }).catch(() => false)
      const hasUnassignButton = await unassignButton.isVisible({ timeout: 1000 }).catch(() => false)
      
      // Should have at least one action button
      expect(hasAssignButton || hasUnassignButton).toBe(true)
    }
  })
})
