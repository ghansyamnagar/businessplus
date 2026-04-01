'use client'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// Third-party Imports
import { useSession } from 'next-auth/react'
import { IconButton, Typography } from '@mui/material'

// Component Imports
import BusinessYearSelector from '@components/layout/shared/BusinessYearSelector'

const SelectedUnitData = () => {
    // Hooks
    const { lang } = useParams()
    const { data: session } = useSession()
    const router = useRouter()
    // Extract unit name safely
    const user = session?.user as any
    const unitName = user?.unit_selected?.unit_name || user?.unit_selected?.name || 'Select Unit'

    const redirectUnitPage = () => {
        router.push(`/${lang}/pages/unit-home`)
    }

    return (
        <div className='flex items-center gap-4'>
            <BusinessYearSelector />
            <div className='flex items-center gap-2'>
                <Typography className='font-medium' color='text.primary'>
                    {unitName}
                </Typography>
                <IconButton className='text-textPrimary' onClick={redirectUnitPage}>
                    <i className='ri-map-pin-line' />
                </IconButton>
            </div>
        </div>
    )
}

export default SelectedUnitData
