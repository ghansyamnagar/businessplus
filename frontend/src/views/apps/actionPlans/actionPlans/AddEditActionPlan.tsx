
// React Imports
import { useEffect, useState, forwardRef } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, optional } from 'valibot'
import { format, parse, isValid } from 'date-fns'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'

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
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import InputAdornment from '@mui/material/InputAdornment'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Slice Imports
import { addActionPlanReq, editActionPlanReq } from '@/redux-store/slices/actionplans/actionplans.slice'
import { getDepartmentListRequest, getSectionListRequest, getUserListDeptWiseRequest } from '@/redux-store/slices/user/user.slice'
import { getStratObjListByDeptReq, getStrObjStatusRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import { getInitiativesListByStratObjReq } from '@/redux-store/slices/initiatives/initiatives.slice'
import { getKpiByDepartmentRequest } from '@/redux-store/slices/kpiTracker/kpiTracker.slice'
// Type Imports
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { ActionPlanType } from '@/types/apps/actionPlanTypes'

type AddEditActionPlanProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    dataEdit?: ActionPlanType
    filterUnit: string
}

const getSchema = (isEdit: boolean) => object({
    action_plan_definition: pipe(string(), nonEmpty('Definition is required')),
    s_o_id: pipe(string(), nonEmpty('Strategic Objective is required')),
    initiatives_id: pipe(string(), nonEmpty('Initiative is required')),
    dept_id: pipe(string(), nonEmpty('Department is required')),
    target: pipe(string(), nonEmpty('Target is required')),
    start_date: pipe(string(), nonEmpty('Start Date is required')),
    end_date: pipe(string(), nonEmpty('End Date is required')),
    reminder_date: pipe(string(), nonEmpty('Reminder Date is required')),
    control_point: pipe(string(), nonEmpty('Control Point is required')),
    status: isEdit ? pipe(string(), nonEmpty('Status is required')) : optional(string()),
    comment: isEdit ? pipe(string(), nonEmpty('Respons For Change is required')) : optional(string())
})

type FormData = InferInput<ReturnType<typeof getSchema>>

// Helper to safely parse date strings
const safeParseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null
    let d = new Date(dateStr)
    if (isValid(d)) return d
    d = parse(dateStr, 'dd-MM-yyyy', new Date())
    if (isValid(d)) return d
    d = parse(dateStr, 'dd/MM/yyyy', new Date())
    if (isValid(d)) return d
    return null
}

const toInternalDate = (dateStr: string): string => {
    const d = safeParseDate(dateStr)
    return d ? format(d, 'yyyy-MM-dd') : ''
}

const toApiDate = (dateStr: string): string => {
    const d = safeParseDate(dateStr)
    return d ? format(d, 'dd/MM/yyyy') : ''
}

const controlPointOptions = ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly']

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

const AddEditActionPlan = ({ open, handleClose, dataEdit, filterUnit }: AddEditActionPlanProps) => {
    const dispatch = useDispatch()
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [strategicObjectives, setStrategicObjectives] = useState<any[]>([])
    const [initiatives, setInitiatives] = useState<any[]>([])
    const [kpiList, setKpiList] = useState<any[]>([])
    const [selectedKpis, setSelectedKpis] = useState<number[]>([])

    const [users, setUsers] = useState<any[]>([])
    const [coOwners, setCoOwners] = useState<number[]>([])
    const [statuses, setStatuses] = useState<any[]>([])

    const {
        control,
        reset,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(getSchema(!!dataEdit)),
        defaultValues: {
            action_plan_definition: '',
            s_o_id: '',
            initiatives_id: '',
            dept_id: '',
            target: '',
            start_date: '',
            end_date: '',
            reminder_date: '',
            control_point: '',
            status: '',
            comment: ''
        }
    })

    const startDate = watch('start_date')
    const endDate = watch('end_date')
    const selectedDeptId = watch('dept_id')
    const selectedSOId = watch('s_o_id')
    const selectedInitId = watch('initiatives_id')

    // Get the selected Initiative's date range for validation
    const selectedInit = initiatives.find((init: any) => String(init.id) === selectedInitId)
    const initMinDate = selectedInit?.start_date ? safeParseDate(selectedInit.start_date) : null
    const initMaxDate = selectedInit?.end_date ? safeParseDate(selectedInit.end_date) : null

    const handleStartDateChange = (date: Date | null, onChange: (value: string) => void) => {
        const dateString = date ? format(date, 'yyyy-MM-dd') : ''
        onChange(dateString)

        const endDateParsed = safeParseDate(endDate)
        if (date && endDateParsed && date > endDateParsed) {
            setValue('end_date', dateString)
        }
    }

    // Fetch departments
    useEffect(() => {
        if (open) {
            dispatch(getDepartmentListRequest({
                payload: { unit_id: filterUnit },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        const filtered = response.data.filter((d: DepartmentType) => String(d.unit_id) === filterUnit)
                        setDepartments(filtered)
                    } else {
                        setDepartments([])
                    }
                }
            }))
        }
    }, [open, dispatch, filterUnit])

    // Fetch strategic objectives and users when department changes
    useEffect(() => {
        if (selectedDeptId) {
            dispatch(getStratObjListByDeptReq({
                payload: { dept_id: selectedDeptId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setStrategicObjectives(response?.data?.strategic_objectives || [])
                    } else {
                        setStrategicObjectives([])
                    }
                }
            }))
            dispatch(getUserListDeptWiseRequest({
                payload: { dept_id: selectedDeptId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setUsers(response.data || [])
                    } else {
                        setUsers([])
                    }
                }
            }))
            dispatch(
                getKpiByDepartmentRequest({
                    payload: { dept_id: selectedDeptId },
                    callback: (response: any) => {
                        if (response?.status === 'success') {
                            setKpiList(response?.data || [])
                        } else {
                            setKpiList([])
                        }
                    }
                })
            )

        } else {
            setStrategicObjectives([])
            setUsers([])
            setKpiList([])

        }
    }, [selectedDeptId, dispatch])

    // Fetch initiatives when strategic objective changes
    useEffect(() => {
        if (selectedSOId) {
            dispatch(getInitiativesListByStratObjReq({
                payload: { s_o_id: selectedSOId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setInitiatives(response?.data?.initiatives || [])
                    } else {
                        setInitiatives([])
                    }
                }
            }))
        } else {
            setInitiatives([])
        }
    }, [selectedSOId, dispatch])

    useEffect(() => {
        if (open) {
            dispatch(getStrObjStatusRequest({
                payload: {},
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setStatuses(response.data)
                    }
                }
            }))
        }
    }, [open, dispatch])

    useEffect(() => {
        if (dataEdit) {
            reset({
                action_plan_definition: dataEdit.action_plan_definition || '',
                s_o_id: dataEdit.s_o_id ? String(dataEdit.s_o_id) : '',
                initiatives_id: dataEdit.initiatives_id ? String(dataEdit.initiatives_id) : '',
                dept_id: dataEdit.dept_id ? String(dataEdit.dept_id) : '',
                target: dataEdit.target || '',
                start_date: toInternalDate(dataEdit.start_date || ''),
                end_date: toInternalDate(dataEdit.end_date || ''),
                reminder_date: (() => {
                    const day = parseInt(dataEdit.reminder_date || '', 10)
                    if (!day) return ''
                    const now = new Date()
                    const year = now.getFullYear()
                    const month = 11 // December (last month of the year)
                    // Clamp day to last valid day of December
                    const lastDay = new Date(year, month + 1, 0).getDate()
                    const clampedDay = Math.min(day, lastDay)
                    return format(new Date(year, month, clampedDay), 'yyyy-MM-dd')
                })(),
                control_point: dataEdit.control_point || '',
                status: dataEdit.status_id ? String(dataEdit.status_id) : '',
                comment: dataEdit.comment || ''
            })
            setCoOwners(dataEdit.assign_action_plan_user?.map(u => u.co_owner) || [])
            setSelectedKpis(dataEdit.kpi_data?.map((k: any) => k.kpi_id).filter(Boolean) || [])
        } else {
            reset({
                action_plan_definition: '',
                s_o_id: '',
                initiatives_id: '',
                dept_id: '',
                target: '',
                start_date: '',
                end_date: '',
                reminder_date: '',
                control_point: '',
                status: '',
                comment: ''
            })
            setCoOwners([])
            setSelectedKpis([])
        }
    }, [dataEdit, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset()
        setCoOwners([])
        setSelectedKpis([])
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        setLoading(true)

        if (dataEdit?.action_plan_id) {
            // Edit Mode
            const payload = {
                action_plan_id: dataEdit.action_plan_id,
                dept_id: Number(formData.dept_id),
                s_o_id: Number(formData.s_o_id),
                initiatives_id: Number(formData.initiatives_id),
                kpi_id: selectedKpis,
                action_plan_definition: formData.action_plan_definition,
                target: formData.target,
                co_owner: coOwners,
                start_date: toApiDate(formData.start_date),
                end_date: toApiDate(formData.end_date),
                reminder_date: toApiDate(formData.reminder_date),
                control_point: formData.control_point,
                status: Number(formData.status),
                comment: formData.comment || ''
            }

            dispatch(editActionPlanReq({
                payload,
                callback: (response: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'Updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating')
                    }
                    setLoading(false)
                }
            }))
        } else {
            // Add Mode
            const actionData = {
                login_access_token: (session?.user as any)?.accessToken,
                company_id: (session?.user as any)?.company_id,
                user_id: Number((session?.user as any)?.id),
                unit_id: filterUnit,
                dept_id: Number(formData.dept_id),
                s_o_id: Number(formData.s_o_id),
                init_sno: '',
                initiatives_id: Number(formData.initiatives_id),
                kpi_id: selectedKpis,
                definition: formData.action_plan_definition,
                target: formData.target,
                co_owner: coOwners,
                start_date: toApiDate(formData.start_date),
                end_date: toApiDate(formData.end_date),
                reminder_date: toApiDate(formData.reminder_date),
                control_point: formData.control_point,
                status: 'Blue'
            }

            dispatch(addActionPlanReq({
                payload: { actionData, kpData: '' },
                callback: (response: any) => {
                    if (response && response.status === 'success') {
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
                <div className='max-sm:is-[80%] max-sm:text-center'>{dataEdit ? 'Edit' : 'Add'} Action Plan</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        {/* Department */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='dept_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='Department' error={!!errors.dept_id} helperText={errors.dept_id?.message} disabled={!!dataEdit}
                                        SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 250 } } } }}
                                    >
                                        {departments.map((dept, index) => (
                                            <MenuItem key={`${dept.dept_id}-${index}`} value={String(dept.dept_id)}>{dept.dept_name}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        {/* Strategic Objective */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='s_o_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='Strategic Objective' error={!!errors.s_o_id} helperText={errors.s_o_id?.message} disabled={!!dataEdit}
                                        SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 250 } } } }}
                                    >
                                        {strategicObjectives.map((so: any, index) => (
                                            <MenuItem key={`${so.id}-${index}`} value={String(so.id)}>
                                                {so.description}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        {/* Initiative */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='initiatives_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='Initiative' error={!!errors.initiatives_id} helperText={errors.initiatives_id?.message} disabled={!!dataEdit}
                                        SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 250 } } } }}
                                    >
                                        {initiatives.map((init: any, index) => (
                                            <MenuItem key={`${init.id}-${index}`} value={String(init.id)}>
                                                {init.definition}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* KPI (Multi-Select) */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>KPI</InputLabel>
                                <Select
                                    multiple
                                    value={selectedKpis}
                                    label='KPI'
                                    onChange={(e) => setSelectedKpis(e.target.value as number[])}
                                    renderValue={(selected) =>
                                        kpiList
                                            .filter(k => (selected as number[]).includes(k.kpi_id))
                                            .map(k => k.kpi_name)
                                            .join(', ')
                                    }
                                    MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                                >
                                    {kpiList.map((kpi: any, index) => (
                                        <MenuItem key={`${kpi.kpi_id}-${index}`} value={kpi.kpi_id}>
                                            <Checkbox checked={selectedKpis.indexOf(kpi.kpi_id) > -1} />
                                            <ListItemText primary={kpi.kpi_name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Initiative Duration Info */}
                        <Grid size={{ xs: 12 }}>
                            {selectedInit ? (
                                <Typography variant='body2' color='textSecondary'>
                                    <strong>Initiative Duration:</strong>{' '}
                                    {selectedInit.start_date ? format(safeParseDate(selectedInit.start_date)!, 'dd/MM/yyyy') : '-'}
                                    {' to '}
                                    {selectedInit.end_date ? format(safeParseDate(selectedInit.end_date)!, 'dd/MM/yyyy') : '-'}
                                </Typography>
                            ) : (
                                <Typography variant='body2' color='textSecondary'>
                                    Please select an Initiative to see its date range.
                                </Typography>
                            )}
                        </Grid>

                        {/* Definition */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='action_plan_definition'
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth multiline rows={3} label='Action Plan Definition' error={!!errors.action_plan_definition} helperText={errors.action_plan_definition?.message} />
                                )}
                            />
                        </Grid>
                        {/* Target */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='target'
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth label='Target' error={!!errors.target} helperText={errors.target?.message} />
                                )}
                            />
                        </Grid>
                        {/* Co-Owner (Multi-Select) */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Co-Owner</InputLabel>
                                <Select
                                    multiple
                                    value={coOwners}
                                    label='Co-Owner'
                                    onChange={(e) => setCoOwners(e.target.value as number[])}
                                    renderValue={(selected) =>
                                        users
                                            .filter(u => (selected as number[]).includes(u.id))
                                            .map(u => u.name)
                                            .join(', ')
                                    }
                                    MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                                >
                                    {users.map((user: any, index) => (
                                        <MenuItem key={`${user.id}-${index}`} value={user.id}>
                                            <Checkbox checked={coOwners.indexOf(user.id) > -1} />
                                            <ListItemText primary={user.name} />
                                        </MenuItem>
                                    ))}
                                </Select>

                            </FormControl>
                        </Grid>
                        {/* Control Point */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='control_point'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='Review Frequency' error={!!errors.control_point} helperText={errors.control_point?.message}
                                        SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 250 } } } }}
                                    >
                                        {controlPointOptions.map((opt, index) => (
                                            <MenuItem key={`${opt}-${index}`} value={opt}>{opt}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        {/* Start Date */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='start_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selectsStart
                                        id='ap-start-date'
                                        startDate={safeParseDate(value) || undefined}
                                        endDate={safeParseDate(endDate) || undefined}
                                        selected={safeParseDate(value)}
                                        minDate={initMinDate || undefined}
                                        maxDate={initMaxDate || undefined}
                                        onChange={(date: Date | null) => handleStartDateChange(date, onChange)}
                                        placeholderText='DD/MM/YYYY'
                                        dateFormat="dd/MM/yyyy"
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}

                                        customInput={<PickersComponent label='Start Date' error={!!errors.start_date} helperText={errors.start_date?.message} />}
                                    />
                                )}
                            />
                        </Grid>

                        {/* End Date */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='end_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selectsEnd
                                        id='ap-end-date'
                                        startDate={safeParseDate(startDate) || undefined}
                                        endDate={safeParseDate(value) || undefined}
                                        selected={safeParseDate(value)}
                                        minDate={safeParseDate(startDate) || initMinDate || undefined}
                                        maxDate={initMaxDate || undefined}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholderText='DD/MM/YYYY'
                                        dateFormat="dd/MM/yyyy"
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={<PickersComponent label='End Date' error={!!errors.end_date} helperText={errors.end_date?.message} />}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Reminder Date */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='reminder_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        id='ap-reminder-date'
                                        selected={safeParseDate(value)}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholderText='DD/MM/YYYY'
                                        dateFormat="dd/MM/yyyy"
                                        customInput={<PickersComponent label='Reminder Date' error={!!errors.reminder_date} helperText={errors.reminder_date?.message} />}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Status (Edit only) */}
                        {dataEdit && (
                            <>
                                {/* <Grid size={{ xs: 12, sm: 6 }}>
                                    <Controller
                                        name='status'
                                        control={control}
                                        render={({ field }) => (
                                            <TextField select {...field} fullWidth label='Status' error={!!errors.status} helperText={errors.status?.message}>
                                                {statuses.map((s: any) => (
                                                    <MenuItem key={s.status_id} value={String(s.status_id)}>{s.status_name}</MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </Grid> */}
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name='comment'
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} fullWidth multiline rows={2} label='Respons For Change' error={!!errors.comment} helperText={errors.comment?.message} />
                                        )}
                                    />
                                </Grid>
                            </>
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

export default AddEditActionPlan
