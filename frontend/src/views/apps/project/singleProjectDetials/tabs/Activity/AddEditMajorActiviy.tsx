'use client'

import { useState, forwardRef, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, number, optional, check } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'
import { format, parse, isValid, startOfDay } from 'date-fns'

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
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Redux Imports
import { addProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const schema = (minDate?: Date, maxDate?: Date) => pipe(
    object({
        activity_name: pipe(string(), nonEmpty('Activity name is required')),
        milestone_id: optional(number()),
        activity_start_date: pipe(
            string(),
            nonEmpty('Start Date is required'),
            check((value: string) => {
                if (!minDate || !value) return true
                const selectedDate = parse(value, 'yyyy-MM-dd', new Date())
                return isValid(selectedDate) && selectedDate >= startOfDay(minDate)
            }, 'Start Date cannot be before Project Start Date')
        ),
        activity_end_date: pipe(
            string(),
            nonEmpty('Finish Date is required')
        ),
        responsibility: pipe(number(), check((val: number) => val > 0, 'Responsibility is required')),
        preceeding_activity: optional(number()),
        other_responsibility: optional(number())
    }),
    check((input) => {
        if (!input.activity_start_date || !input.activity_end_date) return true
        const start = parse(input.activity_start_date, 'yyyy-MM-dd', new Date())
        const end = parse(input.activity_end_date, 'yyyy-MM-dd', new Date())
        return isValid(start) && isValid(end) && end >= start
    }, 'Finish Date cannot be before Start Date')
)

type FormData = InferInput<ReturnType<typeof schema>>

interface AddEditMajorActiviyProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: any
    projectData: any
    refreshData?: () => void
}

const AddEditMajorActiviy = ({ open, handleClose, data, projectData, refreshData }: AddEditMajorActiviyProps) => {
    // Hooks
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)

    const projectDetails = projectData?.projectData?.[0] || {}
    const milestones = projectData?.project_milestone_data || []
    const activities = projectData?.project_majr_activity_data || []
    const members = projectData?.project_member_data || []
    const exMembers = projectData?.project_ex_member_data || []

    const isEdit = !!data

    // Date Constraints
    const projectStartDate = useMemo(() => {
        if (!projectDetails?.start_date || projectDetails.start_date === '-') return undefined
        let parsed = parse(projectDetails.start_date, 'yyyy-MM-dd', new Date())
        if (!isValid(parsed)) parsed = parse(projectDetails.start_date, 'dd-MM-yyyy', new Date())
        return isValid(parsed) ? parsed : undefined
    }, [projectDetails?.start_date])

    const projectEndDate = useMemo(() => {
        if (!projectDetails?.end_date || projectDetails.end_date === '-') return undefined
        let parsed = parse(projectDetails.end_date, 'yyyy-MM-dd', new Date())
        if (!isValid(parsed)) parsed = parse(projectDetails.end_date, 'dd-MM-yyyy', new Date())
        return isValid(parsed) ? parsed : undefined
    }, [projectDetails?.end_date])

    const {
        control,
        reset,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema(projectStartDate, projectEndDate)),
        defaultValues: {
            activity_name: '',
            milestone_id: 0,
            activity_start_date: '',
            activity_end_date: '',
            responsibility: 0,
            preceeding_activity: 0,
            other_responsibility: 0
        }
    })

    const selectedMilestoneId = watch('milestone_id')
    const selectedPreceedingId = watch('preceeding_activity')
    const activityStartDate = watch('activity_start_date')

    // Calculated Max Date based on Milestone
    const milestoneMaxDate = useMemo(() => {
        if (!selectedMilestoneId) return projectEndDate
        const milestone = milestones.find((m: any) => m.project_milestone_id === Number(selectedMilestoneId))
        if (!milestone?.mile_stone_date) return projectEndDate
        let parsed = parse(milestone.mile_stone_date, 'yyyy-MM-dd', new Date())
        if (!isValid(parsed)) parsed = parse(milestone.mile_stone_date, 'dd-MM-yyyy', new Date())
        return isValid(parsed) ? parsed : projectEndDate
    }, [selectedMilestoneId, milestones, projectEndDate])

    // Calculated Min Date based on Preceeding Activity
    const preceedingMinDate = useMemo(() => {
        if (!selectedPreceedingId) return projectStartDate
        const preActivity = activities.find((a: any) => Number(a.project_activity_id) === Number(selectedPreceedingId))
        if (!preActivity?.activity_end_date) return projectStartDate
        let parsed = parse(preActivity.activity_end_date, 'yyyy-MM-dd', new Date())
        if (!isValid(parsed)) parsed = parse(preActivity.activity_end_date, 'dd-MM-yyyy', new Date())
        return isValid(parsed) ? parsed : projectStartDate
    }, [selectedPreceedingId, activities, projectStartDate])

    useEffect(() => {
        if (open && data) {
            const parseDate = (dateStr: string) => {
                if (!dateStr || dateStr === '-') return ''
                let parsed = parse(dateStr, 'dd-MM-yyyy', new Date())
                if (!isValid(parsed)) parsed = parse(dateStr, 'yyyy-MM-dd', new Date())
                return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : ''
            }

            reset({
                activity_name: data.activity_name || '',
                milestone_id: Number(data.milestone_id) || 0,
                activity_start_date: parseDate(data.activity_start_date),
                activity_end_date: parseDate(data.activity_end_date),
                responsibility: Number(data.user_id) || 0,
                preceeding_activity: Number(data.preceeding_activity) || 0,
                other_responsibility: Number(data.project_ex_user_id) || 0
            })
        } else if (open) {
            reset({
                activity_name: '',
                milestone_id: 0,
                activity_start_date: '',
                activity_end_date: '',
                responsibility: 0,
                preceeding_activity: 0,
                other_responsibility: 0
            })
        }
    }, [open, data, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        if (refresh && refreshData) {
            refreshData()
        }
        reset()
    }

    // eslint-disable-next-line react/display-name
    const PickersComponent = forwardRef((props: any, ref) => (
        <TextField
            inputRef={ref}
            fullWidth
            {...props}
            error={props.error}
            helperText={props.helperText}
            autoComplete='off'
            slotProps={{
                htmlInput: { readOnly: true, onKeyDown: (e: any) => e.preventDefault() },
                input: {
                    endAdornment: (
                        <InputAdornment position='end'>
                            <i className='ri-calendar-line text-textSecondary' />
                        </InputAdornment>
                    )
                }
            }}
        />
    ))

    const onSubmit = (formData: FormData) => {
        setLoading(true)

        const formattedStartDate = formData.activity_start_date ? format(parse(formData.activity_start_date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : ''
        const formattedEndDate = formData.activity_end_date ? format(parse(formData.activity_end_date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : ''

        const payload: any = {
            project_id: projectDetails.id,
            projectDetails: 'projectActivity',
        }

        if (isEdit) {
            payload.activity_sr_no = data.activity_sr_no
            payload.project_activity_id = data.project_activity_id
            payload.activity_name = formData.activity_name
            payload.milestone_id = formData.milestone_id
            payload.activity_start_date = formattedStartDate
            payload.activity_end_date = formattedEndDate
            payload.preceeding_activity = formData.preceeding_activity || ''
            payload.responsibility = formData.responsibility
            payload.other_responsibility = formData.other_responsibility || ''
        } else {
            const nextSrNo = activities.length > 0 ? (Math.max(...activities.map((a: any) => Number(a.activity_sr_no) || 0)) + 1) : 1
            payload.majar_activity = [{
                activity_sr_no: nextSrNo,
                activity_name: formData.activity_name,
                milestone_id: formData.milestone_id,
                activity_start_date: formattedStartDate,
                activity_end_date: formattedEndDate,
                preceeding_activity: formData.preceeding_activity || '',
                responsibility: formData.responsibility,
                other_responsibility: formData.other_responsibility || '',
                project_id: projectDetails.id
            }]
        }

        dispatch(addProjectRequest({
            payload: payload,
            callback: (res: any) => {
                setLoading(false)
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || `Activity ${isEdit ? 'updated' : 'added'} successfully`)
                    handleDialogClose(true)
                } else {
                    toast.error(res?.message || `Failed to ${isEdit ? 'update' : 'add'} activity`)
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={() => handleDialogClose(false)} fullWidth maxWidth='md'>
            <DialogTitle variant='h5' className='flex flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                {isEdit ? 'Edit' : 'Add'} Major Activity Plan
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='activity_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Activity'
                                        disabled={isEdit}
                                        error={!!errors.activity_name}
                                        helperText={errors.activity_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='milestone_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Linked milestone'
                                        disabled={isEdit}
                                        error={!!errors.milestone_id}
                                        helperText={errors.milestone_id?.message}
                                    >
                                        <MenuItem value={0}>Select Milestone</MenuItem>
                                        {milestones.map((m: any, index: number) => (
                                            <MenuItem key={`milestone-${m.project_milestone_id}-${index}`} value={Number(m.project_milestone_id)}>
                                                {m.milestone_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='preceeding_activity'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Preceeding activity'
                                        error={!!errors.preceeding_activity}
                                        helperText={errors.preceeding_activity?.message}
                                    >
                                        <MenuItem value={0}>No activity</MenuItem>
                                        {activities.filter((a: any) => Number(a.project_activity_id) !== Number(data?.project_activity_id)).map((a: any, index: number) => (
                                            <MenuItem key={`activity-${a.project_activity_id}-${index}`} value={Number(a.project_activity_id)}>
                                                {a.activity_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='activity_start_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        minDate={preceedingMinDate}
                                        maxDate={milestoneMaxDate}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat='yyyy-MM-dd'
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={<PickersComponent label='Start' error={!!errors.activity_start_date} helperText={errors.activity_start_date?.message} />}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='activity_end_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        minDate={activityStartDate ? parse(activityStartDate, 'yyyy-MM-dd', new Date()) : preceedingMinDate}
                                        maxDate={milestoneMaxDate}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat='yyyy-MM-dd'
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={<PickersComponent label='Finish' error={!!errors.activity_end_date} helperText={errors.activity_end_date?.message} />}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='responsibility'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Responsibility'
                                        error={!!errors.responsibility}
                                        helperText={errors.responsibility?.message}
                                    >
                                        <MenuItem value={0}>Select Responsibility</MenuItem>
                                        {members.map((m: any, index: number) => (
                                            <MenuItem key={`member-${m.user_id}-${index}`} value={Number(m.user_id)}>
                                                {m.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='other_responsibility'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Other Responsibility'
                                    >
                                        <MenuItem value={0}>Select Other Responsibility</MenuItem>
                                        {exMembers.map((m: any, index: number) => (
                                            <MenuItem key={`ex-member-${m.project_ex_user_id}-${index}`} value={Number(m.project_ex_user_id)}>
                                                {m.ex_membar_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* Milestone Dates Table (Mirroring Angular) */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant='subtitle1' className='mbs-4'>Milestone Dates</Typography>
                            <Typography variant='caption' color='textSecondary'>Project Start date: {projectDetails.start_date}</Typography>
                            <TableContainer className='mbs-2'>
                                <Table size='small' className={tableStyles.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Milestone</TableCell>
                                            <TableCell>End Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {milestones.map((m: any, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell>{m.milestone_name}</TableCell>
                                                <TableCell>{m.mile_stone_date}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='sm:pli-8 sm:pbe-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[100px]'>
                        {loading ? <CircularProgress size={20} color='inherit' /> : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditMajorActiviy
