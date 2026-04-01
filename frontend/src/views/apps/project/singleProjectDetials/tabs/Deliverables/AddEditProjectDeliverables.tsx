'use client'

import { useState, useEffect, Fragment } from 'react'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'
import Tooltip from '@mui/material/Tooltip'

// Redux Imports
import { getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'
import { getUomListRequest } from '@/redux-store/slices/master/master.slice'
import { addProjectRequest, updateProjectRequest, deleteSingleProjectRequest } from '@/redux-store/slices/project/project.slice'

interface Milestone {
    project_id: any
    milestone_id: string | number
    kpi_mile_stone_id: string | number
    projct_kpi_dstrbt_vl: string | number
}

interface FormValues {
    project_kpi_dept: string
    project_kpi_name: string
    project_kpi_def: string
    project_kpi_trend: string
    project_kpi_uom: string | number
    project_kpi_id: string | number
    project_kpi_yr_targt: string
    project_kpi_freqency: string
    project_kpi_value: string | number
    kpi_mile_stone: Milestone[]
}

const AddEditProjectDeliverables = ({ open, handleClose, kpiData, projectData }: {
    open: boolean,
    handleClose: (refresh: boolean) => void,
    kpiData?: any,
    projectData: any
}) => {
    // MenuProps for Select components
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: 250,
                width: 250,
            },
        },
    }

    // Hooks
    const dispatch = useDispatch()
    const { data: session }: any = useSession()

    // States
    const [departments, setDepartments] = useState<any[]>([])
    const [uoms, setUoms] = useState<any[]>([])
    const [kpiValueError, setKpiValueError] = useState<string | null>(null)

    const milestoneList = projectData?.project_milestone_data || []
    const projectId = projectData?.projectData?.[0]?.id


    // Form Hooks
    const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            project_kpi_dept: kpiData?.project_kpi_dept || '',
            project_kpi_name: kpiData?.project_kpi_name || '',
            project_kpi_def: kpiData?.project_kpi_def || '',
            project_kpi_trend: kpiData?.project_kpi_trend || '',
            project_kpi_uom: kpiData?.project_kpi_uom || '',
            project_kpi_id: kpiData?.project_kpi_id || '',
            project_kpi_yr_targt: kpiData?.project_kpi_yr_targt || '',
            project_kpi_freqency: kpiData?.project_kpi_freqency || '',
            project_kpi_value: kpiData?.project_kpi_value || '',
            kpi_mile_stone: kpiData?.project_kpi_milestone_data?.length > 0
                ? kpiData.project_kpi_milestone_data.map((m: any) => ({
                    project_id: projectId,
                    milestone_id: m.milestone_id,
                    kpi_mile_stone_id: m.kpi_mile_stone_id,
                    projct_kpi_dstrbt_vl: m.projct_kpi_dstrbt_vl
                }))
                : [{ project_id: projectId, milestone_id: '', kpi_mile_stone_id: '', projct_kpi_dstrbt_vl: '' }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'kpi_mile_stone'
    })

    const watchedValue = useWatch({ control, name: 'project_kpi_value' })
    const watchedMilestones = useWatch({ control, name: 'kpi_mile_stone' })

    // Data Fetching
    useEffect(() => {
        if (open) {
            dispatch(getDepartmentListRequest({
                payload: {},
                callback: (res: any) => setDepartments(res?.data || [])
            }))
            dispatch(getUomListRequest({
                payload: {},
                callback: (res: any) => setUoms(res?.data || [])
            }))
        }
    }, [open, dispatch, open])

    // Sub-total validation
    useEffect(() => {
        const kpiVal = parseFloat(String(watchedValue || 0))
        const milestoneTotal = (watchedMilestones || []).reduce((acc: number, curr: any) => {
            const val = parseFloat(String(curr?.projct_kpi_dstrbt_vl || 0))
            return acc + (isNaN(val) ? 0 : val)
        }, 0)

        // Using console.log as requested to verify trigger

        if (watchedValue && watchedValue !== '' && Math.abs(kpiVal - milestoneTotal) > 0.001) {
            setKpiValueError("Milestone sub-total not match with KPI value")
        } else {
            setKpiValueError(null)
        }
    }, [watchedValue, watchedMilestones])

    const onSubmit = (data: FormValues) => {
        if (kpiValueError) return

        const payload = {
            ...data,
            project_id: projectId,
            projectDetails: 'kpiProject'
        }

        const action = kpiData ? updateProjectRequest : addProjectRequest

        dispatch(action({
            payload,
            callback: (res: any) => {
                if (res?.status_code === 200) {
                    handleClose(true)
                }
            }
        }))
    }

    const deleteMilestone = (index: number) => {
        const milestone = fields[index] as any
        if (milestone.kpi_mile_stone_id) {
            const deleteData = {
                project_id: projectId,
                projectDetails: 'kpiProject',
                kpi_mile_stone_id: milestone.kpi_mile_stone_id,
                deleted_at: new Date().toISOString().split('T')[0]
            }
            dispatch(deleteSingleProjectRequest({
                payload: deleteData,
                callback: (res: any) => {
                    if (res?.status_code === 200) {
                        remove(index)
                    }
                }
            }))
        } else {
            remove(index)
        }
    }

    const selectedMilestoneIds = watchedMilestones.map(m => Number(m.milestone_id)).filter(id => id)

    return (
        <Dialog
            open={open}
            onClose={() => handleClose(false)}
            maxWidth='md'
            fullWidth
            scroll='body'
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h5'>{kpiData ? 'Edit Project Deliverables' : 'Enter Project Deliverables'}</Typography>
                    <IconButton onClick={() => handleClose(false)}>
                        <i className='ri-close-line' />
                    </IconButton>
                </Box>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ pb: 6 }}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth error={!!errors.project_kpi_dept}>
                                <InputLabel>Department</InputLabel>
                                <Controller
                                    name='project_kpi_dept'
                                    control={control}
                                    rules={{ required: 'Department is required' }}
                                    render={({ field }) => (
                                        <Select label='Department' {...field} MenuProps={MenuProps}>
                                            {departments.map((dept: any, index: number) => (
                                                <MenuItem key={`dept-${dept.dept_id}-${index}`} value={dept.dept_id}>{dept.dept_name}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.project_kpi_dept && <FormHelperText>{errors.project_kpi_dept.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name='project_kpi_name'
                                control={control}
                                rules={{ required: 'KPI Name is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='KPI Name'
                                        error={!!errors.project_kpi_name}
                                        helperText={errors.project_kpi_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='project_kpi_def'
                                control={control}
                                rules={{ required: 'KPI Definition is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label='KPI Definition'
                                        error={!!errors.project_kpi_def}
                                        helperText={errors.project_kpi_def?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth error={!!errors.project_kpi_trend}>
                                <InputLabel>Ideal Trend</InputLabel>
                                <Controller
                                    name='project_kpi_trend'
                                    control={control}
                                    rules={{ required: 'Ideal Trend is required' }}
                                    render={({ field }) => (
                                        <Select label='Ideal Trend' {...field} MenuProps={MenuProps}>
                                            <MenuItem key='trend-positive' value='positive'>positive (good if number goes up)</MenuItem>
                                            <MenuItem key='trend-negative' value='negative'>negative (good if number goes down)</MenuItem>
                                        </Select>
                                    )}
                                />
                                {errors.project_kpi_trend && <FormHelperText>{errors.project_kpi_trend.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth error={!!errors.project_kpi_uom}>
                                <InputLabel>Unit Of Measurement</InputLabel>
                                <Controller
                                    name='project_kpi_uom'
                                    control={control}
                                    rules={{ required: 'Unit Of Measurement is required' }}
                                    render={({ field }) => (
                                        <Select label='Unit Of Measurement' {...field} MenuProps={MenuProps}>
                                            {uoms.map((uom: any, index: number) => (
                                                <MenuItem key={`uom-${uom.uom_id}-${index}`} value={uom.uom_id}>{uom.uom_name}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.project_kpi_uom && <FormHelperText>{errors.project_kpi_uom.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth error={!!errors.project_kpi_yr_targt}>
                                <InputLabel>Year End Target</InputLabel>
                                <Controller
                                    name='project_kpi_yr_targt'
                                    control={control}
                                    rules={{ required: 'Year End Target is required' }}
                                    render={({ field }) => (
                                        <Select label='Year End Target' {...field} MenuProps={MenuProps}>
                                            <MenuItem key='target-sum' value='sum_up_all'>Sum Up-All</MenuItem>
                                            <MenuItem key='target-avg' value='average'>Average</MenuItem>
                                            <MenuItem key='target-term' value='terminal_value'>Terminal (YE) Value</MenuItem>
                                        </Select>
                                    )}
                                />
                                {errors.project_kpi_yr_targt && <FormHelperText>{errors.project_kpi_yr_targt.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth error={!!errors.project_kpi_freqency}>
                                <InputLabel>Review Frequency</InputLabel>
                                <Controller
                                    name='project_kpi_freqency'
                                    control={control}
                                    rules={{ required: 'Review Frequency is required' }}
                                    render={({ field }) => (
                                        <Select label='Review Frequency' {...field} MenuProps={MenuProps}>
                                            <MenuItem key='freq-monthly' value='Monthly'>Monthly</MenuItem>
                                            <MenuItem key='freq-quarterly' value='Quarterly'>Quarterly</MenuItem>
                                        </Select>
                                    )}
                                />
                                {errors.project_kpi_freqency && <FormHelperText>{errors.project_kpi_freqency.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Controller
                                name='project_kpi_value'
                                control={control}
                                rules={{ required: 'Value is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type='number'
                                        label='Value'
                                        error={!!errors.project_kpi_value}
                                        helperText={errors.project_kpi_value?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, mb: 2 }}>
                                <Typography variant='h6'>Project Milestone</Typography>
                            </Box>
                        </Grid>

                        {fields.map((item, index) => (
                            <Fragment key={item.id}>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <FormControl fullWidth error={!!errors.kpi_mile_stone?.[index]?.milestone_id}>
                                        <InputLabel>Milestone</InputLabel>
                                        <Controller
                                            name={`kpi_mile_stone.${index}.milestone_id`}
                                            control={control}
                                            rules={{ required: 'Milestone is required' }}
                                            render={({ field }) => (
                                                <Select label='Milestone' {...field} MenuProps={MenuProps}>
                                                    {milestoneList.map((mile: any, mIdx: number) => (
                                                        <MenuItem
                                                            key={`milestone-option-${mile.project_milestone_id}-${mIdx}`}
                                                            value={mile.project_milestone_id}
                                                            disabled={selectedMilestoneIds.includes(Number(mile.project_milestone_id)) && Number(field.value) !== Number(mile.project_milestone_id)}
                                                        >
                                                            {mile.milestone_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                        {errors.kpi_mile_stone?.[index]?.milestone_id && <FormHelperText>{errors.kpi_mile_stone[index].milestone_id.message}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Controller
                                        name={`kpi_mile_stone.${index}.projct_kpi_dstrbt_vl`}
                                        control={control}
                                        rules={{ required: 'Value is required' }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                type='number'
                                                label='Value'
                                                error={!!errors.kpi_mile_stone?.[index]?.projct_kpi_dstrbt_vl}
                                                helperText={errors.kpi_mile_stone?.[index]?.projct_kpi_dstrbt_vl?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {index === 0 ? (
                                        <Tooltip title='Add new'>
                                            <IconButton color='primary' onClick={() => append({ project_id: projectId, milestone_id: '', kpi_mile_stone_id: '', projct_kpi_dstrbt_vl: '' })}>
                                                <i className='ri-add-circle-line' />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title='Delete'>
                                            <IconButton color='error' onClick={() => deleteMilestone(index)}>
                                                <i className='ri-delete-bin-line' />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Grid>
                            </Fragment>
                        ))}

                        {kpiValueError && (
                            <Grid size={{ xs: 12 }}>
                                <Typography color='error.main' textAlign='center'>{kpiValueError}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 6, pb: 6 }}>
                    <Button type='submit' variant='contained' color='primary' >
                        Submit
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => handleClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditProjectDeliverables
