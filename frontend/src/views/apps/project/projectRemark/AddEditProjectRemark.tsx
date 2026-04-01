'use client'

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

import { remarkProjectRequest, editProjectRemarkRequest } from '@/redux-store/slices/project/project.slice'
import { getSelectModulesRequest } from '@/redux-store/slices/master/master.slice'

const schema = object({
    remark: pipe(string(), nonEmpty('Remark is required')),
    status_id: pipe(string(), nonEmpty('Status is required')),
})

type FormData = InferInput<typeof schema>

interface AddEditProjectRemarkProps {
    open: boolean
    handleClose: () => void
    data?: any
    projectId: string
    refresh: () => void
}

const AddEditProjectRemark = ({ open, handleClose, data, projectId, refresh }: AddEditProjectRemarkProps) => {
    const dispatch = useDispatch()
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [statuses, setStatuses] = useState<any[]>([])
    const [file, setFile] = useState<File | null>(null)

    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            remark: '',
            status_id: ''
        }
    })

    useEffect(() => {
        if (open) {
            dispatch(getSelectModulesRequest({
                payload: {},
                callback: (res: any) => {
                    if (res?.status === 'success') {
                        setStatuses(res?.data?.status || [])
                    }
                }
            }))

            if (data) {
                reset({
                    remark: data.remark || '',
                    status_id: String(data.status_id)
                })
            } else {
                reset({
                    remark: '',
                    status_id: ''
                })
                setFile(null)
            }
        }
    }, [open, data, reset, dispatch])

    const onSubmit = (formData: FormData) => {
        setLoading(true)
        const currentUser = session?.user as any

        if (data) {
            // Edit — JSON payload
            const payload = {
                status_id: Number(formData.status_id),
                remark: formData.remark,
                project_id: Number(projectId),
                project_remark_id: data.project_remark_id,
                user_id: Number(currentUser?.id)
            }

            dispatch(editProjectRemarkRequest({
                payload,
                callback: (res: any, err: any) => {
                    setLoading(false)
                    if (res && res.status === 'success') {
                        toast.success('Remark updated successfully')
                        refresh()
                        handleClose()
                    } else {
                        // console.log("api response", res);
                        // console.log("api error", err)
                        // toast.error(err?.message || 'Failed to update remark')
                        const errorMessage =
                            res?.message || err?.response?.data?.message
                        toast.error(errorMessage)
                    }
                }
            }))
        } else {
            // Add — FormData payload (multipart for file upload)
            const fd = new FormData()
            fd.append('status_id', formData.status_id)
            fd.append('remark', formData.remark)
            fd.append('project_id', projectId)
            if (file) {
                fd.append('upload_id', file)
            }

            dispatch(remarkProjectRequest({
                payload: fd,
                callback: (res: any, err: any) => {
                    setLoading(false)
                    if (res && res.status === 'success') {
                        toast.success('Remark added successfully')
                        refresh()
                        handleClose()
                    } else {
                        toast.error(err?.message || 'Failed to add remark')
                    }
                }
            }))
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
            <DialogTitle>{data ? 'Edit' : 'Add'} Project Remark</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
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
                                    >
                                        {statuses.map((status: any) => (
                                            <MenuItem key={status.id} value={String(status.id)}>
                                                {status.status_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='remark'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        {...field}
                                        label='Remark'
                                        error={!!errors.remark}
                                        helperText={errors.remark?.message}
                                    />
                                )}
                            />
                        </Grid>
                        {!data && (
                            <Grid size={{ xs: 12 }}>
                                <Button
                                    component='label'
                                    variant='outlined'
                                    fullWidth
                                    startIcon={<i className='ri-upload-2-line' />}
                                    className='max-w-[200px]'
                                >
                                    {file ? file.name : 'Upload File'}
                                    <input
                                        type='file'
                                        hidden
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} sx={{ minWidth: 140 }}>
                        {loading ? <CircularProgress size={22} color='inherit' /> : data ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' type='reset' onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditProjectRemark
