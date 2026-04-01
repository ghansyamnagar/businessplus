'use client'

import { useState, useEffect, forwardRef } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, number, check, optional } from 'valibot'
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
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Redux Imports
import { addProjectRequest, updateProjectRequest } from '@/redux-store/slices/project/project.slice'
import { getSelectModulesRequest } from '@/redux-store/slices/master/master.slice'
import { getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const schema = (isEdit: boolean) => pipe(
    object({
        issue_task_name: pipe(string(), nonEmpty('Issue Name is required')),
        issue_task_priority: pipe(number(), check((val) => val > 0, 'Priority is required')),
        issue_task_dept: pipe(string(), nonEmpty('Department is required')),
        issue_start_date: pipe(string(), nonEmpty('Issue Log Date is required')),
        issue_end_date: pipe(string(), nonEmpty('Issue Target Date is required')),
        issue_task_owner: pipe(number(), check((val) => val > 0, 'Responsibility is required')),
        issue_task_reason: isEdit ? pipe(string(), nonEmpty('Reason for change is required')) : optional(string())
    }),
    check((input) => {
        if (!input.issue_start_date || !input.issue_end_date) return true
        const start = parse(input.issue_start_date, 'yyyy-MM-dd', new Date())
        const end = parse(input.issue_end_date, 'yyyy-MM-dd', new Date())
        return isValid(start) && isValid(end) && end >= start
    }, 'Issue Target Date cannot be before Issue Log Date')
)

type FormData = InferInput<ReturnType<typeof schema>>

interface AddEditIssueTrackerProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: any
    projectData: any
}

const AddEditIssueTracker = ({ open, handleClose, data, projectData }: AddEditIssueTrackerProps) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [taskDataPriorities, setTaskDataPriorities] = useState<any[]>([])
    const [dataDepartment, setDataDepartment] = useState<any[]>([])

    const members = (projectData?.project_member_data || []).reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.user_id === current.user_id)
        if (!x) {
            return acc.concat([current])
        } else {
            return acc
        }
    }, [])
    const isEdit = !!data

    const {
        control,
        reset,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema(isEdit)),
        defaultValues: {
            issue_task_name: '',
            issue_task_priority: 0,
            issue_task_dept: '',
            issue_start_date: '',
            issue_end_date: '',
            issue_task_owner: 0,
            issue_task_reason: ''
        }
    })
    const issueLogDate = watch('issue_start_date')
    const issueEndDate = watch('issue_end_date')

    useEffect(() => {
        if (issueLogDate && issueEndDate) {
            const start = parse(issueLogDate, 'yyyy-MM-dd', new Date())
            const end = parse(issueEndDate, 'yyyy-MM-dd', new Date())
            if (isValid(start) && isValid(end) && start > end) {
                setValue('issue_end_date', '')
                trigger('issue_end_date')
            }
        }
    }, [issueLogDate, issueEndDate, setValue, trigger])
    useEffect(() => {
        dispatch(getSelectModulesRequest({
            payload: {},
            callback: (res: any) => {
                if (res?.status === 'success') {
                    setTaskDataPriorities(res.data?.priorities || [])
                }
            }
        }))

        const projectInfo = projectData?.projectData?.[0] || {}
        const unit_id = projectInfo?.unit_id

        dispatch(getDepartmentListRequest({
            payload: { unit_id },
            callback: (res: any) => {
                if (res?.status === 'success') {
                    setDataDepartment(res.data || [])
                }
            }
        }))
    }, [dispatch, projectData])

    useEffect(() => {
        if (open && data) {
            const parseDate = (dateStr: string) => {
                if (!dateStr || dateStr === '-') return ''
                let parsed = parse(dateStr, 'dd-MM-yyyy', new Date())
                if (!isValid(parsed)) parsed = parse(dateStr, 'yyyy-MM-dd', new Date())
                return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : ''
            }

            reset({
                issue_task_name: data.issue_task_name || '',
                issue_task_priority: Number(data.issue_task_priority) || 0,
                issue_task_dept: data.issue_task_dept?.toString() || '',
                issue_start_date: parseDate(data.issue_start_date),
                issue_end_date: parseDate(data.issue_end_date),
                issue_task_owner: Number(data.issue_task_owner) || 0,
                issue_task_reason: data.issue_task_reason || ''
            })
        } else if (open) {
            reset({
                issue_task_name: '',
                issue_task_priority: 0,
                issue_task_dept: '',
                issue_start_date: '',
                issue_end_date: '',
                issue_task_owner: 0,
                issue_task_reason: ''
            })
        }
    }, [open, data, reset])

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

        const formattedStartDate = formData.issue_start_date ? format(parse(formData.issue_start_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : ''
        const formattedEndDate = formData.issue_end_date ? format(parse(formData.issue_end_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : ''

        const payload: any = {
            ...formData,
            issue_start_date: formattedStartDate,
            issue_end_date: formattedEndDate,
            project_id: projectData?.projectData?.[0]?.id,
            projectDetails: 'projectIssueTracker'
        }

        if (isEdit) {
            payload.issue_id = data.id
        }

        const actionRequest = isEdit ? updateProjectRequest : addProjectRequest

        dispatch(actionRequest({
            payload: payload,
            callback: (res: any) => {
                setLoading(false)
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || `Issue ${isEdit ? 'updated' : 'added'} successfully`)
                    handleClose(true)
                } else {
                    toast.error(res?.message || res?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} issue`)
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={() => handleClose(false)} fullWidth maxWidth='sm'>
            <DialogTitle variant='h5' className='flex flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8 text-center'>
                {isEdit ? 'Edit Task' : 'Enter New Issue'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible'>
                    <IconButton onClick={() => handleClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='issue_task_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label='Issue Name'
                                        error={!!errors.issue_task_name}
                                        helperText={errors.issue_task_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='issue_task_priority'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Priority'
                                        error={!!errors.issue_task_priority}
                                        helperText={errors.issue_task_priority?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: { className: tableStyles.maxHeight }
                                            }
                                        }}
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
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='issue_task_dept'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Department'
                                        error={!!errors.issue_task_dept}
                                        helperText={errors.issue_task_dept?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: { className: tableStyles.maxHeight }
                                            }
                                        }}
                                    >
                                        <MenuItem value=''>Select Department</MenuItem>
                                        {dataDepartment.map((dept: any, index: number) => (
                                            <MenuItem key={`dept-${dept?.dept_id}-${index}`} value={dept?.dept_id?.toString()}>
                                                {dept?.dept_name}
                                            </MenuItem>
                                        ))}
                                        <MenuItem value='applicable'>Not applicable</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='issue_start_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat='yyyy-MM-dd'
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={
                                            <PickersComponent
                                                label='Issue Log Date'
                                                error={!!errors.issue_start_date}
                                                helperText={errors.issue_start_date?.message}
                                            />
                                        }
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='issue_end_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        minDate={issueLogDate ? parse(issueLogDate, 'yyyy-MM-dd', new Date()) : undefined}
                                        disabled={!issueLogDate}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat='yyyy-MM-dd'
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={
                                            <PickersComponent
                                                label='Issue Target Date'
                                                error={!!errors.issue_end_date}
                                                helperText={errors.issue_end_date?.message}
                                                disabled={!issueLogDate}
                                            />
                                        }
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='issue_task_owner'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Responsibility'
                                        error={!!errors.issue_task_owner}
                                        helperText={errors.issue_task_owner?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: { className: tableStyles.maxHeight }
                                            }
                                        }}
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
                        {isEdit && (
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name='issue_task_reason'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label='Reason For Change'
                                            error={!!errors.issue_task_reason}
                                            helperText={errors.issue_task_reason?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        )}
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

export default AddEditIssueTracker
