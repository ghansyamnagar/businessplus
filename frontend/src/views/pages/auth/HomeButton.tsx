import Link from '@/components/Link'
import { Locale } from '@/configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
import { Button } from '@mui/material'
import { useParams } from 'next/navigation'
import React from 'react'

const HomeButton = () => {
  const { lang: locale } = useParams()

  return (
    <div>
      <Button
        component={Link}
        href={getLocalizedUrl('/home', locale as Locale)}
        variant='outlined'
        className='absolute top-4 right-4 hover:bg-[#666cff] hover:text-white'
      >
        Home
      </Button>
    </div>
  )
}

export default HomeButton
