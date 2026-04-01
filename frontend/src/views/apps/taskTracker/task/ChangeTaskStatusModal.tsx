import { useState, useRef, useEffect, type ChangeEvent } from 'react'
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
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

import type { AppDispatch } from '@/redux-store'
import { addTaskRemarkRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'

const schema = object({
    remark: pipe(string(), nonEmpty('Remark is required')),
    status_id: pipe(string(), nonEmpty('Status is required')),
})

type FormData = InferInput<typeof schema>

interface ChangeTaskStatusModalProps {
    open: boolean
    onClose: () => void
    taskId: number | null,
    statusId: any,
    statuses: any[]
    onSuccess: () => void
}

const ChangeTaskStatusModal = ({
    open,
    onClose,
    taskId,
    statusId,
    statuses,
    onSuccess
}: ChangeTaskStatusModalProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            remark: '',
            status_id: statusId
        }
    })

    useEffect(() => {
        if (!open) {
            reset({
                remark: '',
                status_id: statusId
            })
            setSelectedFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }, [open, reset])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target
        if (files && files.length > 0) {
            setSelectedFile(files[0])
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const onSubmit = (formData: FormData) => {
        if (!taskId) {
            toast.error('Task ID is missing')
            return
        }

        setLoading(true)

        const payload: any = {
            remark: formData.remark,
            status_id: Number(formData.status_id),
            task_id: Number(taskId),
            upload_id: selectedFile || undefined
        }

        dispatch(addTaskRemarkRequest({
            payload,
            callback: (res: any) => {
                setLoading(false)
                if (res?.status === 'success') {
                    toast.success(res.message || 'Status updated successfully')
                    onClose()
                    onSuccess()
                } else {
                    toast.error(res?.message || 'Error updating status')
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Change Task Status
                <IconButton size='small' onClick={onClose}>
                    <i className='ri-close-line' />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Controller
                            name='status_id'
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    select
                                    fullWidth
                                    {...field}
                                    label='Status'
                                    error={!!errors.status_id}
                                    helperText={errors.status_id?.message}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: { style: { maxHeight: 250 } }
                                        }
                                    }}
                                >
                                    {statuses.map((status: any) => (
                                        <MenuItem key={status.id} value={String(status.id)}>
                                            {status.status_name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Controller
                            name='remark'
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    {...field}
                                    label='Remark'
                                    placeholder='Add a remark'
                                    error={!!errors.remark}
                                    helperText={errors.remark?.message}
                                />
                            )}
                        />

                        <Box>
                            <Button
                                variant='outlined'
                                component='label'
                                startIcon={<i className='ri-upload-2-line' />}
                            >
                                Upload File
                                <input
                                    type='file'
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                            </Button>
                            {selectedFile && (
                                <Chip
                                    label={selectedFile.name}
                                    onDelete={handleRemoveFile}
                                    sx={{ ml: 2, mt: 1 }}
                                    variant='outlined'
                                    color='primary'
                                />
                            )}
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[120px]'>
                        {loading ? <CircularProgress size={20} color='inherit' /> : 'Update Status'}
                    </Button>
                    <Button variant='outlined' color='secondary' type='reset' onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default ChangeTaskStatusModal
