
// React Imports
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, array, optional } from 'valibot'
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

// Slice Imports
import { addKpiTrackerRequest, editKpiTrackerRequest } from '@/redux-store/slices/kpiTracker/kpiTracker.slice'
import { getDepartmentListRequest, getSectionListRequest } from '@/redux-store/slices/user/user.slice'
import { getUomListRequest } from '@/redux-store/slices/master/master.slice'
import { getStratObjListByUnitReq } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import { getInitiativesListByStratObjReq } from '@/redux-store/slices/initiatives/initiatives.slice'
import { getActionPlansListByInitiativeReq } from '@/redux-store/slices/actionplans/actionplans.slice'
import { getCompanyDetailsFromLocal } from '@/redux-store/sagaHelpers'

// Type Imports
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { SectionType } from '@/types/apps/sectionTypes'

type AddEditKpiTrackerInfoProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    dataEdit?: any
    filterUnit: any
}

const getSchema = (isEdit: boolean) => object({
    kpi_name: pipe(string(), nonEmpty('KPI Name is required')),
    kpi_definition: pipe(string(), nonEmpty('Definition is required')),
    department_id: pipe(string(), nonEmpty('Department is required')),
    section_id: pipe(string(), nonEmpty('Section is required')),
    ideal_trend: pipe(string(), nonEmpty('Ideal Trend is required')),
    unit_of_measurement: pipe(string(), nonEmpty('UoM is required')),
    target_condition: pipe(string(), nonEmpty('Target Condition is required')),
    lead_kpi: pipe(string(), nonEmpty('Lead KPI is required')),
    kpi_performance: pipe(string(), nonEmpty('KPI Performance is required')),
    frequency: pipe(string(), nonEmpty('Frequency is required')),
    target_year: optional(string()),
    start_date: optional(string()),
    end_date: optional(string()),
    s_o_id: optional(string()),
    initiatives_id: optional(string()),
    action_plan_id: array(string()),
    jan: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    feb: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    mar: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    apr: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    may: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    jun: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    jul: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    aug: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    sep: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    oct: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    nov: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required')),
    dec: isEdit ? optional(string()) : pipe(string(), nonEmpty('Required'))
})

type FormData = InferInput<ReturnType<typeof getSchema>> & {
    [key: string]: any // Allow dynamic keys for monthly data
}

const AddEditKpiTrackerInfo = ({ open, handleClose, dataEdit, filterUnit }: AddEditKpiTrackerInfoProps) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [sections, setSections] = useState<SectionType[]>([])
    const [uoms, setUoms] = useState<any[]>([])

    const [strategicObjectives, setStrategicObjectives] = useState<any[]>([])
    const [initiatives, setInitiatives] = useState<any[]>([])
    const [actionPlans, setActionPlans] = useState<any[]>([])

    const [allDetailsCompany, setAllDetailsCompany] = useState<any>(null);

    useEffect(() => {
        setAllDetailsCompany(getCompanyDetailsFromLocal());
    }, []);

    const companyFinancialYear = allDetailsCompany?.general_data?.[0]?.financial_year;
    const currentYear = new Date().getFullYear();
    const defaultStartDate = `${currentYear}-01-01`;
    let defaultEndDate = `${currentYear}-12-31`;

    if (companyFinancialYear === "april-march") {
        defaultEndDate = `${currentYear + 1}-03-31`;
    }

    const {
        control,
        reset,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(getSchema(!!dataEdit)),
        defaultValues: {
            kpi_name: '',
            kpi_definition: '',
            department_id: '',
            section_id: '',
            ideal_trend: '',
            unit_of_measurement: '',
            target_condition: '',
            lead_kpi: '',
            kpi_performance: '',
            frequency: 'Monthly',
            target_year: currentYear.toString(),
            start_date: defaultStartDate,
            end_date: defaultEndDate,
            s_o_id: '',
            initiatives_id: '',
            action_plan_id: [],
            jan: '', feb: '', mar: '', apr: '', may: '', jun: '', jul: '', aug: '', sep: '', oct: '', nov: '', dec: ''
        }
    })

    const selectedDeptId = watch('department_id')
    const selectedSOId = watch('s_o_id')
    const selectedInitiativeId = watch('initiatives_id')

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
                        // Filter if API returns all
                        const filtered = response.data.filter((d: DepartmentType) => String(d.unit_id) === filterUnit)
                        setDepartments(filtered)
                    } else {
                        setDepartments([])
                    }
                }
            }))
        }
    }, [open, dispatch])

    // Fetch Strategic Objectives when Department changes
    useEffect(() => {
        if (selectedDeptId) {
            dispatch(getStratObjListByUnitReq({
                payload: { unit_id: filterUnit, dept_id: selectedDeptId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setStrategicObjectives(response?.data?.strategic_objectives)
                    } else {
                        setStrategicObjectives([])
                    }
                }
            }))
        } else {
            setStrategicObjectives([])
        }
    }, [dispatch, filterUnit, selectedDeptId])

    // Fetch Initiatives when Strategic Objective changes
    useEffect(() => {
        if (selectedSOId) {
            dispatch(getInitiativesListByStratObjReq({
                payload: { unit_id: filterUnit, s_o_id: selectedSOId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setInitiatives(response?.data?.initiatives)
                    } else {
                        setInitiatives([])
                    }
                }
            }))
        } else {
            setInitiatives([])
        }
    }, [selectedSOId, dispatch, filterUnit])

    // Fetch Action Plans when Initiative changes
    useEffect(() => {
        if (selectedInitiativeId) {
            dispatch(getActionPlansListByInitiativeReq({
                payload: { unit_id: filterUnit, initiatives_id: selectedInitiativeId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setActionPlans(response.data)
                    } else {
                        setActionPlans([])
                    }
                }
            }))
        } else {
            setActionPlans([])
        }
    }, [selectedInitiativeId, dispatch, filterUnit])

    // Fetch Sections when Department changes
    useEffect(() => {
        if (selectedDeptId) {
            dispatch(getSectionListRequest({
                payload: { dept_id: selectedDeptId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        const filtered = response.data.filter((s: SectionType) => String(s.dept_id) === selectedDeptId)
                        setSections(filtered)
                    } else {
                        setSections([])
                    }
                }
            }))
        } else {
            setSections([])
        }
    }, [selectedDeptId, dispatch])


    useEffect(() => {

        if (dataEdit) {
            reset({
                kpi_name: dataEdit.kpi_name || '',
                kpi_definition: dataEdit.kpi_definition || '',
                department_id: dataEdit.department_id ? String(dataEdit.department_id) : '',
                section_id: dataEdit.section_id ? String(dataEdit.section_id) : '',
                ideal_trend: dataEdit.ideal_trend || '',
                unit_of_measurement: dataEdit.unit_of_measurement ? String(dataEdit.unit_of_measurement) : '',
                target_condition: dataEdit.target_condition || '',
                lead_kpi: dataEdit.lead_kpi !== undefined ? String(dataEdit.lead_kpi) : '',
                kpi_performance: dataEdit.kpi_performance || '',
                frequency: dataEdit.frequency || 'Monthly',
                // target_year: dataEdit.target_year ? String(dataEdit.target_year) : new Date().getFullYear().toString(),
                // start_date: dataEdit.start_date || '',
                // end_date: dataEdit.end_date || '',
                s_o_id: dataEdit.s_o_id ? String(dataEdit.s_o_id) : '',
                initiatives_id: dataEdit.initiatives_id ? String(dataEdit.initiatives_id) : '',
                action_plan_id: dataEdit.action_plans ? dataEdit.action_plans.map((ap: any) => String(ap.action_plan_id)).filter(Boolean) : [],
            })
        } else {
            reset({
                kpi_name: '', kpi_definition: '', department_id: '', section_id: '',
                ideal_trend: '', unit_of_measurement: '', target_condition: '', lead_kpi: '',
                kpi_performance: '', frequency: 'Monthly', target_year: currentYear.toString(),
                start_date: defaultStartDate, end_date: defaultEndDate, s_o_id: '', initiatives_id: '', action_plan_id: [],
                jan: '', feb: '', mar: '', apr: '', may: '', jun: '', jul: '', aug: '', sep: '', oct: '', nov: '', dec: ''
            })
        }
    }, [dataEdit, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset()
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        // setLoading(true)
        const payload: any = {
            ...formData,
            unit_id: Number(filterUnit),
            department_id: Number(formData.department_id),
            section_id: Number(formData.section_id),
            s_o_id: Number(formData.s_o_id),
            initiatives_id: Number(formData.initiatives_id),
            action_plan_id: formData.action_plan_id.map(Number),
            unit_of_measurement: Number(formData.unit_of_measurement),
            // target_year: Number(formData.target_year),
            lead_kpi: String(formData.lead_kpi),
        }

        if (!dataEdit) {
            payload.jan = Number(formData.jan)
            payload.feb = Number(formData.feb)
            payload.mar = Number(formData.mar)
            payload.apr = Number(formData.apr)
            payload.may = Number(formData.may)
            payload.jun = Number(formData.jun)
            payload.jul = Number(formData.jul)
            payload.aug = Number(formData.aug)
            payload.sep = Number(formData.sep)
            payload.oct = Number(formData.oct)
            payload.nov = Number(formData.nov)
            payload.dec = Number(formData.dec)
        }
        if (dataEdit?.kpi_id) {
            dispatch(editKpiTrackerRequest({
                payload: { ...payload, kpi_id: dataEdit.kpi_id },
                callback: (response: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'KPI updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating KPI')
                    }
                    setLoading(false)
                }
            }))
        } else {
            dispatch(addKpiTrackerRequest({
                payload: payload,
                callback: (response: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'KPI added successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error adding KPI')
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
            maxWidth='lg'
            scroll='body'
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>{dataEdit ? 'Edit' : 'Add'} KPI Tracker</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        {/* Basic Info */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='kpi_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth label='KPI Name' error={!!errors.kpi_name} helperText={errors.kpi_name?.message} />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='department_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        fullWidth
                                        label='Department'
                                        disabled={!filterUnit}
                                        error={!!errors.department_id}
                                        helperText={errors.department_id?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    className: 'max-h-[300px] max-w-[300px]'
                                                }
                                            }
                                        }}
                                    >
                                        {departments.map(dept => (
                                            <MenuItem key={dept.dept_id} value={String(dept.dept_id)}>{dept.dept_name}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='section_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        fullWidth
                                        label='Section'
                                        disabled={!selectedDeptId}
                                        error={!!errors.section_id}
                                        helperText={errors.section_id?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    className: 'max-h-[300px] max-w-[300px]'
                                                }
                                            }
                                        }}
                                    >
                                        {sections.map(section => (
                                            <MenuItem key={section.section_id} value={String(section.section_id)}>{section.section_name}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        {/* Strategy & Planning */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='s_o_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        fullWidth
                                        label='Strategic Objective'
                                        error={!!errors.s_o_id}
                                        helperText={errors.s_o_id?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    className: 'max-h-[300px] max-w-[300px]'
                                                }
                                            }
                                        }}
                                    >
                                        {strategicObjectives.map(so => (
                                            <MenuItem key={so.id} value={String(so.id)}>{so.description}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='initiatives_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        fullWidth
                                        label='Initiative'
                                        error={!!errors.initiatives_id}
                                        helperText={errors.initiatives_id?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    className: 'max-h-[300px] max-w-[300px]'
                                                }
                                            }
                                        }}
                                    >
                                        {initiatives.map(item => (
                                            <MenuItem key={item.id} value={String(item.id)}>{item.definition}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='action_plan_id'
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>Action Plans</InputLabel>
                                        <Select
                                            {...field}
                                            multiple
                                            label='Action Plans'
                                            renderValue={(selected) => (
                                                <div className='flex flex-wrap gap-2'>
                                                    {(selected as string[]).map((value) => {
                                                        const item = actionPlans.find(ap => String(ap.action_plan_id) === value)
                                                        return <Chip key={value} label={item?.definition} size='small' />
                                                    })}
                                                </div>
                                            )}
                                            MenuProps={{
                                                PaperProps: {
                                                    className: 'max-h-[300px] max-w-[300px]'
                                                }
                                            }}
                                        >
                                            {actionPlans.map((ap) => (
                                                <MenuItem key={ap.action_plan_id} value={String(ap.action_plan_id)}>
                                                    {ap.definition}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* KPI Details */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='ideal_trend'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='Ideal Trend' error={!!errors.ideal_trend} helperText={errors.ideal_trend?.message}>
                                        <MenuItem value='positive'>Positive (good if number goes up)</MenuItem>
                                        <MenuItem value='negative'>Negative (good if number goes down)</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='unit_of_measurement'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        fullWidth
                                        label='Unit Of Measurement'
                                        error={!!errors.unit_of_measurement}
                                        helperText={errors.unit_of_measurement?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    className: 'max-h-[300px] max-w-[300px]'
                                                }
                                            }
                                        }}
                                    >
                                        {uoms.map((uom: any) => (
                                            <MenuItem key={uom.uom_id} value={String(uom.uom_id)}>{uom.uom_name}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='target_condition'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='Year End Target' error={!!errors.target_condition} helperText={errors.target_condition?.message}>
                                        <MenuItem value='average'>Average</MenuItem>
                                        <MenuItem value='sum_up_all'>Sum Up-All</MenuItem>
                                        <MenuItem value='terminal_value'>Terminal (YE) Value</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='lead_kpi'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='Lead KPI' error={!!errors.lead_kpi} helperText={errors.lead_kpi?.message}>
                                        <MenuItem value='1'>Yes</MenuItem>
                                        <MenuItem value='0'>No</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='kpi_performance'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='KPI Performance' error={!!errors.kpi_performance} helperText={errors.kpi_performance?.message}>
                                        <MenuItem value='yes'>Yes</MenuItem>
                                        <MenuItem value='no'>No</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='frequency'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label='Frequency' error={!!errors.frequency} helperText={errors.frequency?.message}>
                                        <MenuItem value='Weekly'>Weekly</MenuItem>
                                        <MenuItem value='Monthly'>Monthly</MenuItem>
                                        <MenuItem value='Quarterly'>Quarterly</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        {/* <Grid size={{ xs: 12, sm: 4 }}>
                                <Controller
                                    name='target_year'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} fullWidth label='Target Year' type='number' error={!!errors.target_year} helperText={errors.target_year?.message} />
                                    )}
                                />
                            </Grid> */}
                        {/* <Grid size={{ xs: 12, sm: 4 }}>
                                <Controller
                                    name='start_date'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} fullWidth label='Start Date' type='date' InputLabelProps={{ shrink: true }} error={!!errors.start_date} helperText={errors.start_date?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Controller
                                    name='end_date'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} fullWidth label='End Date' type='date' InputLabelProps={{ shrink: true }} error={!!errors.end_date} helperText={errors.end_date?.message} />
                                    )}
                                />
                            </Grid> */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='kpi_definition'
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth label='KPI Definition' multiline rows={3} error={!!errors.kpi_definition} helperText={errors.kpi_definition?.message} />
                                )}
                            />
                        </Grid>

                        {/* Monthly Targets */}
                        {!dataEdit && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <InputLabel>Monthly Targets</InputLabel>
                                </Grid>
                                {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((month) => (
                                    <Grid size={{ xs: 6, sm: 2 }} key={month}>
                                        <Controller
                                            name={month}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label={month.toUpperCase()}
                                                    type='number'
                                                    size='small'
                                                    error={!!errors[month]}
                                                    helperText={errors[month]?.message as string}
                                                />
                                            )}
                                        />
                                    </Grid>
                                ))}
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

export default AddEditKpiTrackerInfo
