'use client'

import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, optional, check, forward } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'
import { format, parse, isValid } from 'date-fns'

// MUI Imports
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
import InputAdornment from '@mui/material/InputAdornment'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Redux Imports
import type { AppDispatch } from '@/redux-store'
import { remarkIssueTrackerRequest } from '@/redux-store/slices/project/project.slice'
import { getSelectModulesRequest } from '@/redux-store/slices/master/master.slice'

const schema = pipe(
    object({
        remark: pipe(string(), nonEmpty('Remark is required')),
        status_id: pipe(string(), nonEmpty('Status is required')),
        issue_revised_date: optional(string())
    }),
    forward(
        check((input) => {
            if (input.status_id === '2') {
                return !!input.issue_revised_date
            }
            return true
        }, 'Revised Date is required'),
        ['issue_revised_date']
    )
)

type FormData = InferInput<typeof schema>

interface UpdateStatusIssueTrackerProps {
    open: boolean
    onClose: (refresh: boolean) => void
    issueData: any
}

const UpdateStatusIssueTracker = ({
    open,
    onClose,
    issueData
}: UpdateStatusIssueTrackerProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [statuses, setStatuses] = useState<any[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        control,
        reset,
        watch,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            remark: '',
            status_id: String(issueData?.status_id || ''),
            issue_revised_date: ''
        }
    })

    const selectedStatusId = watch('status_id')
    const isRevisedDateNeeded = selectedStatusId === '2'

    useEffect(() => {
        if (open) {
            dispatch(getSelectModulesRequest({
                payload: {},
                callback: (res: any) => {
                    if (res?.status === 'success') {
                        setStatuses(res.data?.status || [])
                    }
                }
            }))
        }
    }, [open, dispatch])

    useEffect(() => {
        if (!open) {
            reset({
                remark: '',
                status_id: String(issueData?.status_id || ''),
                issue_revised_date: ''
            })
            setSelectedFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }, [open, issueData, reset])

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
        if (!issueData?.id) {
            toast.error('Issue ID is missing')
            return
        }

        if (isRevisedDateNeeded && !formData.issue_revised_date) {
            toast.error('Revised Date is required for this status')
            return
        }

        setLoading(true)

        const fd = new FormData()
        fd.append('status_id', formData.status_id)
        fd.append('remark', formData.remark)
        fd.append('issue_id', issueData.id.toString())

        if (isRevisedDateNeeded && formData.issue_revised_date) {
            fd.append('issue_revised_date', formData.issue_revised_date)
        }

        if (selectedFile) {
            fd.append('upload_id', selectedFile)
        }

        dispatch(remarkIssueTrackerRequest({
            payload: fd,
            callback: (res: any) => {
                setLoading(false)
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Status updated successfully')
                    onClose(true)
                } else {
                    toast.error(res?.message || 'Error updating status')
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth='sm' fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Change Issue Status
                <IconButton size='small' onClick={() => onClose(false)}>
                    <i className='ri-close-line' />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
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
                                        <MenuItem value=''>Select Status</MenuItem>
                                        {statuses.map((status: any) => (
                                            <MenuItem key={status.id} value={String(status.id)}>
                                                {status.status_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />

                            {isRevisedDateNeeded && (
                                <Controller
                                    name='issue_revised_date'
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <AppReactDatepicker
                                            selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                                            onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            minDate={new Date()}
                                            placeholderText='YYYY-MM-DD'
                                            dateFormat='yyyy-MM-dd'
                                            customInput={
                                                <TextField
                                                    fullWidth
                                                    label='Revised Date'
                                                    autoComplete='off'
                                                    error={!!errors.issue_revised_date}
                                                    helperText={errors.issue_revised_date?.message}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <InputAdornment position='end'>
                                                                    <i className='ri-calendar-line text-textSecondary' />
                                                                </InputAdornment>
                                                            )
                                                        }
                                                    }}
                                                />
                                            }
                                        />
                                    )}
                                />
                            )}
                        </Box>

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
                                    accept='application/pdf,application/vnd.ms-excel,image/x-png,image/gif,image/jpeg,image/jpg'
                                />
                            </Button>
                            {selectedFile && (
                                <Chip
                                    label={selectedFile.name}
                                    onDelete={handleRemoveFile}
                                    sx={{ ml: 2 }}
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
                    <Button variant='outlined' color='secondary' type='reset' onClick={() => onClose(false)} disabled={loading}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default UpdateStatusIssueTracker
