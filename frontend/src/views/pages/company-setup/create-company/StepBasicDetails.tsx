// React Imports
import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'

import DirectionalIcon from '@components/DirectionalIcon'

// Form & Validation
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, pipe, nonEmpty } from 'valibot'

// Redux & Auth
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { addNewCompanySetupRequest } from '@/redux-store/slices/user/user.slice'
import { toast } from 'react-toastify'

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { title: string; subtitle: string }[]
  companyData: any
  fetchCompanyData: () => void
}

const schema = object({
  company_name: pipe(string(), nonEmpty('Company name is required')),
  company_address: pipe(string(), nonEmpty('Company address is required'))
})

type FormData = {
  company_name: string
  company_address: string
}

const StepBasicDetails = ({ activeStep, handleNext, handlePrev, steps, companyData, fetchCompanyData }: Props) => {
  // States
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined)
  const [fileInput, setFileInput] = useState('')

  const dispatch = useDispatch()
  const { data: session, update } = useSession()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      company_name: '',
      company_address: ''
    }
  })

  useEffect(() => {
    if (companyData && companyData.comanyInfo && companyData.comanyInfo.length > 0) {
      const info = companyData.comanyInfo[0]
      setValue('company_name', info.company_name || '')
      setValue('company_address', info.company_address || '')
      // Handle logo if needed/available in response (e.g. info.file_name)
      if (info.file_name) {
        setImgSrc(info.file_name)
      }
    }
  }, [companyData, setValue])

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setImgSrc(reader.result as string)
    reader.readAsDataURL(file)
    setFileInput(e.target.value)
  }

  const handleFileInputReset = () => {
    setImgSrc('/images/avatars/1.png')
    setFileInput('')
  }

  const onSubmit = (data: FormData) => {
    if (session?.user && (session.user as any).accessToken) {

      const payload = {
        login_access_token: (session.user as any).accessToken,
        user_id: (session.user as any).id, // Assuming ID is available
        company_id: companyData?.comanyInfo?.[0]?.company_id || '',
        step_no: 1,
        step_name: 'companyProfile',
        companyDetails: 'comanyInfo',
        company_name: data.company_name,
        company_address: data.company_address,
        company_logo: imgSrc?.startsWith('data:') ? imgSrc : companyData?.comanyInfo?.[0]?.company_logo, // sending base64 or URL
        company_step_id: companyData?.comanyInfo?.[0]?.company_step_id || '',

      }
      // console.log('payloadpayloadpayload', payload)
      dispatch(addNewCompanySetupRequest({
        payload,
        callback: async (response, error) => {
          if (response && response?.status === 'success') {
            await update({
              user: {
                ...session?.user,
                company_id: response.data.company_id,
                // step_no: 2,
              }
            })
            // console.log('dddddddddddddd', response.data)
            toast.success(response?.message)
            fetchCompanyData()
            handleNext()
          } else {
            console.error('Error submitting basic details:', error || response)
            // Optionally show toast/alert
            //alert('Failed to save details')
          }
        }
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
      <Grid container spacing={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name='company_name'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Company name"
                    placeholder="Enter company name"
                    error={!!errors.company_name}
                    helperText={errors.company_name?.message}
                  />
                )}
              />
              <Controller
                name='company_address'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={4}
                    label="Company address"
                    placeholder="Enter company address"
                    className='mt-4'
                    error={!!errors.company_address}
                    helperText={errors.company_address?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                alignItems={{ xs: 'center', sm: 'flex-start' }}
              >
                <Box>
                  <img
                    src={imgSrc || undefined}
                    alt="Company Logo"
                    width={100}
                    height={100}
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                  />
                </Box>

                <Stack spacing={2} width="100%">
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button variant="contained" component="label">
                      Upload logo
                      <input
                        hidden
                        type="file"
                        accept="image/png, image/jpeg"
                        value={fileInput}
                        onChange={handleFileInputChange}
                      />
                    </Button>

                    <Button variant="outlined" color="error" onClick={handleFileInputReset}>
                      Reset
                    </Button>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    Allowed JPG or PNG. Max size of 2MB
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
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
              type='submit'
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
    </form>
  )
}

export default StepBasicDetails
