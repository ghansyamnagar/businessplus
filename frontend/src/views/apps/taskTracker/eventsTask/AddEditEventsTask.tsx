
'use client'

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

import { addEventsTaskRequest, updateEventsTaskRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'
import type { EventsTaskType } from '@/redux-store/slices/taskTracker/taskTracker.types'

const schema = object({
    event_name: pipe(string(), nonEmpty('Event Name is required')),
    event_area: pipe(string(), nonEmpty('Event Area is required')),
    event_objective: pipe(string(), nonEmpty('Event Objective is required')),
    event_description: pipe(string(), nonEmpty('Event Description is required'))
})

type FormData = InferInput<typeof schema>

interface AddEditEventsTaskProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    dataEdit?: EventsTaskType
}

const AddEditEventsTask = ({ open, handleClose, dataEdit }: AddEditEventsTaskProps) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            event_name: '',
            event_area: '',
            event_objective: '',
            event_description: ''
        }
    })

    useEffect(() => {
        if (open && dataEdit) {
            reset({
                event_name: dataEdit.event_name,
                event_area: dataEdit.event_area,
                event_objective: dataEdit.event_objective,
                event_description: dataEdit.event_description
            })
        } else if (open && !dataEdit) {
            reset({
                event_name: '',
                event_area: '',
                event_objective: '',
                event_description: ''
            })
        }
    }, [open, dataEdit, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset()
    }

    const onSubmit = (data: any) => {
        setLoading(true)
        if (dataEdit) {
            dispatch(updateEventsTaskRequest({
                payload: {
                    ...data,
                    events_id: dataEdit.id
                },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating')
                    }
                    setLoading(false)
                }
            }))
        } else {
            dispatch(addEventsTaskRequest({
                payload: data,
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Added successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error adding')
                    }
                    setLoading(false)
                }
            }))
        }
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={() => handleDialogClose(false)}
            maxWidth='sm'
            scroll='body'
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>{dataEdit ? 'Edit' : 'Add'} Event</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='event_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label='Event Name'
                                        fullWidth
                                        error={!!errors.event_name}
                                        helperText={errors.event_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='event_area'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label='Event Area'
                                        fullWidth
                                        error={!!errors.event_area}
                                        helperText={errors.event_area?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='event_objective'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label='Event Objective'
                                        fullWidth
                                        error={!!errors.event_objective}
                                        helperText={errors.event_objective?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='event_description'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label='Event Description'
                                        fullWidth
                                        multiline
                                        rows={4}
                                        error={!!errors.event_description}
                                        helperText={errors.event_description?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[120px]'>
                        {loading ? <CircularProgress size={22} color='inherit' /> : dataEdit ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' type='reset' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditEventsTask
