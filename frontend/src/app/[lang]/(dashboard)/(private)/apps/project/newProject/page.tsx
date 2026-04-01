'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import NewProject from '@/views/apps/project/newProject/NewProject'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

const NewProjectContent = () => {
    const searchParams = useSearchParams()
    const editId = searchParams.get('edit')
    const stepId = searchParams.get('step')

    return (
        <NewProject
            editProjectId={editId ? Number(editId) : null}
            editStepId={stepId ? Number(stepId) : null}
        />
    )
}

const NewProjectPage = () => {
    return (
        <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress />
            </Box>
        }>
            <NewProjectContent />
        </Suspense>
    )
}

export default NewProjectPage
