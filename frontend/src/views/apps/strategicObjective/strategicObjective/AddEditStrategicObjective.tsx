"use client"

// React Imports
import { useEffect, useState, forwardRef } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, array, optional, minLength } from 'valibot'
import { format, parse } from 'date-fns'
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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
// Slice Imports
import { addStrategicObjectivesRequest, editStrategicObjectivesRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import { getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'
import { getUomListRequest } from '@/redux-store/slices/master/master.slice'

// Type Imports
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { StrategicObjectiveType } from '@/types/apps/strategicObjectiveTypes'

type AddEditStrategicObjectiveProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    dataEdit?: StrategicObjectiveType
    filterUnit: string
}

const getSchema = (isEdit: boolean) => object({
    target: pipe(string(), nonEmpty('Target is required')),
    unit_of_measurement: pipe(string(), nonEmpty('UoM is required')),
    start_date: pipe(string(), nonEmpty('Start Date is required')),
    end_date: pipe(string(), nonEmpty('End Date is required')),
    department_id: isEdit
        ? pipe(string(), nonEmpty('Department is required'))
        : pipe(
            array(string()),
            minLength(1, 'At least one Department is required')
        ),
    description: pipe(string(), nonEmpty('Description is required')),
    status: isEdit ? pipe(string(), nonEmpty('Status is required')) : optional(string()),
    comment: isEdit ? pipe(string(), nonEmpty('Status is required')) : optional(string()),
    // comment: optional(string())
})

type FormData = InferInput<ReturnType<typeof getSchema>>

// const STATUS_OPTIONS = [
//     { id: 1, name: 'Gray (Started)' },
//     { id: 2, name: 'Green (On Track)' },
//     { id: 3, name: 'Red (At Risk)' },
//     { id: 4, name: 'Yellow (Behind)' }
// ]

const AddEditStrategicObjective = ({ open, handleClose, dataEdit, filterUnit }: AddEditStrategicObjectiveProps) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [uoms, setUoms] = useState<any[]>([])

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
            target: '',
            unit_of_measurement: '',
            start_date: '',
            end_date: '',
            department_id: [],
            description: '',
            status: '',
            comment: ''
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

    useEffect(() => {
        if (open) {
            dispatch(getUomListRequest({
                payload: {},
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setUoms(response.data)
                    }
                }
            }))
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

    useEffect(() => {
        if (dataEdit) {
            reset({
                target: dataEdit.target || '',
                unit_of_measurement: dataEdit.uom_id ? String(dataEdit.uom_id) : '',
                start_date: dataEdit.start_date || '',
                end_date: dataEdit.end_date || '',
                department_id: dataEdit.department_id ? String(dataEdit.department_id) : '',
                description: dataEdit.description || '',
                status: dataEdit.status_id ? String(dataEdit.status_id) : '',
                comment: dataEdit.comment || ''
            })
        } else {
            reset({
                target: '',
                unit_of_measurement: '',
                start_date: '',
                end_date: '',
                department_id: [], // For ADD, it's an array
                description: '',
                status: '',
                comment: ''
            })
        }
    }, [dataEdit, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset()
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        setLoading(true)

        const formatDateForPayload = (dateStr: string) => {
            if (!dateStr) return ''
            try {
                const parsedDate = dateStr.includes('/')
                    ? parse(dateStr, 'dd/MM/yyyy', new Date())
                    : parse(dateStr, 'yyyy-MM-dd', new Date())
                return format(parsedDate, 'dd/MM/yyyy')
            } catch (error) {
                return dateStr
            }
        }

        const basePayload = {
            target: formData.target,
            unit_of_measurement: Number(formData.unit_of_measurement),
            start_date: formData.start_date,
            end_date: formData.end_date,
            description: formData.description,
            unit_id: filterUnit,
        }

        if (dataEdit?.strategic_objectives_id) {
            // Edit Mode
            const payload = {
                ...basePayload,
                strategic_objectives_id: dataEdit.strategic_objectives_id,
                department_id: Number(formData.department_id), // Single ID for edit
                status: Number(formData.status),
                comment: formData.comment || '',
                start_date: formatDateForPayload(formData.start_date),  // python ke code me remove karna he
                end_date: formatDateForPayload(formData.end_date), // python ke code me remove karna he
            }


            dispatch(editStrategicObjectivesRequest({
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
            const payload = {
                ...basePayload,
                department_id: (formData.department_id as string[]).map(Number) // Array of IDs for add
            }

            dispatch(addStrategicObjectivesRequest({
                payload,
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
                <div className='max-sm:is-[80%] max-sm:text-center'>{dataEdit ? 'Edit' : 'Add'} Strategic Objective</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='description'
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth multiline rows={3} label='Description' error={!!errors.description} helperText={errors.description?.message} />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            {/* Conditional Department Field */}
                            {dataEdit ? (
                                <Controller
                                    name='department_id'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField select {...field} fullWidth label='Department' error={!!errors.department_id} helperText={errors.department_id?.message}>
                                            {departments.map(dept => (
                                                <MenuItem key={dept.dept_id} value={String(dept.dept_id)}>{dept.dept_name}</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            ) : (
                                <Controller
                                    name='department_id'
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.department_id}>
                                            <InputLabel>Departments</InputLabel>
                                            <Select
                                                {...field}
                                                multiple
                                                label='Departments'
                                                renderValue={(selected) => (
                                                    <div className='flex flex-wrap gap-2'>
                                                        {(selected as string[]).map((value) => {
                                                            const dept = departments.find(d => String(d.dept_id) === value)
                                                            return <Chip key={value} label={dept?.dept_name} size='small' />
                                                        })}
                                                    </div>
                                                )}
                                            >
                                                {departments.map((dept) => (
                                                    <MenuItem key={dept.dept_id} value={String(dept.dept_id)}>
                                                        {dept.dept_name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.department_id && <p className='text-error text-xs mt-1'>{errors.department_id.message}</p>}
                                        </FormControl>
                                    )}
                                />
                            )}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='target'
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth label='Target' error={!!errors.target} helperText={errors.target?.message} />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='unit_of_measurement'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='UoM' error={!!errors.unit_of_measurement} helperText={errors.unit_of_measurement?.message}>
                                        {uoms.map((uom: any) => (
                                            <MenuItem key={uom.uom_id} value={String(uom.uom_id)}>{uom.uom_name}</MenuItem>
                                        ))}
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

                        {dataEdit && (
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name='comment'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} fullWidth multiline rows={2} label='Comment' error={!!errors.comment} helperText={errors.comment?.message} />
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

export default AddEditStrategicObjective
