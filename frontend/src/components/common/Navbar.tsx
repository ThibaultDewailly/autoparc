import { Link } from 'react-router-dom'
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@nextui-org/react'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES, FRENCH_LABELS } from '@/utils/constants'

export function Navbar() {
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
  }

  return (
    <NextUINavbar isBordered maxWidth="full">
      <NavbarBrand>
        <Link to={ROUTES.dashboard} className="font-bold text-xl text-inherit">
          AutoParc
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link
            to={ROUTES.dashboard}
            className="text-foreground hover:text-primary"
          >
            {FRENCH_LABELS.dashboard}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link to={ROUTES.cars} className="text-foreground hover:text-primary">
            {FRENCH_LABELS.cars}
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              className="transition-transform"
              name={user ? `${user.firstName} ${user.lastName}` : ''}
              size="sm"
              color="primary"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu">
            <DropdownItem key="profile" className="h-14 gap-2 text-foreground">
              <p className="font-semibold">{user?.email}</p>
              <p className="text-sm">
                {user?.firstName} {user?.lastName}
              </p>
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={handleLogout} className="text-foreground">
              {FRENCH_LABELS.logout}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </NextUINavbar>
  )
}
