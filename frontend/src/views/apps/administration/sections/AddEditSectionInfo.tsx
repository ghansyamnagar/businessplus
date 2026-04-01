// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, minLength } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Slice Imports
import { addSectionRequest, editSectionRequest, getUnitListRequest, getUserListRequest, getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import ListSubheader from '@mui/material/ListSubheader'

// Types Imports
import type { SectionType } from '@/types/apps/sectionTypes'
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { UnitsType } from '@/types/apps/unitTypes'

type AddEditSectionInfoProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: SectionType
}

const schema = object({
    section_name: pipe(string(), nonEmpty('Section name is required'), minLength(1, 'Section name is required')),
    unit_id: pipe(string(), nonEmpty('Unit is required')),
    dept_id: pipe(string(), nonEmpty('Department is required')),
    user_id: pipe(string(), nonEmpty('Section admin is required'))
})

type FormData = InferInput<typeof schema>

const AddEditSectionInfo = ({ open, handleClose, data }: AddEditSectionInfoProps) => {
    const dispatch = useDispatch()
    const [units, setUnits] = useState<UnitsType[]>([])
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [admins, setAdmins] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    const filteredAdmins = admins
        .filter(admin => admin.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))

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
            section_name: '',
            unit_id: '',
            dept_id: '',
            user_id: ''
        }
    })

    const selectedUnitId = watch('unit_id')

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            dispatch(getUnitListRequest({
                payload: {},
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setUnits(response.data)
                    }
                }
            }))

            dispatch(getUserListRequest({
                payload: {},
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setAdmins(response.data)
                    }
                }
            }))
        }
    }, [open, dispatch])

    useEffect(() => {
        if (selectedUnitId) {
            dispatch(getDepartmentListRequest({
                payload: { unit_id: selectedUnitId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setDepartments(response.data)
                    } else {
                        setDepartments([])
                    }
                }
            }))
        } else {
            setDepartments([])
        }
    }, [selectedUnitId, dispatch])


    useEffect(() => {
        if (!open) return

        if (data?.section_id) {
            // Edit Mode
            reset({
                section_name: data.section_name || '',
                unit_id: String(data.unit_id || ''),
                dept_id: String(data.dept_id || ''),
                user_id: String(data.user_id || '')
            })
        } else {
            // Add Mode
            reset({
                section_name: '',
                unit_id: '',
                dept_id: '',
                user_id: ''
            })
        }
    }, [open, data?.section_id])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset({
            section_name: '',
            unit_id: '',
            dept_id: '',
            user_id: ''
        })
        setSearchTerm('')
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        setLoading(true)

        const commonPayload = {
            role_id: '6',
            section_name: formData.section_name,
            unit_id: Number(formData.unit_id),
            dept_id: Number(formData.dept_id),
            user_id: formData.user_id,
            enable: 'Yes'
        }

        if (data?.section_id) {
            // Edit mode
            dispatch(editSectionRequest({
                payload: {
                    ...commonPayload,
                    section_id: data.section_id
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'Section updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating section')
                    }
                    setLoading(false)
                }
            }))
        } else {
            // Add mode
            dispatch(addSectionRequest({
                payload: commonPayload,
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'Section added successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error adding section')
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
            maxWidth={false}
            scroll='body'
            PaperProps={{ className: 'max-is-[600px]' }}
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>{data ? 'Edit' : 'Add'} Section Information</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='unit_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        fullWidth
                                        label='Unit'
                                        error={!!errors.unit_id}
                                        helperText={errors.unit_id?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 250
                                                    }
                                                }
                                            }
                                        }}
                                        onChange={(e) => {
                                            field.onChange(e)
                                            setValue('dept_id', '') // Reset department when unit changes
                                        }}
                                    >
                                        {units.map((unit) => (
                                            <MenuItem key={unit.id} value={String(unit.id)}>
                                                {unit.unit_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='dept_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        fullWidth
                                        label='Department'
                                        error={!!errors.dept_id}
                                        helperText={errors.dept_id?.message}
                                        disabled={!selectedUnitId}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 250
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        {departments.map((dept) => (
                                            <MenuItem key={dept.dept_id} value={String(dept.dept_id)}>
                                                {dept.dept_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='user_id'
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.user_id}>
                                        <InputLabel>Select section admin</InputLabel>
                                        <Select
                                            {...field}
                                            label='Select section admin'
                                            input={<OutlinedInput label="Select section admin" />}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 250
                                                    }
                                                }
                                            }}
                                        >
                                            <ListSubheader>
                                                <TextField
                                                    size="small"
                                                    autoFocus
                                                    placeholder="Type to search..."
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <i className="ri-search-line" />
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key !== "Escape") {
                                                            e.stopPropagation()
                                                        }
                                                    }}
                                                />
                                            </ListSubheader>
                                            {filteredAdmins.map((admin) => (
                                                <MenuItem key={admin.user_id} value={String(admin.user_id)}>
                                                    {admin.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.user_id && <FormHelperText>{errors.user_id.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='section_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Section name'
                                        placeholder='Section name'
                                        error={!!errors.section_name}
                                        helperText={errors.section_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>

                </DialogContent>
                <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[120px]'>
                        {loading ? <CircularProgress size={22} color='inherit' /> : data ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' type='reset' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>

                </DialogActions>
            </form>
        </Dialog >
    )
}

export default AddEditSectionInfo
