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
import { addUnitRequest, editUnitRequest } from '@/redux-store/slices/user/user.slice'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

// Types Imports
import type { UnitsType } from '@/types/apps/unitTypes'

type EditUserInfoProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: UnitsType
}

const schema = object({
    unit_name: pipe(string(), nonEmpty('Unit name is required'), minLength(1, 'Unit name is required')),
    unit_address: pipe(string(), nonEmpty('Unit address is required'), minLength(1, 'Unit address is required'))
})

type FormData = InferInput<typeof schema>

const AddEditUnitInfo = ({ open, handleClose, data }: EditUserInfoProps) => {
    const dispatch = useDispatch()
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            unit_name: '',
            unit_address: ''
        }
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open) return

        if (data?.id) {
            // Edit Mode
            reset({
                unit_name: data.unit_name || '',
                unit_address: data.unit_address || ''
            })
        } else {
            // Add Mode
            reset({
                unit_name: '',
                unit_address: ''
            })
        }
    }, [open, data?.id])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset({
            unit_name: '',
            unit_address: ''
        })
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        setLoading(true)
        const commonPayload = {
            enable: 'Yes',
            ...formData
        }

        if (data?.id) {
            // Edit mode
            dispatch(editUnitRequest({
                payload: {
                    ...commonPayload,
                    id: data.id
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'Unit updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating unit')
                    }
                    setLoading(false)
                }
            }))
        } else {
            // Add mode
            dispatch(addUnitRequest({
                payload: commonPayload,
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'Unit added successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error adding unit')
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
                <div className='max-sm:is-[80%] max-sm:text-center'>{data ? 'Edit' : 'Add'} Unit Information</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='unit_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Unit name'
                                        placeholder='Unit name'
                                        error={!!errors.unit_name}
                                        helperText={errors.unit_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='unit_address'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Unit address'
                                        placeholder='Unit address'
                                        error={!!errors.unit_address}
                                        helperText={errors.unit_address?.message}
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

export default AddEditUnitInfo
