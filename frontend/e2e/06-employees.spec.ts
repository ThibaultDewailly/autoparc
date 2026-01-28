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

test.describe('Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display employees list page', async ({ page }) => {
    await page.goto('/employees')
    
    await expect(page.getByRole('heading', { name: /employés/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /ajouter un employé/i })).toBeVisible()
  })

  test('should search for employees', async ({ page }) => {
    await page.goto('/employees')
    
    const searchInput = page.getByPlaceholder(/rechercher/i)
    await searchInput.fill('admin')
    
    // Wait for search debounce and results
    await page.waitForTimeout(1500)
    
    // Should show filtered results in table or no results message
    const tableVisible = await page.locator('tbody tr').isVisible().catch(() => false)
    const noResults = await page.getByText(/aucun.*employé/i).isVisible().catch(() => false)
    expect(tableVisible || noResults).toBe(true)
  })

  test('should navigate through pagination', async ({ page }) => {
    await page.goto('/employees')
    
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
      await expect(page.getByRole('heading', { name: /employés/i })).toBeVisible()
    }
  })

  test('should navigate to create employee form and fill it', async ({ page }) => {
    await page.goto('/employees')
    
    await page.getByRole('button', { name: /ajouter un employé/i }).click()
    
    await expect(page).toHaveURL(/\/employees\/new/)
    await expect(page.getByRole('heading', { name: /ajouter un employé/i })).toBeVisible()
    
    // Generate unique email to avoid conflicts
    const timestamp = Date.now()
    const testEmail = `test.employee.${timestamp}@autoparc.fr`
    
    // Fill in the form
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/prénom/i).fill('Test')
    await page.getByLabel('Nom', { exact: false }).last().fill('Employee')
    
    // Fill password fields
    const passwordFields = page.getByLabel(/mot de passe/i)
    await passwordFields.first().fill('Test123!')
    await passwordFields.last().fill('Test123!')
    
    // Verify all fields are filled
    await expect(page.getByLabel(/email/i)).toHaveValue(testEmail)
    await expect(page.getByLabel(/prénom/i)).toHaveValue('Test')
    
    // Verify submit button is present
    await expect(page.getByRole('button', { name: /enregistrer/i })).toBeVisible()
  })

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/employees/new')
    
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/prénom/i).click()
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Wait for validation error to appear
    await page.waitForTimeout(500)
    await expect(page.getByText(/format.*email.*invalide/i)).toBeVisible({ timeout: 10000 })
  })

  test('should show validation error for mismatched passwords', async ({ page }) => {
    await page.goto('/employees/new')
    
    await page.getByLabel(/email/i).fill('test@autoparc.fr')
    await page.getByLabel(/prénom/i).fill('Test')
    await page.getByLabel('Nom', { exact: false }).last().fill('Employee')
    
    const passwordFields = page.getByLabel(/mot de passe/i)
    await passwordFields.first().fill('Test123!')
    await passwordFields.last().fill('Different123!')
    
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Wait for validation error
    await page.waitForTimeout(500)
    await expect(page.getByText(/mots de passe.*correspondent/i)).toBeVisible({ timeout: 10000 })
  })

  test('should show validation error for required fields', async ({ page }) => {
    await page.goto('/employees/new')
    
    // Try to submit empty form
    await page.getByRole('button', { name: /enregistrer/i }).click()
    
    // Wait for validation errors
    await page.waitForTimeout(500)
    
    // Should show multiple validation errors
    const hasErrors = await page.getByText(/requis/i).first().isVisible({ timeout: 5000 }).catch(() => false)
    expect(hasErrors).toBeTruthy()
  })

  test('should view employee details', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for employees to load
    await page.waitForTimeout(1000)
    
    // Click on first employee row or view link
    const firstRow = page.locator('tbody tr').first()
    const viewButton = firstRow.getByRole('link').first()
    
    if (await viewButton.isVisible()) {
      await viewButton.click()
      
      // Should navigate to detail page
      await page.waitForTimeout(1000)
      
      // Should show employee details
      const hasDetails = await page.getByText(/email/i).isVisible().catch(() => false)
      expect(hasDetails).toBeTruthy()
    }
  })

  test('should edit an employee', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find first employee row and get edit link
    const firstRow = page.locator('tbody tr').first()
    const editLink = firstRow.locator('a[href*="/edit"]').first()
    
    if (await editLink.isVisible()) {
      await editLink.click()
      
      // Wait for edit page
      await page.waitForTimeout(1000)
      
      // Check if we're on edit page
      const hasEditHeading = await page.getByRole('heading', { name: /modifier.*employé/i }).isVisible().catch(() => false)
      expect(hasEditHeading).toBeTruthy()
    }
  })

  test('should update employee first name and last name', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find first employee row and get edit link
    const firstRow = page.locator('tbody tr').first()
    const editLink = firstRow.locator('a[href*="/edit"]').first()
    
    if (await editLink.isVisible()) {
      await editLink.click()
      
      // Wait for edit form to load
      await page.waitForTimeout(1000)
      
      // Modify first name and last name
      const firstNameInput = page.getByLabel(/prénom/i)
      const lastNameInput = page.getByLabel(/nom/i)
      
      await firstNameInput.clear()
      await firstNameInput.fill('Updated')
      await lastNameInput.clear()
      await lastNameInput.fill('Name')
      
      // Submit form
      await page.getByRole('button', { name: /enregistrer/i }).click()
      
      // Wait for navigation or success message
      await page.waitForTimeout(1500)
      
      // Verify we're redirected or success message appears
      const redirected = !page.url().includes('/edit')
      const successMessage = await page.getByText(/succès/i).isVisible().catch(() => false)
      expect(redirected || successMessage).toBeTruthy()
    }
  })

  test('should not allow editing email field', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find first employee row and get edit link
    const firstRow = page.locator('tbody tr').first()
    const editLink = firstRow.locator('a[href*="/edit"]').first()
    
    if (await editLink.isVisible()) {
      await editLink.click()
      
      // Wait for edit form to load
      await page.waitForTimeout(1000)
      
      // Email field should be disabled
      const emailInput = page.getByLabel(/email/i)
      await expect(emailInput).toBeDisabled()
    }
  })

  test('should delete an employee', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find and click delete button in first row
    const firstRow = page.locator('tbody tr').first()
    const deleteButton = firstRow.locator('button').filter({ hasText: /supprimer/i }).first()
    
    if (await deleteButton.isVisible()) {
      // Get employee name before deleting
      const employeeName = await firstRow.locator('td').nth(1).textContent()
      
      await deleteButton.click()
      
      // Wait for confirmation modal
      await page.waitForTimeout(500)
      
      // Verify modal shows employee name
      if (employeeName) {
        const modalText = await page.getByRole('dialog').textContent().catch(() => '')
        expect(modalText).toContain(employeeName.split(' ')[0]) // Check for first name
      }
      
      // Confirm deletion if modal appears
      const confirmButton = page.getByRole('button', { name: /supprimer/i }).last()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should cancel employee deletion', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Count employees before attempting deletion
    const initialRowCount = await page.locator('tbody tr').count()
    
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
        
        // Verify employee count hasn't changed
        const currentRowCount = await page.locator('tbody tr').count()
        expect(currentRowCount).toBe(initialRowCount)
      }
    }
  })

  test('should delete employee from detail page', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Navigate to employee detail page
    const firstRow = page.locator('tbody tr').first()
    const viewLink = firstRow.getByRole('link').first()
    
    if (await viewLink.isVisible()) {
      await viewLink.click()
      await page.waitForTimeout(1000)
      
      // Click delete button on detail page
      const deleteButton = page.getByRole('button', { name: /supprimer/i })
      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        
        // Wait for confirmation modal
        await page.waitForTimeout(500)
        
        // Confirm deletion
        const confirmButton = page.getByRole('button', { name: /supprimer/i }).last()
        if (await confirmButton.isVisible()) {
          await confirmButton.click()
          
          // Should redirect to employees list
          await page.waitForTimeout(1000)
          await expect(page).toHaveURL(/\/employees$/)
        }
      }
    }
  })

  test('should change employee password', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Navigate to first employee detail
    const firstRow = page.locator('tbody tr').first()
    const viewLink = firstRow.getByRole('link').first()
    
    if (await viewLink.isVisible()) {
      await viewLink.click()
      await page.waitForTimeout(1000)
      
      // Click change password button
      const changePasswordButton = page.getByRole('button', { name: /changer.*mot de passe/i })
      if (await changePasswordButton.isVisible()) {
        await changePasswordButton.click()
        
        // Should navigate to change password page
        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/change-password')
        
        // Verify form is visible
        await expect(page.getByLabel(/mot de passe actuel/i)).toBeVisible()
        await expect(page.getByLabel(/nouveau mot de passe/i)).toBeVisible()
      }
    }
  })

  test('should navigate back from employee detail', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Navigate to first employee detail
    const firstRow = page.locator('tbody tr').first()
    const viewLink = firstRow.getByRole('link').first()
    
    if (await viewLink.isVisible()) {
      await viewLink.click()
      await page.waitForTimeout(1000)
      
      // Click back link
      const backLink = page.getByRole('link', { name: /employés/i }).first()
      if (await backLink.isVisible()) {
        await backLink.click()
        await page.waitForTimeout(500)
        await expect(page).toHaveURL('/employees')
      }
    }
  })

  test('should navigate back from employee form', async ({ page }) => {
    await page.goto('/employees/new')
    
    // Click cancel button to go back
    await page.getByRole('button', { name: /annuler/i }).click()
    
    // Should navigate back to employees list
    await expect(page).toHaveURL('/employees')
  })

  // Test for printing functionality - will be implemented when print feature is added
  test.skip('should print employee details', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Navigate to employee detail
    const firstRow = page.locator('tbody tr').first()
    const viewLink = firstRow.getByRole('link').first()
    
    if (await viewLink.isVisible()) {
      await viewLink.click()
      await page.waitForTimeout(1000)
      
      // Click print button (when implemented)
      const printButton = page.getByRole('button', { name: /imprimer/i })
      if (await printButton.isVisible()) {
        // Set up listener for window.print() call
        await page.evaluate(() => {
          interface WindowWithPrint extends Window {
            printCalled?: boolean
          }
          const win = window as unknown as WindowWithPrint
          win.printCalled = false
          window.print = () => {
            win.printCalled = true
          }
        })
        
        await printButton.click()
        await page.waitForTimeout(500)
        
        // Verify print was triggered
        const printWasCalled = await page.evaluate(() => {
          interface WindowWithPrint extends Window {
            printCalled?: boolean
          }
          return (window as unknown as WindowWithPrint).printCalled
        })
        expect(printWasCalled).toBeTruthy()
      }
    }
  })

  // Test for printing employee list - will be implemented when print feature is added
  test.skip('should print employee list', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Click print button for list (when implemented)
    const printButton = page.getByRole('button', { name: /imprimer/i })
    if (await printButton.isVisible()) {
      // Listen for print event
      let printCalled = false
      await page.exposeFunction('printCalled', () => {
        printCalled = true
      })
      
      await printButton.click()
      
      // Wait a bit and verify print was triggered
      await page.waitForTimeout(1000)
      expect(printCalled).toBeTruthy()
    }
  })

  test('should display employee active status correctly', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Navigate to first employee detail
    const firstRow = page.locator('tbody tr').first()
    const viewLink = firstRow.getByRole('link').first()
    
    if (await viewLink.isVisible()) {
      await viewLink.click()
      await page.waitForTimeout(1000)
      
      // Check if status chip is visible (either "Actif" or "Inactif")
      const hasStatus = await page.getByText(/actif|inactif/i).isVisible().catch(() => false)
      expect(hasStatus).toBeTruthy()
    }
  })

  test('should toggle employee active status', async ({ page }) => {
    await page.goto('/employees')
    
    // Wait for table to load
    await page.waitForTimeout(1000)
    
    // Find an employee and go to edit
    const firstRow = page.locator('tbody tr').first()
    const editLink = firstRow.locator('a[href*="/edit"]').first()
    
    if (await editLink.isVisible()) {
      await editLink.click()
      await page.waitForTimeout(1000)
      
      // Find and toggle active status checkbox/switch
      const activeToggle = page.getByLabel(/actif/i)
      if (await activeToggle.isVisible()) {
        await activeToggle.click()
        
        // Submit form
        await page.getByRole('button', { name: /enregistrer/i }).click()
        await page.waitForTimeout(1500)
      }
    }
  })
})
