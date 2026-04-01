// React Imports
import { useEffect, useState, useRef } from 'react'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, minLength } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'
import { updateCelebrationRequest, createCelebrationRequest } from '@/redux-store/slices/master/master.slice'
import { useDispatch } from 'react-redux'

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
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export type CelebrationType = {
    id: number
    name: string
    description: string
    image?: string
    file?: string
    action?: string
}

type AddEditCelebrationInfoProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: CelebrationType
}

const schema = object({
    name: pipe(string(), nonEmpty('Name is required'), minLength(1, 'Name is required')),
    description: pipe(string(), nonEmpty('Description is required'), minLength(1, 'Description is required'))
})

type FormData = InferInput<typeof schema>

const AddEditCelebrationInfo = ({ open, handleClose, data }: AddEditCelebrationInfoProps) => {
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            name: '',
            description: ''
        }
    })

    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!open) return

        reset({
            name: data?.name || '',
            description: data?.description || ''
        })
        setImagePreview(data?.image || null)
        setImageFile(null)
    }, [open, data, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset({ name: '', description: '' })
        setImagePreview(null)
        setImageFile(null)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setImagePreview(null)
        setImageFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {

        setLoading(true)

        const fd = new FormData()

        fd.append("name", formData.name)
        fd.append("description", formData.description)

        if (imageFile) {
            const extension = imageFile.name.split('.').pop()
            const newFileName = `celebration_${Date.now()}.${extension}`

            fd.append("file", imageFile, newFileName)
        }

        if (data?.id) {

            fd.append("id", String(data.id))

            dispatch(
                updateCelebrationRequest({
                    payload: fd,
                    callback: (res: any, err: any) => {

                        setLoading(false)

                        if (res?.status === 'success') {
                            toast.success(res?.message || 'Celebration updated successfully')
                            handleDialogClose(true)
                        }

                        if (err) {
                            toast.error(err?.message || 'Failed to update celebration')
                        }

                    }
                })
            )
        }

        else {

            dispatch(
                createCelebrationRequest({
                    payload: fd,
                    callback: (res: any, err: any) => {

                        setLoading(false)

                        if (res?.status === 'success') {
                            toast.success(res?.message || 'Celebration added successfully')
                            handleDialogClose(true)
                        }

                        if (err) {
                            toast.error(err?.message || 'Failed to create celebration')
                        }

                    }
                })
            )
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
                <div className='max-sm:is-[80%] max-sm:text-center'>{data ? 'Edit' : 'Add'} Celebration</div>
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
                                        label='Name'
                                        placeholder='Enter Name'
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='description'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label='Description'
                                        placeholder='Enter Description'
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography className='mbe-1' color='text.primary'>Image</Typography>
                            <Button
                                variant='outlined'
                                component='label'
                                startIcon={<i className='ri-upload-2-line' />}
                                className="max-w-[200px]"
                            >
                                {imageFile ? imageFile.name : "Upload Image"}
                                <input
                                    type='file'
                                    hidden
                                    accept='*'
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                />
                            </Button>
                            {/* {imagePreview && (
                                <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                                    <img
                                        src={imagePreview}
                                        alt='Preview'
                                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                                    />
                                    <IconButton
                                        size='small'
                                        onClick={handleRemoveImage}
                                        sx={{
                                            position: 'absolute',
                                            top: -8,
                                            right: -8,
                                            backgroundColor: 'background.paper',
                                            boxShadow: 1,
                                            '&:hover': { backgroundColor: 'action.hover' }
                                        }}
                                    >
                                        <i className='ri-close-line' style={{ fontSize: '16px' }} />
                                    </IconButton>
                                </Box>
                            )} */}
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

export default AddEditCelebrationInfo
