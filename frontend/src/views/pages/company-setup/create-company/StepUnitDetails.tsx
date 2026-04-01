
import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import DirectionalIcon from '@components/DirectionalIcon'

// Redux & Auth
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { addNewCompanySetupRequest, getUserUnitsRequest, deleteUnitRequest } from '@/redux-store/slices/user/user.slice'
import { toast } from 'react-toastify'

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { title: string; subtitle: string }[]
  companyData?: any
  fetchCompanyData: () => void
}

type Unit = {
  id: number
  unitName: string
  address: string
  unit_id?: number // from API
}

const StepUnitDetails = ({ activeStep, handleNext, handlePrev, steps, companyData, fetchCompanyData }: Props) => {
  const [units, setUnits] = useState<Unit[]>([
    { id: Date.now(), unitName: '', address: '' }
  ])

  const [errors, setErrors] = useState<{ [key: number]: Partial<Unit> }>({})
  const dispatch = useDispatch()
  const { data: session } = useSession()

  useEffect(() => {
    if (companyData && companyData.comanyUnit && companyData.comanyUnit.length > 0) {
      const loadedUnits = companyData.comanyUnit.map((u: any) => ({
        id: Date.now() + Math.random(), // temp id for frontend list
        unitName: u.unit_name,
        address: u.unit_address,
        unit_id: u.id
      }))
      setUnits(loadedUnits)
    }
  }, [companyData])

  // Add unit
  const handleAddUnit = () => {
    setUnits([
      ...units,
      { id: Date.now(), unitName: '', address: '' }
    ])
  }

  // Delete unit
  const handleDeleteUnit = (id: number) => {
    // Check if it's an existing unit
    const unitToDelete = units.find(u => u.id === id);
    if (unitToDelete && unitToDelete.unit_id) {
      // API call to delete existing unit
      if (session?.user && (session.user as any).accessToken) {
        dispatch(deleteUnitRequest({
          payload: {
            // @ts-ignore
            login_access_token: session.user.accessToken,
            unit_id: String(unitToDelete.unit_id),
            user_id: (session.user as any).id
          },
          callback: (response, error) => {
            if (response && response.status === 'success') {
              toast.success(response.message || 'Unit deleted successfully')
              fetchCompanyData()
              // Remove from UI after successful API deletion
              setUnits(units.filter(unit => unit.id !== id))
            } else {
              toast.error(response?.message || 'Error deleting unit')
              console.error(error)
            }
          }
        }))
      }
    } else {
      // Just remove from UI if it's a new unsaved unit
      setUnits(units.filter(unit => unit.id !== id))
    }

    setErrors(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  // Handle input
  const handleInputChange = (id: number, field: keyof Unit, value: string) => {
    setUnits(units.map(unit =>
      unit.id === id ? { ...unit, [field]: value } : unit
    ))

    // clear error
    setErrors(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: '' }
    }))
  }

  // Validation
  const validateForm = () => {
    const newErrors: { [key: number]: Partial<Unit> } = {}
    let isValid = true

    units.forEach(unit => {
      const unitErrors: Partial<Unit> = {}

      if (!unit.unitName) unitErrors.unitName = 'Unit name is required'
      if (!unit.address) unitErrors.address = 'Address is required'

      if (Object.keys(unitErrors).length > 0) {
        newErrors[unit.id] = unitErrors
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleNextClick = () => {
    if (validateForm()) {
      if (session?.user && (session.user as any).accessToken) {
        // Prepare payload similar to Angular companyUnitsAdd
        // itemunits array
        const itemunits = units.map(u => ({
          company_id: companyData?.comanyInfo?.[0]?.company_id || '',
          user_id: (session.user as any).id,
          unit_id: u.unit_id || '',
          unit_name: u.unitName,
          unit_address: u.address
        }))

        const payload = {
          login_access_token: (session.user as any).accessToken,
          user_id: (session.user as any).id,
          company_id: companyData?.comanyInfo?.[0]?.company_id || '',
          company_step_id: companyData?.comanyInfo?.[0]?.company_step_id || '',
          step_no: 2,
          step_name: 'compayUnit',
          companyDetails: 'comanyUnit',
          itemunits: itemunits // Saga will JSON.stringify this
        }

        dispatch(addNewCompanySetupRequest({
          payload,
          callback: (response, error) => {
            if (response && response.status === 'success') {
              toast.success(response?.message)
              fetchCompanyData()
              handleNext()
            } else {
              console.error('Error submitting units:', error || response)

            }
          }
        }))
      }
    }
  }

  return (
    <Grid container spacing={5} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ width: '100%' }}>
        {units.map((unit, index) => (
          <Grid container spacing={5} key={unit.id} width="100%" sx={{ mb: 5 }}>

            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                label="Unit name"
                placeholder="Enter unit name"
                value={unit.unitName}
                onChange={e => handleInputChange(unit.id, 'unitName', e.target.value)}
                error={!!errors[unit.id]?.unitName}
                helperText={errors[unit.id]?.unitName}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                label="Address"
                placeholder="Enter address"
                value={unit.address}
                onChange={e => handleInputChange(unit.id, 'address', e.target.value)}
                error={!!errors[unit.id]?.address}
                helperText={errors[unit.id]?.address}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }} className='flex items-center'>
              {index === 0 ? (
                <Button
                  size="medium"
                  variant="contained"
                  onClick={handleAddUnit}
                  // startIcon={<i className="ri-add-line" />}
                  // sx={{ width: '100%' }}
                  sx={{ maxWidth: 75 }}
                >
                  Add
                </Button>
              ) : (
                <Button
                  size="medium"
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteUnit(unit.id)}
                  // startIcon={<i className="ri-subtract-line" />}
                  sx={{ maxWidth: 75 }}
                // sx={{ width: '100%' }}
                >
                  Delete
                </Button>
              )}
            </Grid>
          </Grid>
        ))}
      </div>

      {/* Footer buttons */}
      <Grid size={{ xs: 12 }} className="pbs-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outlined"
            color="secondary"
            disabled={activeStep === 0}
            onClick={handlePrev}
            startIcon={
              <DirectionalIcon
                ltrIconClass="ri-arrow-left-line"
                rtlIconClass="ri-arrow-right-line"
              />
            }
          >
            Previous
          </Button>

          <Button
            variant="contained"
            color={activeStep === steps.length - 1 ? 'success' : 'primary'}
            onClick={handleNextClick}
            endIcon={
              activeStep === steps.length - 1
                ? <i className="ri-check-line" />
                : <DirectionalIcon
                  ltrIconClass="ri-arrow-right-line"
                  rtlIconClass="ri-arrow-left-line"
                />
            }
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </div>
      </Grid>
    </Grid>
  )
}

export default StepUnitDetails
