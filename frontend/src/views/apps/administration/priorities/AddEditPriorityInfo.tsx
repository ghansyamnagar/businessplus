// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, minLength } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Slice Imports
import { addPriorityRequest, updatePriorityRequest } from '@/redux-store/slices/master/master.slice'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

// Types Imports
import type { PriorityType } from '@/types/apps/priorityTypes'

type AddEditPriorityInfoProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: PriorityType
}

const schema = object({
    name: pipe(string(), nonEmpty('Priority name is required'), minLength(1, 'Priority name is required'))
})

type FormData = InferInput<typeof schema>

const AddEditPriorityInfo = ({ open, handleClose, data }: AddEditPriorityInfoProps) => {
    const dispatch = useDispatch()
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            name: ''
        }
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            reset({
                name: data?.name || ''
            })
        }
    }, [open, data, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset({
            name: ''
        })
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        setLoading(true)

        if (data?.id) {
            // Edit mode
            dispatch(updatePriorityRequest({
                payload: {
                    name: formData.name,
                    id: data.id
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'Priority updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating Priority')
                    }
                    setLoading(false)
                }
            }))
        } else {
            // Add mode
            dispatch(addPriorityRequest({
                payload: {
                    name: formData.name
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'Priority added successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error adding Priority')
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
            maxWidth={false}
            scroll='body'
            PaperProps={{ className: 'max-is-[600px]' }}
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>{data ? 'Edit' : 'Add'} Priority</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Priority Name'
                                        placeholder='High, Low, etc.'
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[120px]'>
                        {loading ? <CircularProgress size={22} color='inherit' /> : data ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' type='reset' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditPriorityInfo
