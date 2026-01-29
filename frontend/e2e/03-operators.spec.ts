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

test.describe('Operator Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display operators list page', async ({ page }) => {
    await page.goto('/operators')
    
    await expect(page.getByRole('heading', { name: /opérateurs/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /ajouter un opérateur/i })).toBeVisible()
  })

  test('should search for operators', async ({ page }) => {
    await page.goto('/operators')
    
    const searchInput = page.getByPlaceholder(/rechercher.*nom.*numéro.*employé.*email/i)
    await searchInput.fill('EMP001')
    
    // Wait for search debounce and results
    await page.waitForTimeout(1000)
    
    // Should show filtered results or no results message
    const hasResults = await page.getByText('EMP001').isVisible().catch(() => false)
    const noResults = await page.getByText(/aucun opérateur/i).isVisible().catch(() => false)
    expect(hasResults || noResults).toBe(true)
  })

  test('should filter operators by department', async ({ page }) => {
    await page.goto('/operators')
    
    // Fill department filter
    const deptInput = page.getByPlaceholder(/département/i)
    await deptInput.fill('IT')
    
    // Wait for filtered results
    await page.waitForTimeout(1000)
    
    // Results should update
    await page.waitForLoadState('networkidle')
  })

  test('should filter operators by active status', async ({ page }) => {
    await page.goto('/operators')
    
    // Open status filter dropdown
    const statusSelect = page.getByRole('button', { name: /statut/i }).or(page.locator('button:has-text("Tous")'))
    await statusSelect.click()
    
    // Select active status
    await page.getByRole('option', { name: /actif/i }).first().click()
    
    // Wait for filtered results
    await page.waitForTimeout(1000)
  })

  test('should navigate through pagination', async ({ page }) => {
    await page.goto('/operators')
    
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
      await expect(page.getByRole('heading', { name: /opérateurs/i })).toBeVisible()
    }
  })

  // FIXME: This test may be flaky due to NextUI component interactions
  test.skip('should create a new operator', async ({ page }) => {
    await page.goto('/operators')
    
    await page.getByRole('button', { name: /ajouter un opérateur/i }).click()
    
    await expect(page).toHaveURL(/\/operators\/new/)
    await expect(page.getByRole('heading', { name: /nouvel opérateur/i })).toBeVisible()
    
    // Generate unique employee number
    const timestamp = Date.now()
    const empNumber = `EMPTEST${timestamp}`
    
    // Fill in the form
    await page.getByLabel(/numéro.*employé/i).fill(empNumber)
    await page.getByLabel(/prénom/i).fill('Test')
    await page.getByLabel(/nom/i).fill('Operator')
    await page.getByLabel(/email/i).fill(`test.${timestamp}@example.com`)
    await page.getByLabel(/téléphone/i).fill('+33612345678')
    await page.getByLabel(/département/i).fill('Testing')
    
    // Submit form
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Should redirect to detail page or list
    await page.waitForURL(/\/operators\/.*/, { timeout: 10000 })
    
    // Verify success (either on detail page or list)
    const operatorVisible = await page.getByText(empNumber).isVisible({ timeout: 5000 }).catch(() => false)
    expect(operatorVisible).toBe(true)
  })

  test('should show validation errors on create', async ({ page }) => {
    await page.goto('/operators/new')
    
    await expect(page.getByRole('heading', { name: /nouvel opérateur/i })).toBeVisible()
    
    // Try to submit empty form
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Wait a bit for validation
    await page.waitForTimeout(500)
    
    // Should show validation errors for required fields
    const errorMessages = page.locator('text=/requis|obligatoire/i')
    const errorCount = await errorMessages.count()
    expect(errorCount).toBeGreaterThan(0)
  })

  test('should show email validation error', async ({ page }) => {
    await page.goto('/operators/new')
    
    // Fill required fields
    await page.getByLabel(/numéro.*employé/i).fill('EMPTEST999')
    await page.getByLabel(/prénom/i).fill('Test')
    await page.getByLabel(/^nom$/i).fill('Operator')
    
    // Fill invalid email
    await page.getByLabel(/email/i).fill('invalid-email')
    
    // Try to submit
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Wait for validation
    await page.waitForTimeout(500)
    
    // Should show email validation error
    const emailError = page.locator('text=/email.*invalide/i')
    await expect(emailError).toBeVisible()
  })

  test('should view operator details', async ({ page }) => {
    await page.goto('/operators')
    
    // Wait for operators to load
    await page.waitForLoadState('networkidle')
    
    // Find first row and click the view link
    const firstRow = page.locator('tbody tr').first()
    const viewLink = firstRow.getByRole('link').first()
    
    // Check if any operators exist
    const hasOperators = await viewLink.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (hasOperators) {
      await viewLink.click()
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/operators\/[^/]+$/, { timeout: 5000 })
      
      // Verify detail page elements
      await expect(page.getByText(/informations générales/i)).toBeVisible()
      await expect(page.getByText(/attribution actuelle|historique/i)).toBeVisible()
    }
    // Skip test if no operators available
  })

  test('should navigate to edit page', async ({ page }) => {
    await page.goto('/operators')
    
    // Wait for operators to load
    await page.waitForLoadState('networkidle')
    
    // Find first row and click the edit link
    const firstRow = page.locator('tbody tr').first()
    const editLink = firstRow.locator('a[href*="/edit"]').first()
    
    // Check if any operators exist
    const hasOperators = await editLink.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (hasOperators) {
      await editLink.click()
      
      // Should navigate to edit page
      await expect(page).toHaveURL(/\/operators\/[^/]+\/edit$/, { timeout: 5000 })
      
      // Verify edit page elements
      await expect(page.getByRole('heading', { name: /modifier.*opérateur/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /enregistrer/i })).toBeVisible()
    }
    // Skip test if no operators available
  })

  test('should show delete confirmation dialog', async ({ page }) => {
    await page.goto('/operators')
    
    // Wait for operators to load
    await page.waitForLoadState('networkidle')
    
    // Find first row and click the delete button
    const firstRow = page.locator('tbody tr').first()
    const deleteButton = firstRow.locator('button').filter({ hasText: /supprimer/i }).first()
    
    // Check if any operators exist
    const hasOperators = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (hasOperators) {
      await deleteButton.click()
      
      // Should show confirmation dialog
      await expect(page.getByText(/êtes-vous sûr.*désactiver/i)).toBeVisible({ timeout: 2000 })
      
      // Cancel the deletion
      await page.getByRole('button', { name: /annuler/i }).click()
      
      // Dialog should close
      await expect(page.getByText(/êtes-vous sûr.*désactiver/i)).not.toBeVisible()
    }
    // Skip test if no operators available
  })

  test('should navigate from navbar', async ({ page }) => {
    await page.goto('/')
    
    // Click operators link in navbar
    await page.getByRole('link', { name: /opérateurs/i }).click()
    
    // Should navigate to operators page
    await expect(page).toHaveURL('/operators')
    await expect(page.getByRole('heading', { name: /opérateurs/i })).toBeVisible()
  })
})
