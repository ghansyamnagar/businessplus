'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'

// Third-party Imports
import { toast } from 'react-toastify'

// Redux Imports
import { useDispatch } from 'react-redux'
import {
    updateProfileRequest,
    viewUnitRequest,
    getDeptSignupRequest,
    getSectionSignupRequest
} from '@/redux-store/slices/auth/auth.slice'

// Type Imports
import type { UserProfileData } from './index'

type UnitOption = { id: number; unit_name: string }
type DeptOption = { multi_dept_id: number; dept_name: string; unit_id: number; unit_name: string }
type SectionOption = { multi_section_id: number; section_name: string; dept_id: number; dept_name: string }

interface EditProfileModalProps {
    open: boolean
    onClose: () => void
    profileData: UserProfileData | null
    onSuccess: () => void
}

const EditProfileModal = ({ open, onClose, profileData, onSuccess }: EditProfileModalProps) => {
    const dispatch = useDispatch()
    const userData = profileData?.user_data

    // Form states
    const [name, setName] = useState('')
    const [designation, setDesignation] = useState('')
    const [gender, setGender] = useState('')
    const [mobile, setMobile] = useState('')
    const [mobile2, setMobile2] = useState('')
    const [email, setEmail] = useState('')
    const [city, setCity] = useState('')
    const [address, setAddress] = useState('')
    const [dateBirth, setDateBirth] = useState('')
    const [dateHire, setDateHire] = useState('')
    const [panCardNo, setPanCardNo] = useState('')

    // Multi-select states (disabled)
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([])
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([])
    const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([])

    // Options from API
    const [unitOptions, setUnitOptions] = useState<UnitOption[]>([])
    const [deptOptions, setDeptOptions] = useState<DeptOption[]>([])
    const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([])

    // Loading states
    const [saving, setSaving] = useState(false)
    const [loadingUnits, setLoadingUnits] = useState(false)
    const [loadingDepts, setLoadingDepts] = useState(false)
    const [loadingSections, setLoadingSections] = useState(false)

    // Populate form when profileData changes or dialog opens
    useEffect(() => {
        if (open && userData) {
            setName(userData.name || '')
            setDesignation(userData.designation || '')
            setGender(userData.gender || '')
            setMobile(userData.mobile || '')
            setMobile2(userData.mobile2 || '')
            setEmail(userData.email || '')
            setCity(userData.city || '')
            setAddress(userData.address || '')
            setDateBirth(userData.date_birth || '')
            setDateHire(userData.date_hire || '')
            setPanCardNo(userData.pan_card_no || '')

            // Parse multi IDs
            const unitIds = userData.multi_unit_id
                ? userData.multi_unit_id.split(',').map(Number).filter(Boolean)
                : []
            const deptIds = userData.multi_dept_id
                ? userData.multi_dept_id.split(',').map(Number).filter(Boolean)
                : []
            const sectionIds = userData.multi_section_id
                ? userData.multi_section_id.split(',').map(Number).filter(Boolean)
                : []

            setSelectedUnitIds(unitIds)
            setSelectedDeptIds(deptIds)
            setSelectedSectionIds(sectionIds)

            // Fetch dropdown data
            fetchUnits()

            if (unitIds.length > 0) {
                fetchDepts(unitIds)
            }

            if (deptIds.length > 0) {
                fetchSections(deptIds)
            }
        }
    }, [open, userData])

    const fetchUnits = () => {
        setLoadingUnits(true)

        dispatch(
            viewUnitRequest({
                payload: {},
                callback: (response: any, error: any) => {
                    setLoadingUnits(false)

                    if (response && !error && response?.status === 'success') {
                        setUnitOptions(response.data || [])
                    }
                }
            })
        )
    }

    const fetchDepts = (unitIds: number[]) => {
        setLoadingDepts(true)

        dispatch(
            getDeptSignupRequest({
                payload: { unit_id: unitIds, profile: 'profile' },
                callback: (response: any, error: any) => {
                    setLoadingDepts(false)

                    if (response && !error && response?.status === 'success') {
                        setDeptOptions(response.data || [])
                    }
                }
            })
        )
    }

    const fetchSections = (deptIds: number[]) => {
        setLoadingSections(true)

        dispatch(
            getSectionSignupRequest({
                payload: { dept_id: deptIds, profile: 'profile' },
                callback: (response: any, error: any) => {
                    setLoadingSections(false)

                    if (response && !error && response?.status === 'success') {
                        setSectionOptions(response.data || [])
                    }
                }
            })
        )
    }

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error('Name is required')
            return
        }

        if (!email.trim()) {
            toast.error('Email is required')
            return
        }

        setSaving(true)

        dispatch(
            updateProfileRequest({
                payload: {
                    name,
                    designation,
                    gender,
                    mobile,
                    mobile2,
                    email,
                    city,
                    address,
                    date_birth: dateBirth || null,
                    date_hire: dateHire || null,
                    pan_card_no: panCardNo,
                    emp_id: userData?.emp_id || 0,
                    multi_unit_id: selectedUnitIds,
                    multi_dept_id: selectedDeptIds,
                    multi_section_id: selectedSectionIds
                },
                callback: (response: any, error: any) => {
                    setSaving(false)

                    if (response && !error) {
                        toast.success(response?.message || 'Profile updated successfully')
                        onSuccess()
                        onClose()
                    } else {
                        toast.error(error?.message || 'Failed to update profile')
                    }
                }
            })
        )
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
            <DialogTitle className='flex justify-between items-center'>
                Edit Profile
                <IconButton size='small' onClick={onClose}>
                    <i className='ri-close-line text-2xl' />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={4} className='pt-2'>
                    {/* Name */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='Full Name'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </Grid>

                    {/* Email */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='Email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            type='email'
                            required
                            slotProps={{ input: { readOnly: true } }}
                        />
                    </Grid>

                    {/* Designation */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='Designation'
                            value={designation}
                            onChange={e => setDesignation(e.target.value)}
                        />
                    </Grid>

                    {/* Gender */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            select
                            label='Gender'
                            value={gender}
                            onChange={e => setGender(e.target.value)}
                        >
                            <MenuItem value='male'>Male</MenuItem>
                            <MenuItem value='female'>Female</MenuItem>
                            <MenuItem value='other'>Other</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Mobile */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='Mobile'
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                        />
                    </Grid>

                    {/* Mobile 2 */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='Mobile 2'
                            value={mobile2}
                            onChange={e => setMobile2(e.target.value)}
                        />
                    </Grid>

                    {/* City */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='City'
                            value={city}
                            onChange={e => setCity(e.target.value)}
                        />
                    </Grid>

                    {/* Address */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='Address'
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </Grid>

                    {/* Date of Birth */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='Date of Birth'
                            type='date'
                            value={dateBirth}
                            onChange={e => setDateBirth(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Grid>

                    {/* Date of Hire */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='Date of Hire'
                            type='date'
                            value={dateHire}
                            onChange={e => setDateHire(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Grid>

                    {/* PAN Card No */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label='PAN Card No'
                            value={panCardNo}
                            onChange={e => setPanCardNo(e.target.value)}
                        />
                    </Grid>

                    {/* Spacer */}
                    <Grid size={{ xs: 12, sm: 6 }} />

                    {/* Units - Disabled Multi-Select */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth disabled>
                            <InputLabel>Units</InputLabel>
                            <Select
                                multiple
                                value={selectedUnitIds}
                                input={<OutlinedInput label='Units' />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as number[]).map((id) => {
                                            const unit = unitOptions.find(u => u.id === id) || profileData?.unit_data?.find(u => u.unit_id === id)
                                            return <Chip key={id} label={unit ? (unit as any).unit_name : id} size='small' />
                                        })}
                                    </Box>
                                )}
                            >
                                {unitOptions.map(unit => (
                                    <MenuItem key={unit.id} value={unit.id}>
                                        {unit.unit_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Departments - Disabled Multi-Select */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth disabled>
                            <InputLabel>Departments</InputLabel>
                            <Select
                                multiple
                                value={selectedDeptIds}
                                input={<OutlinedInput label='Departments' />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as number[]).map((id) => {
                                            const dept = deptOptions.find(d => d.multi_dept_id === id) || profileData?.department_masters?.find(d => d.dept_id === id)
                                            return <Chip key={id} label={dept ? (dept as any).dept_name : id} size='small' />
                                        })}
                                    </Box>
                                )}
                            >
                                {deptOptions.map(dept => (
                                    <MenuItem key={dept.multi_dept_id} value={dept.multi_dept_id}>
                                        {dept.dept_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Sections - Disabled Multi-Select */}
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth disabled>
                            <InputLabel>Sections</InputLabel>
                            <Select
                                multiple
                                value={selectedSectionIds}
                                input={<OutlinedInput label='Sections' />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as number[]).map((id) => {
                                            const section = sectionOptions.find(s => s.multi_section_id === id) || profileData?.sections?.find(s => s.section_id === id)
                                            return <Chip key={id} label={section ? (section as any).section_name : id} size='small' />
                                        })}
                                    </Box>
                                )}
                            >
                                {sectionOptions.map(section => (
                                    <MenuItem key={section.multi_section_id} value={section.multi_section_id}>
                                        {section.section_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' color='secondary' onClick={onClose}>
                    Cancel
                </Button>
                <Button variant='contained' onClick={handleSubmit} disabled={saving}>
                    {saving ? <CircularProgress size={22} color='inherit' /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EditProfileModal
