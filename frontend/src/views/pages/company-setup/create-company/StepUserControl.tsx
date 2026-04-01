import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid2'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import DirectionalIcon from '@components/DirectionalIcon'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { addNewCompanySetupRequest, getCompanySettingViewRequest } from '@/redux-store/slices/user/user.slice'
import { toast } from 'react-toastify'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import { getMenuRequest } from '@/redux-store/slices/master/master.slice'
import { setPermissions } from '@/redux-store/slices/permissionSlice'
import { setCompanyDetails } from '@/redux-store/slices/companySlice'

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { title: string; subtitle: string }[]
  companyData?: any
  fetchCompanyData: () => void
}

type Setting = {
  id: number
  financialYearCycle: string
  monthlyDataUpdateDate: string
  advanceReminderAlert: string
}

const StepUserControl = ({ activeStep, handleNext, handlePrev, steps, companyData, fetchCompanyData }: Props) => {
  const [setting, setSetting] = useState<Setting>({
    id: 0,
    financialYearCycle: '',
    monthlyDataUpdateDate: '',
    advanceReminderAlert: ''
  })

  const [errors, setErrors] = useState<Partial<Setting>>({})
  const dispatch = useDispatch()
  const { data: session, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()

  // Load existing data
  useEffect(() => {
    if (companyData && companyData.comanyUserContSet && companyData.comanyUserContSet.length > 0) {
      const loaded = companyData.comanyUserContSet[0]
      setSetting({
        id: loaded.id,
        financialYearCycle: loaded.financial_year || '',
        monthlyDataUpdateDate: loaded.reminder_date || '',
        advanceReminderAlert: loaded.reminder_frequency || ''
      })
    }
  }, [companyData])


  const handleInputChange = (field: keyof Setting, value: string) => {
    setSetting(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const newErrors: Partial<Setting> = {}
    if (!setting.financialYearCycle) newErrors.financialYearCycle = 'Required'
    if (!setting.monthlyDataUpdateDate) newErrors.monthlyDataUpdateDate = 'Required'
    if (!setting.advanceReminderAlert) newErrors.advanceReminderAlert = 'Required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextClick = () => {
    if (!validateForm()) return

    if (session?.user && (session.user as any).accessToken) {
      const payload = {
        login_access_token: (session.user as any).accessToken,
        user_id: (session.user as any).id,
        company_id: companyData?.comanyInfo?.[0]?.company_id || '',
        company_step_id: companyData?.comanyInfo?.[0]?.company_step_id || '',
        step_no: 5,
        step_name: 'companyUserControl', // Assuming step 5 name
        companyDetails: 'comanyUserContSet',

        // Data for this step
        financial_year: setting.financialYearCycle,
        reminder_date: setting.monthlyDataUpdateDate,
        reminder_frequency: setting.advanceReminderAlert,
        priority: 'High' // Default or add field if needed
      }

      dispatch(addNewCompanySetupRequest({
        payload,
        callback: (response, error) => {
          //console.log('ggggggggggggggggggggggggggg', response)
          if (response && response.status === 'success') {
            toast.success(response.message)
            fetchCompanyData()
            handleNext() // Or finish
            let redirectURL = searchParams.get('redirectTo') ?? '/'
            redirectURL = '/pages/unit-home'
            //router.replace(getLocalizedUrl(redirectURL, locale as Locale))
            modulesPermissionGet(redirectURL)
          } else {
            toast.error(response?.message || 'Error submitting settings')
            console.error(error || response)
          }
        }
      }))
    }
  }
  const modulesPermissionGet = (redirectURL: any) => {
    dispatch(
      getMenuRequest({
        payload: {},
        callback: async (response, error) => {
          if (response?.la_menu) {
            dispatch(setPermissions(response.la_menu));
            localStorage.setItem('userModulePermission', JSON.stringify(response.la_menu));
            dispatch(
              getCompanySettingViewRequest({
                payload: {},
                callback: async (response, error) => {
                  if (response?.status == 'success') {
                    dispatch(setCompanyDetails(response.data));

                    await update({
                      user: {
                        ...session?.user,
                        step_no: 5,
                        company_details: "true",
                        company_step_id: companyData?.comanyInfo?.[0]?.id || '',
                        unit_id: companyData?.comanyInfo?.[0]?.multi_unit_id || '',
                        dept_id: companyData?.comanyInfo?.[0]?.multi_dept_id || ''
                      }
                    })

                    localStorage.setItem('allDetailsCompany', JSON.stringify(response.data));
                    router.replace(getLocalizedUrl(redirectURL, locale as Locale))
                  } else {

                  }
                }
              })
            )
          }
        }
      })
    )
  }

  return (
    <Grid container spacing={2} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Grid container spacing={5} sx={{ mb: 2, width: '100%' }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth sx={{ minWidth: '300px' }} error={!!errors.financialYearCycle}>
            <InputLabel id={`select-financial-year`}>Company Financial Year Cycle</InputLabel>
            <Select
              labelId={`select-financial-year`}
              label='Company Financial Year Cycle'
              value={setting.financialYearCycle}
              onChange={e => handleInputChange('financialYearCycle', e.target.value)}
              sx={{ width: '100%' }}
            >
              <MenuItem value='apr-mar'>April - March</MenuItem>
              <MenuItem value='jan-dec'>January - December</MenuItem>
              {/* <MenuItem value='jul-jun'>July - June</MenuItem>
              <MenuItem value='oct-sep'>October - September</MenuItem> */}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth sx={{ minWidth: '300px' }} error={!!errors.monthlyDataUpdateDate}>
            <InputLabel id={`select-update-date`}>Monthly Data Update Date</InputLabel>
            <Select
              labelId={`select-update-date`}
              label='Monthly Data Update Date'
              value={setting.monthlyDataUpdateDate}
              onChange={e => handleInputChange('monthlyDataUpdateDate', e.target.value)}
              sx={{ width: '100%' }}
              MenuProps={{
                PaperProps: {
                  className: 'max-h-[300px]'
                }
              }}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                <MenuItem key={date} value={date}>
                  {date}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth sx={{ minWidth: '300px' }} error={!!errors.advanceReminderAlert}>
            <InputLabel id={`select-reminder-alert`}>Advance Reminder Alert</InputLabel>
            <Select
              labelId={`select-reminder-alert`}
              label='Advance Reminder Alert'
              value={setting.advanceReminderAlert}
              onChange={e => handleInputChange('advanceReminderAlert', e.target.value)}
              sx={{ width: '100%' }}
            >
              <MenuItem value='1'>1 Day Before</MenuItem>
              <MenuItem value='2'>2 Days Before</MenuItem>
              <MenuItem value='3'>3 Days Before</MenuItem>
              <MenuItem value='5'>5 Days Before</MenuItem>
              <MenuItem value='7'>7 Days Before</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ pt: 2 }}>
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
            color={activeStep === steps.length - 1 ? 'primary' : 'primary'}
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

export default StepUserControl
