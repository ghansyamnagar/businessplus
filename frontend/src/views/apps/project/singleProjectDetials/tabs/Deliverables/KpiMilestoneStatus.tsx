'use client'

import { useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Redux Imports
import { updateProjectRequest } from '@/redux-store/slices/project/project.slice'

interface FormValues {
    milestone_id: string | number
    project_id: string | number
    projct_kpi_dstrbt_vl: string | number
    project_kpi_actual: string | number
    kpi_mile_stone_id: string | number
    milestone_name: string
    project_kpi_status: string
    sr_no: string | number
    project_kpi_reason: string
    project_kpi_solution: string
    projectDetails: string
}

const KpiMilestoneStatus = ({ open, handleClose, data, projectData }: {
    open: boolean,
    handleClose: (refresh: boolean) => void,
    data: any,
    projectData: any
}) => {
    const dispatch = useDispatch()
    const { data: session }: any = useSession()

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            milestone_id: data?.milestone_id || '',
            project_id: data?.project_id || '',
            projct_kpi_dstrbt_vl: data?.projct_kpi_dstrbt_vl || '',
            project_kpi_actual: data?.project_kpi_actual || '',
            kpi_mile_stone_id: data?.kpi_mile_stone_id || '',
            milestone_name: data?.milestone_name || '',
            project_kpi_status: data?.project_kpi_status || '',
            sr_no: data?.project_kpi_sr_no || '',
            project_kpi_reason: data?.project_kpi_reason || '',
            project_kpi_solution: data?.project_kpi_solution || '',
            projectDetails: 'kpiProject'
        }
    })

    const watchedActual = useWatch({ control, name: 'project_kpi_actual' })
    const targetValue = data?.projct_kpi_dstrbt_vl

    useEffect(() => {
        if (targetValue && watchedActual !== undefined && watchedActual !== '') {
            const actual = parseFloat(String(watchedActual))
            const target = parseFloat(String(targetValue))

            if (target > actual) {
                const change = (actual / target) * 100
                if (change >= 90) {
                    setValue('project_kpi_status', 'Yellow')
                } else {
                    setValue('project_kpi_status', 'Red')
                }
            } else {
                setValue('project_kpi_status', 'Green')
            }
        }
    }, [watchedActual, targetValue, setValue])

    const onSubmit = (formData: FormValues) => {
        if (parseFloat(String(formData.project_kpi_actual)) > parseFloat(String(formData.projct_kpi_dstrbt_vl))) {
            toast.error("Actual value should be lesser or equal to target value")
            return
        }

        const payload = {
            ...formData,
        }

        dispatch(updateProjectRequest({
            payload,
            callback: (res: any) => {
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Status updated successfully')
                    handleClose(true)
                } else {
                    toast.error(res?.message || 'Error updating status')
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={() => handleClose(false)} maxWidth='sm' fullWidth scroll='body'>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h5'>Kpi Milestone Status</Typography>
                    <IconButton onClick={() => handleClose(false)}>
                        <i className='ri-close-line' />
                    </IconButton>
                </Box>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ pb: 6 }}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label='Milestone'
                                value={data?.milestone_name || ''}
                                disabled
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label='Value'
                                value={data?.projct_kpi_dstrbt_vl || ''}
                                disabled
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='project_kpi_actual'
                                control={control}
                                rules={{ required: 'Actual value is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type='number'
                                        label='Actual value'
                                        error={!!errors.project_kpi_actual}
                                        helperText={errors.project_kpi_actual?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='project_kpi_reason'
                                control={control}
                                rules={{ required: 'Remark is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Remark'
                                        error={!!errors.project_kpi_reason}
                                        helperText={errors.project_kpi_reason?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='project_kpi_solution'
                                control={control}
                                rules={{ required: 'Solution is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Solution'
                                        error={!!errors.project_kpi_solution}
                                        helperText={errors.project_kpi_solution?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 6, pb: 6 }}>
                    <Button type='submit' variant='contained' color='primary'>Submit</Button>
                    <Button variant='outlined' color='secondary' onClick={() => handleClose(false)}>Cancel</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default KpiMilestoneStatus
