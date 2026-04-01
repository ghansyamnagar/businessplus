
// React Imports
import { useEffect, useState, forwardRef } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

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
import InputAdornment from '@mui/material/InputAdornment'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Slice Imports
import { addInitiativeReq, editInitiativeReq } from '@/redux-store/slices/initiatives/initiatives.slice'
import { getDepartmentListRequest, getSectionListRequest } from '@/redux-store/slices/user/user.slice'
import { getStratObjListByDeptReq } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'

// Type Imports
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { InitiativeType } from '@/types/apps/initiativeTypes'

type AddEditInitiativeProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    dataEdit?: InitiativeType
    filterUnit: string
}

const getSchema = (isEdit: boolean) => object({
    definition: pipe(string(), nonEmpty('Definition is required')),
    s_o_id: pipe(string(), nonEmpty('Strategic Objective is required')),
    dept_id: pipe(string(), nonEmpty('Department is required')),
    section_id: pipe(string(), nonEmpty('Section is required')),
    start_date: pipe(string(), nonEmpty('Start Date is required')),
    end_date: pipe(string(), nonEmpty('End Date is required')),
    status: isEdit ? pipe(string(), nonEmpty('Status is required')) : optional(string()),
    comment: isEdit ? pipe(string(), nonEmpty('Comment is required')) : optional(string())
})

type FormData = InferInput<ReturnType<typeof getSchema>>

// Helper to safely parse date strings in yyyy-MM-dd or dd-MM-yyyy format
const safeParseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null
    // Try yyyy-MM-dd first (ISO-like)
    let d = new Date(dateStr)
    if (isValid(d)) return d
    // Try dd-MM-yyyy
    d = parse(dateStr, 'dd-MM-yyyy', new Date())
    if (isValid(d)) return d
    // Try dd/MM/yyyy
    d = parse(dateStr, 'dd/MM/yyyy', new Date())
    if (isValid(d)) return d
    return null
}

// Convert any date string to yyyy-MM-dd for internal storage
const toInternalDate = (dateStr: string): string => {
    const d = safeParseDate(dateStr)
    return d ? format(d, 'yyyy-MM-dd') : ''
}

// Convert yyyy-MM-dd to dd-MM-yyyy for API payload
const toApiDate = (dateStr: string): string => {
    const d = safeParseDate(dateStr)
    return d ? format(d, 'dd-MM-yyyy') : ''
}

const AddEditInitiative = ({ open, handleClose, dataEdit, filterUnit }: AddEditInitiativeProps) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [sections, setSections] = useState<any[]>([])
    const [strategicObjectives, setStrategicObjectives] = useState<any[]>([])

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
            definition: '',
            s_o_id: '',
            dept_id: '',
            section_id: '',
            start_date: '',
            end_date: '',
            status: '',
            comment: ''
        }
    })

    const startDate = watch('start_date')
    const endDate = watch('end_date')
    const selectedDeptId = watch('dept_id')
    const selectedSOId = watch('s_o_id')

    // Get the selected Strategic Objective's date range
    const selectedSO = strategicObjectives.find((so: any) => String(so.id) === selectedSOId)
    const soMinDate = selectedSO?.start_date ? safeParseDate(selectedSO.start_date) : null
    const soMaxDate = selectedSO?.end_date ? safeParseDate(selectedSO.end_date) : null

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

    // Fetch sections when department changes
    useEffect(() => {
        if (selectedDeptId) {
            // Fetch strategic objectives
            dispatch(getStratObjListByDeptReq({
                payload: { dept_id: selectedDeptId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setStrategicObjectives(response?.data?.strategic_objectives)
                    } else {
                        setStrategicObjectives([])
                    }
                }
            }))
            dispatch(getSectionListRequest({
                payload: { dept_id: selectedDeptId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setSections(response.data)
                    } else {
                        setSections([])
                    }
                }
            }))
        } else {
            setSections([])
            setStrategicObjectives([])
        }
    }, [selectedDeptId, dispatch])

    useEffect(() => {
        if (dataEdit) {
            reset({
                definition: dataEdit.definition || '',
                s_o_id: dataEdit.s_o_id ? String(dataEdit.s_o_id) : '',
                dept_id: dataEdit.dept_id ? String(dataEdit.dept_id) : '',
                section_id: dataEdit.section_id ? String(dataEdit.section_id) : '',
                start_date: toInternalDate(dataEdit.start_date || ''),
                end_date: toInternalDate(dataEdit.end_date || ''),
                status: dataEdit.status_id ? String(dataEdit.status_id) : '',
                comment: dataEdit.comment || ''
            })
        } else {
            reset({
                definition: '',
                s_o_id: '',
                dept_id: '',
                section_id: '',
                start_date: '',
                end_date: '',
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

        const basePayload = {
            unit_id: filterUnit,
            s_o_id: Number(formData.s_o_id),
            definition: formData.definition,
            dept_id: Number(formData.dept_id),
            section_id: Number(formData.section_id),
            start_date: toApiDate(formData.start_date),
            end_date: toApiDate(formData.end_date),
        }

        if (dataEdit?.initiatives_id) {
            // Edit Mode
            const payload = {
                ...basePayload,
                initiatives_id: dataEdit.initiatives_id,
                status: Number(formData.status),
                comment: formData.comment || ''
            }

            dispatch(editInitiativeReq({
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
                so_sno: ''
            }

            dispatch(addInitiativeReq({
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
                <div className='max-sm:is-[80%] max-sm:text-center'>{dataEdit ? 'Edit' : 'Add'} Initiative</div>
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
                                        {departments.map(dept => (
                                            <MenuItem key={dept.dept_id} value={String(dept.dept_id)}>{dept.dept_name}</MenuItem>
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
                                        {strategicObjectives.map((so: any) => (
                                            <MenuItem key={so.id} value={String(so.id)}>
                                                {so.description}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            {selectedSO ? (
                                <Typography variant='body2' color='textSecondary'>
                                    <strong>Strategic Objective Duration:</strong>{' '}
                                    {selectedSO.start_date ? format(safeParseDate(selectedSO.start_date)!, 'dd-MM-yyyy') : '-'}
                                    {' to '}
                                    {selectedSO.end_date ? format(safeParseDate(selectedSO.end_date)!, 'dd-MM-yyyy') : '-'}
                                </Typography>
                            ) : (
                                <Typography variant='body2' color='textSecondary'>
                                    Please select a Strategic Objective to see its date range.
                                </Typography>
                            )}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='definition'
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth multiline rows={3} label='Definition' error={!!errors.definition} helperText={errors.definition?.message} />
                                )}
                            />
                        </Grid>

                        {/* Section */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='section_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='Section' error={!!errors.section_id} helperText={errors.section_id?.message} disabled={!selectedDeptId}
                                        SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 250 } } } }}
                                    >
                                        {sections.map((sec: any) => (
                                            <MenuItem key={sec.section_id} value={String(sec.section_id)}>{sec.section_name}</MenuItem>
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
                                        id='start-date'
                                        startDate={safeParseDate(value) || undefined}
                                        endDate={safeParseDate(endDate) || undefined}
                                        selected={safeParseDate(value)}
                                        minDate={soMinDate || undefined}
                                        maxDate={soMaxDate || undefined}
                                        onChange={(date: Date | null) => handleStartDateChange(date, onChange)}
                                        placeholderText='DD-MM-YYYY'
                                        dateFormat="dd-MM-yyyy"
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
                                        id='end-date'
                                        startDate={safeParseDate(startDate) || undefined}
                                        endDate={safeParseDate(value) || undefined}
                                        selected={safeParseDate(value)}
                                        minDate={safeParseDate(startDate) || soMinDate || undefined}
                                        maxDate={soMaxDate || undefined}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholderText='DD-MM-YYYY'
                                        dateFormat="dd-MM-yyyy"
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

export default AddEditInitiative
