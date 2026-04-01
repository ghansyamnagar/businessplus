import { useState, useEffect } from 'react'
// MUI Imports
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Third-party Imports
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import { getDepartmentSignupRequest, addNewCompanySetupRequest, deleteSectionRequest } from '@/redux-store/slices/user/user.slice'

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { title: string; subtitle: string }[]
  companyData?: any
  unitOptions: { value: string; label: string }[]
  fetchCompanyData: () => void
}

type Section = {
  id: number
  unitName: string
  department: string
  section: string
  section_id?: number
}

const StepSectionDetails = ({ activeStep, handleNext, handlePrev, steps, companyData, unitOptions, fetchCompanyData }: Props) => {
  const [sections, setSections] = useState<Section[]>([{ id: Date.now(), unitName: '', department: '', section: '' }])
  const [errors, setErrors] = useState<{ [key: number]: Partial<Section> }>({})
  const [departmentOptions, setDepartmentOptions] = useState<{ [key: string]: { value: string; label: string }[] }>({})

  const dispatch = useDispatch()
  const { data: session } = useSession()

  // Load existing data
  useEffect(() => {
    if (companyData && companyData.comanySection && companyData.comanySection.length > 0) {
      const loadedSections = companyData.comanySection.map((s: any) => ({
        id: Date.now() + Math.random(),
        unitName: s.unit_id ? String(s.unit_id) : '',
        department: (s.dept_id || s.multi_dept_id) ? String(s.dept_id || s.multi_dept_id) : '',
        section: s.section_name || '',
        section_id: s.id
      }))
      setSections(loadedSections)
    }
  }, [companyData])

  // Fetch departments for loaded sections when session or sections change
  useEffect(() => {
    if (session?.user && sections.length > 0) {
      sections.forEach(s => {
        if (s.unitName && !departmentOptions[s.unitName]) {
          fetchDepartments(s.unitName)
        }
      })
    }
  }, [session, sections, departmentOptions])

  const fetchDepartments = (unitId: string) => {
    if (departmentOptions[unitId]) return // already loaded

    if (session?.user && (session.user as any).accessToken) {
      dispatch(getDepartmentSignupRequest({
        payload: {
          login_access_token: session.user.accessToken,
          user_id: (session.user as any).id,
          unit_id: unitId,
          profile: 'section'
        },
        callback: (response, error) => {

          if (response && response.status === 'success') {


            const options = response.data.map((d: any) => ({
              value: String(d.multi_dept_id),
              label: d.dept_name
            }))
            console.log('ffffffffffffffffffffffff', options)
            setDepartmentOptions(prev => ({
              ...prev,
              [unitId]: options
            }))
          } else {
            console.error('Error fetching departments', error)
          }
        }
      }))
    }
  }

  // Handle adding new section
  const handleAddSection = () => {
    setSections([...sections, { id: Date.now(), unitName: '', department: '', section: '' }])
  }

  // Handle deleting a section
  const handleDeleteSection = (id: number) => {
    const sectionToDelete = sections.find(s => s.id === id)
    if (sectionToDelete && sectionToDelete.section_id) {
      if (session?.user && (session.user as any).accessToken) {
        dispatch(deleteSectionRequest({
          payload: {
            login_access_token: (session.user as any).accessToken,
            section_id: String(sectionToDelete.section_id),
            user_id: (session.user as any).id,
            company_id: companyData?.comanyInfo?.[0]?.company_id || ''
          },
          callback: (response, error) => {
            if (response && response.status === 'success') {
              toast.success(response.message || 'Section deleted successfully')
              setSections(sections.filter(sect => sect.id !== id))
              fetchCompanyData()
            } else {
              toast.error(response?.message || 'Error deleting section')
            }
          }
        }))
      }
    } else {
      setSections(sections.filter(sect => sect.id !== id))
    }

    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[id]
      return newErrors
    })
  }

  // Handle input changes
  const handleInputChange = (id: number, field: keyof Section, value: string) => {
    setSections(prevSections => prevSections.map(sect => {
      if (sect.id === id) {
        const updatedSect = { ...sect, [field]: value }

        // If Unit changes, fetch depts and clear current dep selection
        if (field === 'unitName') {
          updatedSect.department = ''
          fetchDepartments(value)
        }
        return updatedSect
      }
      return sect
    }))

    // Clear error for the field
    setErrors(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: '' }
    }))
  }

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: number]: Partial<Section> } = {}
    let isValid = true

    sections.forEach(sect => {
      const sectErrors: Partial<Section> = {}
      if (!sect.unitName) sectErrors.unitName = 'Unit name is required'
      if (!sect.department) sectErrors.department = 'Department is required'
      if (!sect.section) sectErrors.section = 'Section name is required'

      if (Object.keys(sectErrors).length > 0) {
        newErrors[sect.id] = sectErrors
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  // Handle Next/Submit button
  const handleNextClick = () => {
    if (validateForm()) {
      if (session?.user && (session.user as any).accessToken) {
        const itemsection = sections.map(s => ({
          company_id: companyData?.comanyInfo?.[0]?.company_id || '',
          user_id: (session.user as any).id,
          unit_id: s.unitName,
          // Note: Backend expectation for department_id vs dept_id might vary, assuming 'department_id' or similar based on pattern
          // Looking at previous step: department_id. Let's send department_id.
          // Wait, 'comanySection' usually links to department. The load logic used 'dept_id'. 
          // I will use 'dept_id' if that's what the load logic suggests, or just 'department_id'.
          // Let's assume 'department_id' for consistency with other steps, or check common pattern.
          // StepDept sent 'department_id' for the ID itself. Here we are linking to it. 
          // Often it's 'dept_id'. I'll send 'dept_id'.
          dept_id: s.department,
          section_name: s.section,
          section_id: s.section_id || ''
        }))

        const payload = {
          login_access_token: (session.user as any).accessToken,
          user_id: (session.user as any).id,
          company_id: companyData?.comanyInfo?.[0]?.company_id || '',
          company_step_id: companyData?.comanyInfo?.[0]?.company_step_id || '',
          step_no: 4,
          step_name: 'companySection',
          companyDetails: 'comanySection',
          itemsection
        }

        dispatch(addNewCompanySetupRequest({
          payload,
          callback: (response, error) => {
            if (response && response.status === 'success') {
              toast.success(response.message)
              fetchCompanyData()
              handleNext()
            } else {
              toast.error(response?.message || 'Error submitting sections')
              console.error(error || response)
            }
          }
        }))
      }
    }
  }

  return (
    <Grid container spacing={5} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ width: '100%' }}>
        {sections.map((sect, index) => (
          <Grid container spacing={5} key={sect.id} width="100%" sx={{ mb: 5 }}>
            {/* First row: Section Name and Unit Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                sx={{ minWidth: '300px' }}
                fullWidth
                type='text'
                label='Section name'
                placeholder='Enter section name'
                value={sect.section}
                onChange={e => handleInputChange(sect.id, 'section', e.target.value)}
                error={!!errors[sect.id]?.section}
                helperText={errors[sect.id]?.section}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors[sect.id]?.unitName} sx={{ minWidth: '300px' }}>
                <InputLabel id={`select-unit-${sect.id}`}>Unit name</InputLabel>
                <Select
                  labelId={`select-unit-${sect.id}`}
                  label='Unit name'
                  value={sect.unitName}
                  onChange={e => handleInputChange(sect.id, 'unitName', e.target.value)}
                >
                  <MenuItem value='' disabled>
                    Select unit
                  </MenuItem>
                  {unitOptions && unitOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors[sect.id]?.unitName && (
                  <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>{errors[sect.id].unitName}</div>
                )}
              </FormControl>
            </Grid>
            {/* Second row: Department */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors[sect.id]?.department} sx={{ minWidth: '300px' }}>
                <InputLabel id={`select-department-${sect.id}`}>Department</InputLabel>
                <Select
                  labelId={`select-department-${sect.id}`}
                  label='Department'
                  value={sect.department}
                  onChange={e => handleInputChange(sect.id, 'department', e.target.value)}
                  disabled={!sect.unitName}
                >
                  <MenuItem value='' disabled>
                    Select department
                  </MenuItem>

                  {sect.unitName && departmentOptions[sect.unitName] ? (
                    departmentOptions[sect.unitName].map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>No Departments Found</MenuItem>
                  )}
                </Select>
                {errors[sect.id]?.department && (
                  <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>{errors[sect.id].department}</div>
                )}
              </FormControl>
            </Grid>
            {/* Third row: Add/Delete Button */}
            <Grid size={{ xs: 12, md: 2 }} className='flex items-center'>
              {index === 0 ? (
                <Button
                  size='medium'
                  variant='contained'
                  onClick={handleAddSection}
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
                  onClick={() => handleDeleteSection(sect.id)}
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
      <Grid size={{ xs: 12 }} className='pbs-6'>
        <div className='flex items-center justify-between'>
          <Button
            variant='outlined'
            color='secondary'
            disabled={activeStep === 0}
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Previous
          </Button>
          <Button
            variant='contained'
            color={activeStep === steps.length - 1 ? 'success' : 'primary'}
            onClick={handleNextClick}
            endIcon={
              activeStep === steps.length - 1 ? (
                <i className='ri-check-line' />
              ) : (
                <DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />
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

export default StepSectionDetails
