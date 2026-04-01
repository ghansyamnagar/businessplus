// React Imports
import { useEffect, useState, useRef } from 'react'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, minLength } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'
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
import { createLocationRequest, updateLocationRequest } from '@/redux-store/slices/master/master.slice'

export type LocationType = {
    id: number
    name: string
    description: string
    image?: string
    file?: string
    action?: string
}

type AddEditLocationInfoProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: LocationType
}

const schema = object({
    name: pipe(string(), nonEmpty('Name is required'), minLength(1, 'Name is required')),
    description: pipe(string(), nonEmpty('Description is required'), minLength(1, 'Description is required'))
})

type FormData = InferInput<typeof schema>

const AddEditLocationInfo = ({ open, handleClose, data }: AddEditLocationInfoProps) => {

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
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

        const payload: any = {
            name: formData.name,
            description: formData.description,
            file: imageFile
        }

        if (data?.id) {

            const fd = new FormData()

            fd.append("id", String(data.id))
            fd.append("name", formData.name)
            fd.append("description", formData.description)

            if (imageFile) {
                fd.append("file", imageFile)
            }

            dispatch(
                updateLocationRequest({
                    payload: fd,
                    callback: (res: any, err: any) => {
                        setLoading(false)

                        if (res?.status === 'success') {
                            toast.success(res?.message || 'Location updated successfully')
                            handleDialogClose(true)
                        }

                        if (err) {
                            toast.error(err?.message || 'Failed to update location')
                        }
                    }
                })
            )
        }

        else {
            const fd = new FormData()

            fd.append("name", formData.name)
            fd.append("description", formData.description)

            if (imageFile) {
                fd.append("file", imageFile)
            }

            dispatch(
                createLocationRequest({
                    payload: fd,
                    callback: (res: any, err: any) => {
                        setLoading(false)

                        if (res?.status === 'success') {
                            toast.success(res?.message || 'Location added successfully')
                            handleDialogClose(true)
                        }

                        if (err) {
                            toast.error(err?.message || 'Failed to create location')
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
                <div className='max-sm:is-[80%] max-sm:text-center'>{data ? 'Edit' : 'Add'} Location</div>
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
                                startIcon={<i className="ri-upload-2-line" />}
                                className="max-w-[200px]"
                            >
                                {imageFile ? imageFile.name : "Upload Image"}
                                <input
                                    type='file'
                                    hidden
                                    accept='*'
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null
                                        setImageFile(file)
                                    }}
                                />
                            </Button>
                            {/* {imageFile && (
                                <Typography
                                    sx={{
                                        mt: 2,
                                        color: "#1976d2",
                                        textDecoration: "underline",
                                        cursor: "pointer"
                                    }}
                                >
                                    {imageFile.name}
                                </Typography>
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

export default AddEditLocationInfo
