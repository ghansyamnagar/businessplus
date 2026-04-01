'use client'

import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, number, check } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'

// MUI Imports
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

// Redux Imports
import { addProjectRequest, updateProjectRequest } from '@/redux-store/slices/project/project.slice'
import { getSelectModulesRequest } from '@/redux-store/slices/master/master.slice'

const schema = object({
    risk_item: pipe(string(), nonEmpty('Risk item is required')),
    risk_time_required: pipe(string(), nonEmpty('Time required is required')),
    risk_level: pipe(number(), check((val) => val > 0, 'Risk level is required')),
    risk_responsibility: pipe(number(), check((val) => val > 0, 'Responsibility is required')),
    risk_mtiqation_plan: pipe(string(), nonEmpty('Mitigation plan is required'))
})

type FormData = InferInput<typeof schema>

interface AddEditRiskAccessmentLogProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: any
    projectData: any
}

const AddEditRiskAccessmentLog = ({ open, handleClose, data, projectData }: AddEditRiskAccessmentLogProps) => {
    // Hooks
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [taskDataPriorities, setTaskDataPriorities] = useState<any[]>([])

    const members = projectData?.project_member_data || []
    const isEdit = !!data

    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            risk_item: '',
            risk_time_required: '',
            risk_level: 0,
            risk_responsibility: 0,
            risk_mtiqation_plan: ''
        }
    })

    useEffect(() => {
        // Fetch priorities
        dispatch(getSelectModulesRequest({
            payload: {},
            callback: (res: any) => {
                if (res?.status === 'success') {
                    setTaskDataPriorities(res.data?.priorities || [])
                }
            }
        }))
    }, [dispatch])

    useEffect(() => {
        if (open && data) {
            reset({
                risk_item: data.risk_item || '',
                risk_time_required: data.risk_time_required || '',
                risk_level: Number(data.risk_level) || 0,
                risk_responsibility: Number(data.risk_responsibility) || 0,
                risk_mtiqation_plan: data.risk_mtiqation_plan || ''
            })
        } else if (open) {
            reset({
                risk_item: '',
                risk_time_required: '',
                risk_level: 0,
                risk_responsibility: 0,
                risk_mtiqation_plan: ''
            })
        }
    }, [open, data, reset])

    const onSubmit = (formData: FormData) => {
        setLoading(true)

        const payload: any = {
            ...formData,
            project_id: projectData?.projectData?.[0]?.id,
            projectDetails: 'RiskAccessmentLog'
        }

        if (isEdit) {
            payload.id = data.id
        }

        const actionRequest = isEdit ? updateProjectRequest : addProjectRequest

        dispatch(actionRequest({
            payload: payload,
            callback: (res: any) => {
                setLoading(false)
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || `Risk log ${isEdit ? 'updated' : 'added'} successfully`)
                    handleClose(true)
                } else {
                    toast.error(res?.message || `Failed to ${isEdit ? 'update' : 'add'} risk log`)
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={() => handleClose(false)} fullWidth maxWidth='sm'>
            <DialogTitle variant='h5' className='flex flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                {isEdit ? 'Edit' : 'Add'} Risk Accessment Log
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible'>
                    <IconButton onClick={() => handleClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='risk_item'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label='Risk Item'
                                        error={!!errors.risk_item}
                                        helperText={errors.risk_item?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='risk_time_required'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Time Required'
                                        error={!!errors.risk_time_required}
                                        helperText={errors.risk_time_required?.message}
                                    >
                                        <MenuItem value=''>Select Time</MenuItem>
                                        <MenuItem value='Less'>Less</MenuItem>
                                        <MenuItem value='Medium'>Medium</MenuItem>
                                        <MenuItem value='More'>More</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='risk_level'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Risk Level'
                                        error={!!errors.risk_level}
                                        helperText={errors.risk_level?.message}
                                    >
                                        <MenuItem value={0}>Select Priority</MenuItem>
                                        {taskDataPriorities.map((priority: any, index: number) => (
                                            <MenuItem key={`priority-${priority.id}-${index}`} value={Number(priority.id)}>
                                                {priority.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='risk_responsibility'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Responsibility'
                                        error={!!errors.risk_responsibility}
                                        helperText={errors.risk_responsibility?.message}
                                    >
                                        <MenuItem value={0}>Select Member</MenuItem>
                                        {members.map((m: any, index: number) => (
                                            <MenuItem key={`member-${m.user_id}-${index}`} value={Number(m.user_id)}>
                                                {m.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='risk_mtiqation_plan'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label='Mitigation Plan'
                                        error={!!errors.risk_mtiqation_plan}
                                        helperText={errors.risk_mtiqation_plan?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='sm:pli-8 sm:pbe-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[100px]'>
                        {loading ? <CircularProgress size={20} color='inherit' /> : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => handleClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditRiskAccessmentLog
