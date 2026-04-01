'use client'

import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import DirectionalIcon from '@components/DirectionalIcon'

// Redux & Auth
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { addNewCompanySetupRequest, deleteDepartmentRequest } from '@/redux-store/slices/user/user.slice'
import { toast } from 'react-toastify'

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { title: string; subtitle: string }[]
  companyData?: any
  unitOptions: { value: string; label: string }[]
  fetchCompanyData: () => void
}

type Department = {
  id: number
  unitName: string
  department: string
  departmentAdmin: string
  userEmail: string
  department_id?: number
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const StepDepartmentDetails = ({
  activeStep,
  handleNext,
  handlePrev,
  steps,
  companyData,
  unitOptions,
  fetchCompanyData
}: Props) => {
  const { data: session } = useSession()
  const dispatch = useDispatch()

  const [departments, setDepartments] = useState<Department[]>([
    {
      id: Date.now(),
      unitName: '',
      department: '',
      departmentAdmin: '',
      userEmail: ''
    }
  ])

  const [errors, setErrors] = useState<{ [key: number]: Partial<Department> }>({})

  // Initialize first department with session data when session becomes available
  useEffect(() => {
    if (session?.user && departments.length === 1 && departments[0].departmentAdmin === '') {
      setDepartments(prev => [{
        ...prev[0],
        departmentAdmin: session.user?.name || '',
        userEmail: session.user?.email || ''
      }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (companyData && companyData.comanyDept && companyData.comanyDept.length > 0) {
      const loadedDepts = companyData.comanyDept.map((d: any) => ({
        id: Date.now() + Math.random(),
        unitName: d.unit_id ? String(d.unit_id) : '',
        department: d.dept_name || '',
        departmentAdmin: session?.user?.name || '',
        userEmail: session?.user?.email || '',
        department_id: d.id
      }))
      setDepartments(loadedDepts)
    }
  }, [companyData, session])

  // ➕ Add department
  const handleAddDepartment = () => {
    if (session?.user) {
      setDepartments([
        ...departments,
        {
          id: Date.now(),
          unitName: '',
          department: '',
          departmentAdmin: session.user?.name || '',
          userEmail: session.user?.email || ''
        }
      ])
    }
  }

  //  Delete department
  const handleDeleteDepartment = (id: number) => {
    // Check if it's an existing department
    const deptToDelete = departments.find(d => d.id === id);
    if (deptToDelete && deptToDelete.department_id) {
      // API call to delete existing department
      if (session?.user && (session.user as any).accessToken) {
        dispatch(deleteDepartmentRequest({
          payload: {
            // @ts-ignore
            login_access_token: session.user.accessToken,
            dept_id: String(deptToDelete.department_id),
            user_id: (session.user as any).id
          },
          callback: (response, error) => {
            if (response && response.status === 'success') {
              toast.success(response.message || 'Department deleted successfully')
              fetchCompanyData()
              // Remove from UI after successful API deletion
              setDepartments(departments.filter(d => d.id !== id))
            } else {
              toast.error(response?.message || 'Error deleting department')
              console.error(error)
            }
          }
        }))
      }
    } else {
      // Just remove from UI if it's a new unsaved one
      setDepartments(departments.filter(d => d.id !== id))
    }

    setErrors(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  //  Input change
  const handleInputChange = (
    id: number,
    field: keyof Department,
    value: string
  ) => {
    setDepartments(prev =>
      prev.map(d => (d.id === id ? { ...d, [field]: value } : d))
    )

    setErrors(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: '' }
    }))
  }

  //  Validation
  const validateForm = () => {
    const newErrors: { [key: number]: Partial<Department> } = {}
    let valid = true

    departments.forEach(d => {
      const err: Partial<Department> = {}

      if (!d.unitName) err.unitName = 'Unit is required'
      if (!d.department) err.department = 'Department name is required'
      if (!d.departmentAdmin) err.departmentAdmin = 'Department admin is required'
      if (!d.userEmail) err.userEmail = 'Email is required'
      else if (!isValidEmail(d.userEmail)) err.userEmail = 'Invalid email'

      if (Object.keys(err).length) {
        newErrors[d.id] = err
        valid = false
      }
    })

    setErrors(newErrors)
    return valid
  }

  //  Submit (API call – SAME as StepUnitDetails)
  const handleNextClick = () => {
    if (!validateForm()) return

    if (session?.user && (session.user as any).accessToken) {
      const itemdepartments = departments.map(d => ({
        company_id: companyData?.comanyInfo?.[0]?.company_id || '',
        user_id: (session.user as any).id,
        unit_id: d.unitName,
        department_id: d.department_id || '',
        dept_name: d.department,
        department_admin: d.departmentAdmin,
        admin_email: d.userEmail
      }))

      const payload = {
        login_access_token: (session.user as any).accessToken,
        user_id: (session.user as any).id,
        company_id: companyData?.comanyInfo?.[0]?.company_id || '',
        company_step_id: companyData?.comanyInfo?.[0]?.company_step_id || '',
        step_no: 3,
        step_name: 'comanyDept',
        companyDetails: 'comanyDept',
        itemdepartments
      }

      dispatch(
        addNewCompanySetupRequest({
          payload,
          callback: (response, error) => {
            if (response?.status === 'success') {
              toast.success(response.message)
              fetchCompanyData()
              handleNext()
            } else {
              toast.error(response?.message || 'Something went wrong')
              console.error(error || response)
            }
          }
        })
      )
    }
  }

  return (
    <Grid container spacing={5} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ width: '100%' }}>
        {departments.map((dept, index) => (
          <Grid container spacing={5} key={dept.id} width='100%' sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors[dept.id]?.unitName}>
                <InputLabel>Unit name</InputLabel>
                <Select
                  label='Unit name'
                  value={dept.unitName}
                  onChange={e =>
                    handleInputChange(dept.id, 'unitName', e.target.value)
                  }
                >
                  <MenuItem value='' disabled>
                    Select unit
                  </MenuItem>
                  {unitOptions.map(u => (
                    <MenuItem key={u.value} value={u.value}>
                      {u.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Department name'
                value={dept.department}
                onChange={e =>
                  handleInputChange(dept.id, 'department', e.target.value)
                }
                error={!!errors[dept.id]?.department}
                helperText={errors[dept.id]?.department}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Department admin'
                value={dept.departmentAdmin}
                onChange={e =>
                  handleInputChange(dept.id, 'departmentAdmin', e.target.value)
                }
                error={!!errors[dept.id]?.departmentAdmin}
                helperText={errors[dept.id]?.departmentAdmin}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4.5 }}>
              <TextField
                fullWidth
                type='email'
                label='User email'
                value={dept.userEmail}
                onChange={e =>
                  handleInputChange(dept.id, 'userEmail', e.target.value)
                }
                error={!!errors[dept.id]?.userEmail}
                helperText={errors[dept.id]?.userEmail}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 1.5 }} className='flex items-center'>
              {index === 0 ? (
                <Button
                  size='medium'
                  variant='contained'
                  onClick={handleAddDepartment}
                  // startIcon={<i className='ri-add-line' />}
                  sx={{ maxWidth: 75 }}
                >
                  Add
                </Button>
              ) : (
                <Button
                  size='medium'
                  variant='contained'
                  color='error'
                  onClick={() => handleDeleteDepartment(dept.id)}
                  // startIcon={<i className='ri-subtract-line' />}
                  sx={{ maxWidth: 75 }}
                >
                  Delete
                </Button>
              )}
            </Grid>
          </Grid>
        ))}
      </div>

      {/* Footer */}
      <Grid size={{ xs: 12 }} className='pbs-6'>
        <div className='flex items-center justify-between'>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handlePrev}
            startIcon={
              <DirectionalIcon
                ltrIconClass='ri-arrow-left-line'
                rtlIconClass='ri-arrow-right-line'
              />
            }
          >
            Previous
          </Button>

          <Button
            variant='contained'
            onClick={handleNextClick}
            endIcon={
              activeStep === steps.length - 1 ? (
                <i className='ri-check-line' />
              ) : (
                <DirectionalIcon
                  ltrIconClass='ri-arrow-right-line'
                  rtlIconClass='ri-arrow-left-line'
                />
              )
            }
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </div>
      </Grid>
    </Grid>
  )
}

export default StepDepartmentDetails
