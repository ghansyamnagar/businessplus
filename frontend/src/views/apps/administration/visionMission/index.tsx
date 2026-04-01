'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Redux Imports
import { useDispatch } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'

// Third-party Imports
import classnames from 'classnames'

// Slice Imports
import { getVisionMissionRequest } from '@/redux-store/slices/master/master.slice'

// Component Imports
import VisionMissionForm from './VisionMissionForm'
import type { VisionMissionType } from '@/types/apps/visionMissionTypes'
import { useModulePermission } from '@/hooks/useModulePermission'
const VisionMissionList = () => {
    // States
    const [data, setData] = useState<VisionMissionType | null>(null)
    const [fetching, setFetching] = useState(true)
    const [open, setOpen] = useState(false)

    // Hooks
    const dispatch = useDispatch()
    const visionMissionPermission = useModulePermission('Business_plans')
    const fetchData = () => {
        setFetching(true)
        dispatch(getVisionMissionRequest({
            payload: {},
            callback: (response: any, error: any) => {
                if (response && response.status === 'success' && response.data) {
                    setData(response.data)
                }
                setFetching(false)
            }
        }))
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleSuccess = () => {
        handleClose()
        fetchData()
    }

    type CardData = {
        title: string
        icon: string
        color: string
        content: string
    }

    const cards: CardData[] = [
        {
            title: 'Vision',
            icon: 'ri-eye-line',
            color: 'primary.main', // Purple/Primary
            content: data?.vision || 'No vision statement added yet.'
        },
        {
            title: 'Mission',
            icon: 'ri-flag-line',
            color: 'success.main', // Green
            content: data?.mission || 'No mission statement added yet.'
        },
        {
            title: 'Values',
            icon: 'ri-star-line',
            color: 'warning.main', // Orange/Yellow
            content: data?.values || 'No values added yet.'
        },
        {
            title: 'Message of CEO',
            icon: 'ri-chat-quote-line',
            color: 'info.main', // Blue
            content: data?.message_of_ceo || 'No message from CEO added yet.'
        },
        {
            title: 'Highlights',
            icon: 'ri-lightbulb-line',
            color: 'secondary.main', // Grey/Secondary
            content: data?.highlights || 'No highlights added yet.'
        }
    ]

    if (fetching) {
        return <div className="flex justify-center p-10"><CircularProgress /></div>
    }

    if (visionMissionPermission && visionMissionPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Vision & Mission' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Vision & Mission.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }} className='flex justify-between items-center'>
                <Typography variant='h4'>Vision & Mission</Typography>
                {visionMissionPermission?.acc_edit === 1 && (
                    <Button
                        variant='contained'
                        startIcon={<i className='ri-pencil-line' />}
                        onClick={handleEdit}
                    >
                        Edit
                    </Button>
                )}
            </Grid>

            {cards.map((card, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Card className='h-full'>
                        <CardContent className='flex flex-col gap-4'>
                            <div className='flex items-center gap-4'>
                                <Avatar
                                    variant='rounded'
                                    sx={{
                                        backgroundColor: card.color,
                                        width: 50,
                                        height: 50
                                    }}
                                >
                                    <i className={classnames(card.icon, 'text-2xl text-white')} />
                                </Avatar>
                                <Typography variant='h5'>{card.title}</Typography>
                            </div>
                            <Typography
                                variant='body1'
                                color='text.secondary'
                                component='div'
                                dangerouslySetInnerHTML={{ __html: card.content }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            ))}

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth='md'
                fullWidth
                scroll='body'
            >
                <DialogContent className='relative p-0'>
                    <IconButton
                        size='small'
                        onClick={handleClose}
                        className='absolute right-4 top-4 text-textSecondary z-[1]'
                    >
                        <i className='ri-close-line' />
                    </IconButton>
                    <VisionMissionForm onSuccess={handleSuccess}
                        initialData={data} />
                </DialogContent>
            </Dialog>
        </Grid>
    )
}

export default VisionMissionList
