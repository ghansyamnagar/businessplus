// React Imports
import { useEffect, useState, useMemo } from 'react'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, minLength, email, array, number, optional, regex } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Slice Imports
import { addUserRequest, editUserRequest, getUnitListRequest, getDepartmentListRequest, getSectionListRequest } from '@/redux-store/slices/user/user.slice'

type AddEditUserInfoProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: UsersType
}

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
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'

// Types Imports
import type { UsersType } from '@/types/apps/userTypes'
import type { UnitsType } from '@/types/apps/unitTypes'
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { SectionType } from '@/types/apps/sectionTypes'

const baseSchema = object({
    name: pipe(string(), nonEmpty('Name is required'), minLength(1, 'Name is required')),
    email: pipe(string(), nonEmpty('Email is required'), email('Invalid email format')),
    role_id: pipe(string(), nonEmpty('Role is required')),
    designation: pipe(string(), nonEmpty('Designation is required')),
    address: pipe(string(), nonEmpty('Address is required')),
    city: pipe(string(), nonEmpty('City is required')),
    mobile: pipe(string(), nonEmpty('Mobile is required'), regex(/^[0-9]+$/, 'Only numeric characters are allowed')),
    gender: pipe(string(), nonEmpty('Gender is required')),
    multi_unit_id: array(string(), 'Select at least one unit'),
    multi_dept_id: array(string(), 'Select at least one department'),
    multi_section_id: array(string()),
    password: optional(string())
})

type FormData = InferInput<typeof baseSchema>

const AddEditUserInfo = ({ open, handleClose, data }: AddEditUserInfoProps) => {
    const dispatch = useDispatch()

    const schema = useMemo(() => object({
        name: pipe(string(), nonEmpty('Name is required'), minLength(1, 'Name is required')),
        email: pipe(string(), nonEmpty('Email is required'), email('Invalid email format')),
        role_id: pipe(string(), nonEmpty('Role is required')),
        designation: pipe(string(), nonEmpty('Designation is required')),
        address: pipe(string(), nonEmpty('Address is required')),
        city: pipe(string(), nonEmpty('City is required')),
        mobile: pipe(string(), nonEmpty('Mobile is required'), regex(/^[0-9]+$/, 'Only numeric characters are allowed')),
        gender: pipe(string(), nonEmpty('Gender is required')),
        multi_unit_id: array(string(), 'Select at least one unit'),
        multi_dept_id: array(string(), 'Select at least one department'),
        multi_section_id: array(string()),
        password: data?.user_id ? optional(string()) : pipe(string(), nonEmpty('Password is required'), minLength(6, 'Min 6 characters'))
    }), [data?.user_id])

    const [units, setUnits] = useState<UnitsType[]>([])
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [sections, setSections] = useState<SectionType[]>([])

    const [userRolelist] = useState([
        { id: 2, display_name: 'Company Admin' },
        { id: 3, display_name: 'Top Management (L1)' },
        { id: 4, display_name: 'Department Admin (L2)' },
        { id: 5, display_name: 'Management Admin (L3)' },
        { id: 6, display_name: 'Section Admin (L4)' },
        { id: 7, display_name: 'User' }
    ])
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
            name: '',
            email: '',
            role_id: '',
            designation: '',
            address: '',
            city: '',
            mobile: '',
            gender: 'male',
            multi_unit_id: [],
            multi_dept_id: [],
            multi_section_id: [],
            password: ""

        }
    })

    const selectedUnitIds = watch('multi_unit_id')
    const selectedDeptIds = watch('multi_dept_id')

    const [loading, setLoading] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

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
        }
    }, [open, dispatch])

    useEffect(() => {
        if (selectedUnitIds && selectedUnitIds.length > 0) {
            // Fetch departments for all selected units. Since API creates filtered list based on unit_id, we might fetching multiple times or need an API that accepts array.
            // Assuming existing API can handle comma separated or we fetch all and filter client side if API doesn't support list.
            // Based on provided APIs, getDepartmentListRequest takes unit_id. If multiple selection is needed, we ideally need an API supporting multiple IDs or fetch one by one.
            // For simplicity, let's assume we can fetch all or just fetch for the first one for now, OR the user selects one unit at a time.
            // BUT the Payload asks for multi_unit_id array.
            // Let's try fetching all departments if possible or fetch based on first unit if API restricted.
            // Ideally we need to fetch departments where unit_id IN (selectedUnitIds).
            // Current getDepartmentListRequest takes unit_id string. We might pass just one or empty to get all.
            // Let's pass empty to get all and filter client side for better experience if API supports it,
            // otherwise we might just fetch for the first selected unit or loop.
            // Let's try fetching all for now.
            dispatch(getDepartmentListRequest({
                payload: {}, // Fetch all to filter client side
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        // Filter departments that belong to selected units OR are already assigned to the user
                        const filteredDepts = response.data.filter((dept: any) =>
                            selectedUnitIds.includes(String(dept.unit_id)) ||
                            data?.multi_dept_ids?.some((d: any) => String(d.dept_id) === String(dept.dept_id))
                        )
                        setDepartments(filteredDepts)
                    } else {
                        setDepartments([])
                    }
                }
            }))
        } else {
            setDepartments([])
        }
    }, [selectedUnitIds, dispatch])

    useEffect(() => {
        if (selectedDeptIds && selectedDeptIds.length > 0) {
            dispatch(getSectionListRequest({
                payload: {},
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        // Filter sections by selected departments OR if already assigned
                        const filteredSections = response.data.filter((section: any) =>
                            selectedDeptIds.includes(String(section.dept_id)) ||
                            data?.multi_section_ids?.some((s: any) => String(s.section_id) === String(section.section_id))
                        )
                        setSections(filteredSections)
                    } else {
                        setSections([])
                    }
                }
            }))
        } else {
            setSections([])
        }
    }, [selectedDeptIds, dispatch])


    useEffect(() => {
        if (!open) return

        if (data?.user_id) {
            // Edit Mode
            reset({
                name: data.name || '',
                email: data.email || '',
                role_id: String(data.role_id || ''),
                designation: data.designation || '',
                address: data.address || '',
                city: data.city || '',
                mobile: data.mobile || '',
                gender: data.gender || 'male',
                multi_unit_id: data.multi_unit_ids?.map((u: any) => String(u.unit_id)) || [],
                multi_dept_id: data.multi_dept_ids?.map((d: any) => String(d.dept_id)) || [],
                multi_section_id: data.multi_section_ids?.map((s: any) => String(s.section_id)) || []
            })
        } else {
            // Add Mode
            reset({
                name: '',
                email: '',
                role_id: '',
                designation: '',
                address: '',
                city: '',
                mobile: '',
                gender: 'male',
                multi_unit_id: [],
                multi_dept_id: [],
                multi_section_id: [],
                password: ""
            })
        }
    }, [open, data?.user_id])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset({
            name: '',
            email: '',
            role_id: '',
            designation: '',
            address: '',
            city: '',
            mobile: '',
            gender: 'male',
            multi_unit_id: [],
            multi_dept_id: [],
            multi_section_id: [],
            password: ""
        })
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        setLoading(true)

        const commonPayload = {
            name: formData.name,
            email: formData.email,
            role_id: Number(formData.role_id),
            designation: formData.designation,
            address: formData.address,
            city: formData.city,
            mobile: formData.mobile,
            gender: formData.gender,
            multi_unit_id: formData.multi_unit_id.map(Number),
            multi_dept_id: formData.multi_dept_id.map(Number),
            multi_section_id: formData.multi_section_id ? formData.multi_section_id.map(Number) : []

        }

        if (data?.user_id) {
            // Edit mode
            dispatch(editUserRequest({
                payload: {
                    ...commonPayload,
                    user_id: data.user_id,
                    // Additional fields required by edit API but not in form
                    mobile2: data.mobile2 || '',
                    date_birth: data.date_birth || '',
                    pan_card_no: data.pan_card_no || ''
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'User updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating user')
                    }
                    setLoading(false)
                }
            }))
        } else {
            // Add mode
            dispatch(addUserRequest({
                payload: {
                    ...commonPayload,
                    password: formData.password,
                    passwordConfirm: formData.password
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'User added successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error adding user')
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
            PaperProps={{ className: 'max-is-[800px]' }}
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>{data ? 'Edit' : 'Add'} User Information</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Full Name'
                                        placeholder='John Doe'
                                        error={!!errors.name}
                                        helperText={errors.name?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='email'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Email'
                                        placeholder='john@example.com'
                                        error={!!errors.email}
                                        helperText={errors.email?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Designation'
                                        placeholder='Manager'
                                        error={!!errors.designation}
                                        helperText={errors.designation?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='address'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Address'
                                        placeholder='123 Main St'
                                        error={!!errors.address}
                                        helperText={errors.address?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='city'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='City'
                                        placeholder='New York'
                                        error={!!errors.city}
                                        helperText={errors.city?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='mobile'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Mobile'
                                        placeholder='1234567890'
                                        error={!!errors.mobile}
                                        helperText={errors.mobile?.message as string}
                                    />
                                )}
                            />
                        </Grid>
                        {!data?.user_id && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name='password'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type={isPasswordVisible ? 'text' : 'password'}
                                            label='Password'
                                            placeholder='············'
                                            error={!!errors.password}
                                            helperText={errors.password?.message as string}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position='end'>
                                                            <IconButton
                                                                size='small'
                                                                edge='end'
                                                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                                                onMouseDown={e => e.preventDefault()}
                                                            >
                                                                <i className={isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='role_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        fullWidth
                                        label='Role'
                                        error={!!errors.role_id}
                                        helperText={errors.role_id?.message as string}
                                    >
                                        {userRolelist.map((role: any) => (
                                            <MenuItem key={role.id} value={String(role.id)}>
                                                {role.display_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='gender'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        fullWidth
                                        label='Gender'
                                        error={!!errors.gender}
                                        helperText={errors.gender?.message as string}
                                    >
                                        <MenuItem value='male'>Male</MenuItem>
                                        <MenuItem value='female'>Female</MenuItem>
                                        <MenuItem value='other'>Other</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='multi_unit_id'
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.multi_unit_id}>
                                        <InputLabel>Units</InputLabel>
                                        <Select
                                            {...field}
                                            multiple
                                            label='Units'
                                            renderValue={(selected) => (
                                                (selected as string[]).map((value) => {
                                                    const unit = units.find(u => String(u.id) === value)
                                                    return unit?.unit_name
                                                }).join(', ')
                                            )}
                                            MenuProps={{
                                                PaperProps: {
                                                    className: 'max-h-[300px] max-w-[300px]'
                                                }
                                            }}
                                        >
                                            {units.map((unit) => (
                                                <MenuItem key={unit.id} value={String(unit.id)}>
                                                    <Checkbox checked={field.value.indexOf(String(unit.id)) > -1} />
                                                    <ListItemText primary={unit.unit_name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.multi_unit_id && <FormHelperText>{errors.multi_unit_id.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='multi_dept_id'
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.multi_dept_id}>
                                        <InputLabel>Departments</InputLabel>
                                        <Select
                                            {...field}
                                            multiple
                                            label='Departments'
                                            disabled={!selectedUnitIds || selectedUnitIds.length === 0}
                                            renderValue={(selected) => (
                                                (selected as string[]).map((value) => {
                                                    const dept = departments.find(d => String(d.dept_id) === value)
                                                    return dept?.dept_name
                                                }).join(', ')
                                            )}
                                            MenuProps={{
                                                PaperProps: {
                                                    className: 'max-h-[300px] max-w-[300px]'
                                                }
                                            }}
                                        >
                                            {departments.map((dept) => (
                                                <MenuItem key={dept.dept_id} value={String(dept.dept_id)}>
                                                    <Checkbox checked={field.value.indexOf(String(dept.dept_id)) > -1} />
                                                    <ListItemText primary={dept.dept_name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.multi_dept_id && <FormHelperText>{errors.multi_dept_id.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='multi_section_id'
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.multi_section_id}>
                                        <InputLabel>Sections</InputLabel>
                                        <Select
                                            {...field}
                                            multiple
                                            label='Sections'
                                            disabled={!selectedDeptIds || selectedDeptIds.length === 0}
                                            renderValue={(selected) => (
                                                (selected as string[]).map((value) => {
                                                    const section = sections.find(s => String(s.section_id) === value)
                                                    return section?.section_name || value
                                                }).join(', ')
                                            )}
                                            MenuProps={{
                                                PaperProps: {
                                                    className: 'max-h-[300px] max-w-[300px]'
                                                }
                                            }}
                                        >
                                            {sections.map((section) => (
                                                <MenuItem key={section.section_id} value={String(section.section_id)}>
                                                    <Checkbox checked={field.value.indexOf(String(section.section_id)) > -1} />
                                                    <ListItemText primary={section.section_name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.multi_section_id && <FormHelperText>{errors.multi_section_id.message}</FormHelperText>}
                                    </FormControl>
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

export default AddEditUserInfo
