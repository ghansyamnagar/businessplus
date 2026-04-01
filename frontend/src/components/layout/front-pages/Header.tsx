'use client'

// React Imports
import { useState, useRef } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import type { Theme } from '@mui/material/styles'
import {
  Typography,
  Badge,
  Avatar,
  Popper,
  Fade,
  Paper,
  ClickAwayListener,
  MenuList,
  Button
} from '@mui/material'
import { styled } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import BusinessYearSelector from '@components/layout/shared/BusinessYearSelector'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { frontLayoutClasses } from '@layouts/utils/layoutClasses'

// Styles Imports
import styles from './styles.module.css'
import { Mode } from '@/@core/types'

// Styled component for badge content
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)',
  [theme.breakpoints.down('sm')]: {
    width: 5,
    height: 5
  }
}))

const Header = ({ mode }: { mode: Mode }) => {
  const { lang } = useParams()
  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const router = useRouter()
  const { data: session } = useSession()

  // Detect window scroll
  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true
  })


  const handleDropdownOpen = () => {
    setOpen(!open)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent)) => {
    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      localStorage.removeItem('allDetailsCompany')
      localStorage.removeItem('userModulePermission')
      sessionStorage.clear()

      // Sign out from the app
      await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL })
    } catch (error) {
      console.error(error)
    }
  }
  const redirectHomePage = () => {
    if (session?.user?.unit_selected?.id) {
      router.push(getLocalizedUrl('/apps/home', lang as Locale))
    } else {
      toast.info('Please select a location')
      router.push(getLocalizedUrl('/pages/unit-home', lang as Locale))
    }
  }
  return (
    <header className={classnames(frontLayoutClasses.header, styles.header)}>
      {/* <div className={classnames(frontLayoutClasses.navbar, styles.navbar, { [styles.headerScrolled]: trigger })}> */}
      <div className={classnames(frontLayoutClasses.navbar, styles.navbar, { [styles.headerScrolled]: trigger })} style={{ maxInlineSize: "1600px" }}>
        <div
          className={classnames(
            frontLayoutClasses.navbarContent,
            styles.navbarContent,
            'flex items-center justify-between'
          )}
        >
          {isBelowLgScreen ? (
            <div className='flex items-center gap-1 sm:gap-2'>
              <IconButton onClick={() => setIsDrawerOpen(true)} className='-mis-1'>
                <i className='ri-menu-line text-[20px]' />
              </IconButton>
              <div className='cursor-pointer' onClick={redirectHomePage}>
                <Logo />
              </div>
              <div className='flex items-center justify-center'>
                <Typography className={classnames('text-center', { 'text-[0.9rem]': isBelowSmScreen })}>
                  Welcome PrcVerse
                </Typography>
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-6'>
              <div className='cursor-pointer' onClick={redirectHomePage}>
                <Logo />
              </div>
              <div className='flex items-center justify-center'>
                <Typography className='text-1xl text-center'>Welcome PrcVerse</Typography>
              </div>
            </div>
          )}
          <div className='flex items-center gap-1 sm:gap-2'>
            <BusinessYearSelector />
            {/* <ModeDropdown /> */}
            <Badge
              ref={anchorRef}
              overlap='circular'
              badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              className='mis-1'
            >
              <Avatar
                alt={session?.user?.name || ''}
                src={session?.user?.profile_picture || undefined}
                onClick={handleDropdownOpen}
                className={classnames('cursor-pointer', {
                  'bs-[32px] is-[32px]': isBelowSmScreen,
                  'bs-[36px] is-[36px]': !isBelowSmScreen
                })}
              />
            </Badge>
            <Popper
              open={open}
              transition
              disablePortal
              placement='bottom-end'
              anchorEl={anchorRef.current}
              className={classnames('z-[1]', {
                'min-is-[160px] !mbs-2': isBelowSmScreen,
                'min-is-[200px] !mbs-3': !isBelowSmScreen
              })}
            >
              {({ TransitionProps, placement }) => (
                <Fade
                  {...TransitionProps}
                  style={{
                    transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
                  }}
                >
                  <Paper elevation={8}>
                    <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                      <MenuList>
                        <div
                          className={classnames('flex items-center', {
                            'plb-1 pli-3': isBelowSmScreen,
                            'plb-1.5 pli-4': !isBelowSmScreen
                          })}
                        >
                          <Button
                            fullWidth
                            variant='contained'
                            color='error'
                            size={isBelowSmScreen ? 'small' : 'medium'}
                            endIcon={
                              <i
                                className={classnames('ri-logout-box-r-line', {
                                  'text-[16px]': isBelowSmScreen,
                                  'text-[18px]': !isBelowSmScreen
                                })}
                              />
                            }
                            onClick={handleUserLogout}
                            sx={{
                              fontSize: isBelowSmScreen ? '0.8rem' : '0.875rem',
                              padding: isBelowSmScreen ? '4px 8px' : '6px 16px'
                            }}
                          >
                            Logout
                          </Button>
                        </div>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Fade>
              )}
            </Popper>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
