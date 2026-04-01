
'use client'

import { useEffect, useState, forwardRef } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, array, optional } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import { format, parse } from 'date-fns'

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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'

import { addTaskRequest, updateTaskRequest, getEventsTaskListRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'
import { getPriorityListRequest, getSelectModulesRequest } from '@/redux-store/slices/master/master.slice'
import { getDepartmentListRequest, getUserListRequest } from '@/redux-store/slices/user/user.slice'
import type { TaskType } from '@/redux-store/slices/taskTracker/taskTracker.types'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const schema = object({
    task_name: pipe(string(), nonEmpty('Task Name is required')),
    priority_id: pipe(string(), nonEmpty('Priority is required')),
    event_id: pipe(string(), nonEmpty('Event is required')),
    department_id: pipe(string(), nonEmpty('Department is required')),
    start_date: pipe(string(), nonEmpty('Start Date is required')),
    end_date: pipe(string(), nonEmpty('End Date is required')),
    task_owner_id: pipe(string(), nonEmpty('Task Owner is required')),
    assign_to: pipe(array(string()), nonEmpty('At least one user must be assigned')),
    reminder_frequency: pipe(string(), nonEmpty('Reminder Frequency is required')),
    status_id: optional(string())
})

type FormData = InferInput<typeof schema>

interface AddEditTaskProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    dataEdit?: TaskType
}

const AddEditTask = ({ open, handleClose, dataEdit }: AddEditTaskProps) => {
    const dispatch = useDispatch()
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [events, setEvents] = useState<any[]>([])
    const [priorities, setPriorities] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    // const [modules, setModules] = useState<any[]>([])
    const [dataStatus, setDataStatus] = useState<any[]>([])

    const {
        control,
        reset,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            task_name: '',
            priority_id: '',
            event_id: '',
            department_id: '',
            start_date: '',
            end_date: '',
            task_owner_id: '',
            assign_to: [],
            reminder_frequency: '',
            status_id: ''
        }
    })

    const startDate = watch('start_date')
    const endDate = watch('end_date')

    const handleStartDateChange = (date: Date | null, onChange: (value: string) => void) => {
        const dateString = date ? format(date, 'yyyy-MM-dd') : ''
        onChange(dateString)

        if (date && endDate) {
            const parsedEndDate = endDate.includes('/')
                ? parse(endDate, 'dd/MM/yyyy', new Date())
                : parse(endDate, 'yyyy-MM-dd', new Date())

            if (date > parsedEndDate) {
                setValue('end_date', dateString)
            }
        }
    }

    // eslint-disable-next-line react/display-name
    const PickersComponent = forwardRef((props: any, ref) => {
        return (
            <TextField
                inputRef={ref}
                fullWidth
                {...props}
                label={props.label || ''}
                error={props.error}
                helperText={props.helperText}
                autoComplete='off'
                slotProps={{
                    htmlInput: {
                        readOnly: true,
                        onKeyDown: (e: any) => e.preventDefault()
                    },
                    input: {
                        endAdornment: (
                            <InputAdornment position='end'>
                                <i className='ri-calendar-line text-textSecondary' />
                            </InputAdornment>
                        )
                    }
                }}
            />
        )
    })

    useEffect(() => {
        if (open) {
            const unit_id = (session?.user as any)?.unit_selected?.id

            dispatch(getEventsTaskListRequest({
                payload: {},
                callback: (res) => res?.status === 'success' && setEvents(res.data)
            }))
            dispatch(getPriorityListRequest({
                payload: {},
                callback: (res) => res?.status === 'success' && setPriorities(res.data)
            }))

            dispatch(getUserListRequest({
                payload: {},
                callback: (res) => {
                    if (res?.status === 'success') {
                        setUsers(res.data)
                    }
                }
            }))
            dispatch(getSelectModulesRequest({
                payload: {},
                callback: (res) => {
                    if (res?.status === 'success') {
                        setDataStatus(res?.data?.status)
                    }
                }
            }))

            if (unit_id) {
                dispatch(getDepartmentListRequest({
                    payload: { unit_id },
                    callback: (res) => res?.status === 'success' && setDepartments(res.data)
                }))
            }
        }
    }, [open, dispatch, session])

    useEffect(() => {
        if (open && dataEdit) {
            reset({
                task_name: dataEdit.task_name,
                priority_id: String(dataEdit.priority_id),
                event_id: String(dataEdit.event_id),
                department_id: String(dataEdit.department_master_id),
                start_date: dataEdit.start_date || '',
                end_date: dataEdit.end_date || '',
                task_owner_id: String(dataEdit.task_owner_id),
                assign_to: dataEdit.task_assigns_data?.map(u => String(u.user_id)) || [],
                reminder_frequency: dataEdit.reminder_frequency,
                status_id: String(dataEdit.status_id)
            })
        } else if (open && !dataEdit) {
            reset({
                task_name: '',
                priority_id: '',
                event_id: '',
                department_id: '',
                start_date: '',
                end_date: '',
                task_owner_id: '',
                assign_to: [],
                reminder_frequency: '',
                status_id: ''
            })
        }
    }, [open, dataEdit, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset()
    }

    const onSubmit = (data: FormData) => {
        setLoading(true)
        const unit_id = (session?.user as any)?.unit_selected?.id

        const payload = {
            ...data,
            start_date: data.start_date ? format(parse(data.start_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : '',
            end_date: data.end_date ? format(parse(data.end_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : '',
            unit_id: String(unit_id),
            priority_id: Number(data.priority_id),
            event_id: Number(data.event_id),
            department_id: Number(data.department_id),
            task_owner_id: Number(data.task_owner_id),
            assign_to: data.assign_to.map(Number),
            status_id: data.status_id ? Number(data.status_id) : undefined
        }

        if (dataEdit) {
            dispatch(updateTaskRequest({
                payload: {
                    ...payload,
                    task_id: dataEdit.id
                },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating')
                    }
                    setLoading(false)
                }
            }))
        } else {
            dispatch(addTaskRequest({
                payload: payload,
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Added successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error adding')
                    }
                    setLoading(false)
                }
            }))
        }
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={() => handleDialogClose(false)}
            maxWidth='md'
            scroll='body'
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>{dataEdit ? 'Edit' : 'Add'} Task</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12, sm: 12 }}>
                            <Controller
                                name='task_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label='Task Name'
                                        fullWidth
                                        error={!!errors.task_name}
                                        helperText={errors.task_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='priority_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} label='Priority' fullWidth error={!!errors.priority_id} helperText={errors.priority_id?.message} SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 250 } } } }}>
                                        {priorities.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='event_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} label='Event' fullWidth error={!!errors.event_id} helperText={errors.event_id?.message} SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 250 } } } }}>
                                        {events.map(ev => <MenuItem key={ev.id} value={String(ev.id)}>{ev.event_name}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='department_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} label='Department' fullWidth error={!!errors.department_id} helperText={errors.department_id?.message} SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 250 } } } }}>
                                        {departments.map(d => <MenuItem key={d.dept_id} value={String(d.dept_id)}>{d.dept_name}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='start_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selectsStart
                                        id='start-date'
                                        startDate={value ? (value.includes('/') ? parse(value, 'dd/MM/yyyy', new Date()) : parse(value, 'yyyy-MM-dd', new Date())) : undefined}
                                        endDate={endDate ? (endDate.includes('/') ? parse(endDate, 'dd/MM/yyyy', new Date()) : parse(endDate, 'yyyy-MM-dd', new Date())) : undefined}
                                        selected={value ? (value.includes('/') ? parse(value, 'dd/MM/yyyy', new Date()) : parse(value, 'yyyy-MM-dd', new Date())) : null}
                                        minDate={new Date()}
                                        onChange={(date: Date | null) => handleStartDateChange(date, onChange)}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat="yyyy-MM-dd"
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={<PickersComponent label='Start Date' error={!!errors.start_date} helperText={errors.start_date?.message} />}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='end_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selectsEnd
                                        id='end-date'
                                        startDate={startDate ? (startDate.includes('/') ? parse(startDate, 'dd/MM/yyyy', new Date()) : parse(startDate, 'yyyy-MM-dd', new Date())) : undefined}
                                        endDate={value ? (value.includes('/') ? parse(value, 'dd/MM/yyyy', new Date()) : parse(value, 'yyyy-MM-dd', new Date())) : undefined}
                                        selected={value ? (value.includes('/') ? parse(value, 'dd/MM/yyyy', new Date()) : parse(value, 'yyyy-MM-dd', new Date())) : null}
                                        minDate={startDate ? (startDate.includes('/') ? parse(startDate, 'dd/MM/yyyy', new Date()) : parse(startDate, 'yyyy-MM-dd', new Date())) : undefined}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat="yyyy-MM-dd"
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={<PickersComponent label='End Date' error={!!errors.end_date} helperText={errors.end_date?.message} />}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='task_owner_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} label='Task Owner' fullWidth error={!!errors.task_owner_id} helperText={errors.task_owner_id?.message} SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 250 } } } }}>
                                        {users.map(u => <MenuItem key={u.user_id} value={String(u.user_id)}>{u.name}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='assign_to'
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.assign_to}>
                                        <InputLabel>Task Co-Owner</InputLabel>
                                        <Select
                                            {...field}
                                            multiple
                                            label='Assign To'
                                            MenuProps={{ PaperProps: { sx: { maxHeight: 250 } } }}
                                            renderValue={(selected) => (
                                                <div className='flex flex-wrap gap-2'>
                                                    {(selected as string[]).map((value) => {
                                                        const user = users.find(u => String(u.user_id) === value)
                                                        return <Chip key={value} label={user?.name || value} size='small' />
                                                    })}
                                                </div>
                                            )}
                                        >
                                            {users.map((u) => (
                                                <MenuItem key={u.user_id} value={String(u.user_id)}>
                                                    {u.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.assign_to && <p className='text-error text-xs p-1'>{errors.assign_to.message}</p>}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='reminder_frequency'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        label='Reminder Frequency'
                                        fullWidth
                                        error={!!errors.reminder_frequency}
                                        helperText={errors.reminder_frequency?.message}
                                    >
                                        <MenuItem value=''></MenuItem>
                                        <MenuItem value='Daily'>Daily</MenuItem>
                                        <MenuItem value='Weekly'>Weekly</MenuItem>
                                        <MenuItem value='Monthly'>Monthly</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        {dataEdit && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name='status_id'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            {...field}
                                            label='Status'
                                            fullWidth
                                            error={!!errors.status_id}
                                            helperText={errors.status_id?.message}
                                            SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 250 } } } }}
                                        >
                                            {dataStatus.map((status: any) => (
                                                <MenuItem key={status.id} value={String(status.id)}>
                                                    {status.status_name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[120px]'>
                        {loading ? <CircularProgress size={22} color='inherit' /> : dataEdit ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' type='reset' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditTask

