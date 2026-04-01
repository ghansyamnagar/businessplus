'use client'

import { useState, useEffect, forwardRef, useRef } from 'react'
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
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Redux Imports
import { addProjectDeviationRequest, updateProjectDeviationRequest } from '@/redux-store/slices/project/project.slice'
import { getSelectModulesRequest } from '@/redux-store/slices/master/master.slice'
import { getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const schema = object({
    deviation_name: pipe(string(), nonEmpty('Deviation name is required')),
    deviation_region: pipe(string(), nonEmpty('Reason is required')),
    deviation_risk: pipe(number(), check((val) => val > 0, 'Risk Level is required')),
    deviation_start_date: pipe(string(), nonEmpty('Deviation From is required')),
    deviation_end_date: pipe(string(), nonEmpty('Deviation To is required')),
    deviation_qty: pipe(string(), nonEmpty('Qty is required')),
    deviation_dept: pipe(number(), check((val) => val > 0, 'Department is required')),
    deviation_aprove_usr: pipe(number(), check((val) => val > 0, 'Approved By is required')),
})

type FormDataValues = InferInput<typeof schema>

interface AddEditProjectDeviationsProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: any
    projectData: any
}

const AddEditProjectDeviations = ({ open, handleClose, data, projectData }: AddEditProjectDeviationsProps) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [taskDataPriorities, setTaskDataPriorities] = useState<any[]>([])
    const [dataDepartment, setDataDepartment] = useState<any[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
        formState: { errors }
    } = useForm<FormDataValues>({
        resolver: valibotResolver(schema),
        defaultValues: {
            deviation_name: '',
            deviation_region: '',
            deviation_risk: 0,
            deviation_start_date: '',
            deviation_end_date: '',
            deviation_qty: '',
            deviation_dept: 0,
            deviation_aprove_usr: 0,
        }
    })

    const deviationStartDate = watch('deviation_start_date')

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
                deviation_name: data.deviation_name || '',
                deviation_region: data.deviation_region || '',
                deviation_risk: Number(data.deviation_risk) || 0,
                deviation_start_date: parseDate(data.deviation_start_date),
                deviation_end_date: parseDate(data.deviation_end_date),
                deviation_qty: data.deviation_qty || '',
                deviation_dept: Number(data.deviation_dept) || 0,
                deviation_aprove_usr: Number(data.deviation_aprove_usr) || 0,
            })
        } else if (open) {
            reset({
                deviation_name: '',
                deviation_region: '',
                deviation_risk: 0,
                deviation_start_date: '',
                deviation_end_date: '',
                deviation_qty: '',
                deviation_dept: 0,
                deviation_aprove_usr: 0,
            })
            setSelectedFile(null)
        }
    }, [open, data, reset])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0])
        }
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

    const onSubmit = (formDataValues: FormDataValues) => {
        setLoading(true)

        const formattedStartDate = formDataValues.deviation_start_date ? format(parse(formDataValues.deviation_start_date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : ''
        const formattedEndDate = formDataValues.deviation_end_date ? format(parse(formDataValues.deviation_end_date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : ''

        const fd = new FormData()
        if (selectedFile) {
            fd.append('upload_id', selectedFile)
        } else if (isEdit && data.file_id) {
            fd.append('file_id', data.file_id)
        }

        fd.append('project_id', projectData?.projectData?.[0]?.id)
        fd.append('deviation_name', formDataValues.deviation_name)
        fd.append('deviation_region', formDataValues.deviation_region)
        fd.append('deviation_risk', formDataValues.deviation_risk.toString())
        fd.append('deviation_start_date', formattedStartDate)
        fd.append('deviation_end_date', formattedEndDate)
        fd.append('deviation_qty', formDataValues.deviation_qty)
        fd.append('deviation_dept', formDataValues.deviation_dept.toString())
        fd.append('deviation_aprove_usr', formDataValues.deviation_aprove_usr.toString())
        fd.append('projectDetails', 'projectDeviation')

        if (isEdit) {
            fd.append('deviation_id', data.id)
        }

        const actionRequest = isEdit ? updateProjectDeviationRequest : addProjectDeviationRequest

        dispatch(actionRequest({
            payload: fd,
            callback: (res: any) => {
                setLoading(false)
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || `Deviation ${isEdit ? 'updated' : 'added'} successfully`)
                    handleClose(true)
                } else {
                    toast.error(res?.message || res?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} deviation`)
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={() => handleClose(false)} fullWidth maxWidth='md'>
            <DialogTitle variant='h5' className='flex flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8 text-center'>
                {isEdit ? 'Edit Project Deviation' : 'Add Project Deviation'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible'>
                    <IconButton onClick={() => handleClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='deviation_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Deviation'
                                        error={!!errors.deviation_name}
                                        helperText={errors.deviation_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='deviation_region'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Reason'
                                        error={!!errors.deviation_region}
                                        helperText={errors.deviation_region?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='deviation_start_date'
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
                                                label='Deviation From'
                                                error={!!errors.deviation_start_date}
                                                helperText={errors.deviation_start_date?.message}
                                            />
                                        }
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='deviation_end_date'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        minDate={deviationStartDate ? parse(deviationStartDate, 'yyyy-MM-dd', new Date()) : undefined}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat='yyyy-MM-dd'
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        yearDropdownItemNumber={50}
                                        customInput={
                                            <PickersComponent
                                                label='Deviation To'
                                                error={!!errors.deviation_end_date}
                                                helperText={errors.deviation_end_date?.message}
                                            />
                                        }
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='deviation_risk'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Risk Level'
                                        error={!!errors.deviation_risk}
                                        helperText={errors.deviation_risk?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: { className: tableStyles.maxHeight }
                                            }
                                        }}
                                    >
                                        <MenuItem value={0}>Select Risk Level</MenuItem>
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
                                name='deviation_qty'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Qty'
                                        error={!!errors.deviation_qty}
                                        helperText={errors.deviation_qty?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='deviation_dept'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Department'
                                        error={!!errors.deviation_dept}
                                        helperText={errors.deviation_dept?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: { className: tableStyles.maxHeight }
                                            }
                                        }}
                                    >
                                        <MenuItem value={0}>Select Department</MenuItem>
                                        {dataDepartment.map((dept: any, index: number) => (
                                            <MenuItem key={`dept-${dept?.dept_id || index}`} value={Number(dept?.dept_id || dept?.id)}>
                                                {dept?.dept_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='deviation_aprove_usr'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Approved By'
                                        error={!!errors.deviation_aprove_usr}
                                        helperText={errors.deviation_aprove_usr?.message}
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
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ border: '1px solid var(--mui-palette-divider)', p: 4, borderRadius: 1 }}>
                                <Typography variant='body2' className='mbe-2'>File Attachment</Typography>
                                <input
                                    type='file'
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept='.pdf,.xlsx,.xls,.png,.jpg,.jpeg'
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Button
                                        variant='outlined'
                                        size='small'
                                        onClick={() => fileInputRef.current?.click()}
                                        startIcon={<i className='ri-upload-2-line' />}
                                    >
                                        Choose File
                                    </Button>
                                    <Typography variant='body2'>
                                        {selectedFile ? selectedFile.name : (isEdit && data.file_name ? data.file_name : 'No file chosen')}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
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

export default AddEditProjectDeviations
