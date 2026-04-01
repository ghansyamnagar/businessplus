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

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Redux Imports
import { addProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const schema = (minDate?: Date, maxDate?: Date) => pipe(
    object({
        major_activity_id: pipe(number(), check((val: number) => val > 0, 'Activity is required')),
        responsibility: pipe(number(), check((val: number) => val > 0, 'Responsibility is required')),
        sub_activity_name: pipe(string(), nonEmpty('Sub-activity name is required')),
        sb_actvity_strt_date: pipe(
            string(),
            nonEmpty('Start Date is required'),
            check((value: string) => {
                if (!minDate || !value) return true
                const selectedDate = parse(value, 'yyyy-MM-dd', new Date())
                return isValid(selectedDate) && selectedDate >= startOfDay(minDate)
            }, 'Start Date cannot be before Activity Start Date')
        ),
        sb_actvity_end_date: pipe(
            string(),
            nonEmpty('Finish Date is required'),
            check((value: string) => {
                if (!maxDate || !value) return true
                const selectedDate = parse(value, 'yyyy-MM-dd', new Date())
                return isValid(selectedDate) && selectedDate <= startOfDay(maxDate)
            }, 'Finish Date cannot be after Activity Finish Date')
        ),
    }),
    check((input) => {
        if (!input.sb_actvity_strt_date || !input.sb_actvity_end_date) return true
        const start = parse(input.sb_actvity_strt_date, 'yyyy-MM-dd', new Date())
        const end = parse(input.sb_actvity_end_date, 'yyyy-MM-dd', new Date())
        return isValid(start) && isValid(end) && end >= start
    }, 'Finish Date cannot be before Start Date')
)

type FormData = InferInput<ReturnType<typeof schema>>

interface AddEditSubMajorActiviyProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: any
    projectData: any
}

const AddEditSubMajorActiviy = ({ open, handleClose, data, projectData }: AddEditSubMajorActiviyProps) => {
    // Hooks
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)

    const projectDetails = projectData?.projectData?.[0] || {}
    const majorActivities = projectData?.project_majr_activity_data || []
    const members = projectData?.project_member_data || []

    const isEdit = !!data

    const {
        control,
        reset,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema()),
        defaultValues: {
            major_activity_id: 0,
            responsibility: 0,
            sub_activity_name: '',
            sb_actvity_strt_date: '',
            sb_actvity_end_date: ''
        }
    })

    const selectedMajorActivityId = watch('major_activity_id')
    const subActivityStartDate = watch('sb_actvity_strt_date')

    // Date Constraints based on selected Major Activity
    const activityDates = useMemo(() => {
        const activity = majorActivities.find((a: any) => Number(a.project_activity_id) === Number(selectedMajorActivityId))
        if (!activity) return { start: undefined, end: undefined }

        const parseDate = (dateStr: string) => {
            if (!dateStr || dateStr === '-') return undefined
            let parsed = parse(dateStr, 'dd-MM-yyyy', new Date())
            if (!isValid(parsed)) parsed = parse(dateStr, 'yyyy-MM-dd', new Date())
            return isValid(parsed) ? parsed : undefined
        }

        return {
            start: parseDate(activity.activity_start_date),
            end: parseDate(activity.activity_end_date)
        }
    }, [selectedMajorActivityId, majorActivities])

    useEffect(() => {
        if (open && data) {
            const parseDate = (dateStr: string) => {
                if (!dateStr || dateStr === '-') return ''
                let parsed = parse(dateStr, 'dd-MM-yyyy', new Date())
                if (!isValid(parsed)) parsed = parse(dateStr, 'yyyy-MM-dd', new Date())
                return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : ''
            }

            reset({
                major_activity_id: Number(data.major_activity_id) || 0,
                responsibility: Number(data.responsibility || data.user_id) || 0,
                sub_activity_name: data.sub_activity_name || '',
                sb_actvity_strt_date: parseDate(data.sb_actvity_strt_date),
                sb_actvity_end_date: parseDate(data.sb_actvity_end_date)
            })
        } else if (open) {
            reset({
                major_activity_id: 0,
                responsibility: 0,
                sub_activity_name: '',
                sb_actvity_strt_date: '',
                sb_actvity_end_date: ''
            })
        }
    }, [open, data, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
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

        const formattedStartDate = formData.sb_actvity_strt_date ? format(parse(formData.sb_actvity_strt_date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : ''
        const formattedEndDate = formData.sb_actvity_end_date ? format(parse(formData.sb_actvity_end_date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : ''
        const payload: any = {
            project_id: projectDetails.id,
            projectDetails: 'projectSubActivity',
        }

        if (isEdit) {
            payload.project_sub_actvity_id = data.project_sub_actvity_id
            payload.major_activity_id = formData.major_activity_id
            payload.sub_activity_name = formData.sub_activity_name
            payload.sb_actvity_strt_date = formattedStartDate
            payload.sb_actvity_end_date = formattedEndDate
            payload.responsibility = formData.responsibility

            // Replicating Angular structure if needed, though slice usually expects flat for edit
            payload.sub_activity = [{
                project_id: projectDetails.id,
                project_sub_actvity_id: data.project_sub_actvity_id,
                major_activity_id: formData.major_activity_id,
                sub_activity_name: formData.sub_activity_name,
                sb_actvity_strt_date: formattedStartDate,
                sb_actvity_end_date: formattedEndDate,
                responsibility: formData.responsibility
            }]
        } else {
            payload.sub_activity = [{
                project_id: projectDetails.id,
                project_sub_actvity_id: '',
                major_activity_id: formData.major_activity_id,
                sub_activity_name: formData.sub_activity_name,
                sb_actvity_strt_date: formattedStartDate,
                sb_actvity_end_date: formattedEndDate,
                responsibility: formData.responsibility
            }]
        }

        dispatch(addProjectRequest({
            payload: payload,
            callback: (res: any) => {
                setLoading(false)
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || `Sub-activity ${isEdit ? 'updated' : 'added'} successfully`)
                    handleDialogClose(true)
                } else {
                    toast.error(res?.message || `Failed to ${isEdit ? 'update' : 'add'} sub-activity`)
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={() => handleDialogClose(false)} fullWidth maxWidth='md'>
            <DialogTitle variant='h5' className='flex flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                {isEdit ? 'Edit' : 'Add'} Sub Activity Plan
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='major_activity_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Activity'
                                        disabled={isEdit}
                                        error={!!errors.major_activity_id}
                                        helperText={errors.major_activity_id?.message}
                                    >
                                        <MenuItem value={0}>Select Activity</MenuItem>
                                        {majorActivities.map((a: any, index: number) => (
                                            <MenuItem key={`activity-${a.project_activity_id}-${index}`} value={Number(a.project_activity_id)}>
                                                {a.activity_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
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
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='sub_activity_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Sub activity'
                                        disabled={isEdit}
                                        error={!!errors.sub_activity_name}
                                        helperText={errors.sub_activity_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='sb_actvity_strt_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        minDate={activityDates.start}
                                        maxDate={activityDates.end}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat='yyyy-MM-dd'
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={<PickersComponent label='Start' error={!!errors.sb_actvity_strt_date} helperText={errors.sb_actvity_strt_date?.message} />}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='sb_actvity_end_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        minDate={subActivityStartDate ? parse(subActivityStartDate, 'yyyy-MM-dd', new Date()) : activityDates.start}
                                        maxDate={activityDates.end}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat='yyyy-MM-dd'
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={<PickersComponent label='Finish' error={!!errors.sb_actvity_end_date} helperText={errors.sb_actvity_end_date?.message} />}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Activity Dates Table (Mirroring Angular) */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant='subtitle1' className='mbs-4'>Activity Dates</Typography>
                            <TableContainer className='mbs-2'>
                                <Table size='small' className={tableStyles.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Activity</TableCell>
                                            <TableCell>Start Date</TableCell>
                                            <TableCell>End Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {majorActivities.map((a: any, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell>{a.activity_name}</TableCell>
                                                <TableCell>{a.activity_start_date}</TableCell>
                                                <TableCell>{a.activity_end_date}</TableCell>
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

export default AddEditSubMajorActiviy
