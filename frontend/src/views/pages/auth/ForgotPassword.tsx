'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import VerifyOtpPage from './VerifyOtp'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, email, pipe, nonEmpty } from 'valibot'
import type { InferInput } from 'valibot'
// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Third-party Imports
import { toast } from 'react-toastify'

// Redux Imports
import { useDispatch } from 'react-redux'
import { resetPasswordRequest } from '@/redux-store/slices/auth/auth.slice'

const schema = object({
  email: pipe(
    string(),
    nonEmpty('Email is required'),
    email('Please enter valid email')
  )
})

type FormData = InferInput<typeof schema>

const ForgotPassword = ({ mode }: { mode: Mode }) => {
  // Vars
  const darkImg = '/images/pages/auth-v1-mask-4-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-4-light.png'

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  // States
  // const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOtpPage, setShowOtpPage] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = (data: FormData) => {
    setUserEmail(data.email)


    setLoading(true)

    dispatch(
      resetPasswordRequest({
        payload: { email: data.email },
        callback: (response: any, error: any) => {
          setLoading(false)

          if (response?.otp) {
            toast.success(`${response?.message || 'OTP sent successfully'} - OTP: ${response.otp}`,
              {
                autoClose: 8000
              }
            )
            setShowOtpPage(true)
          } else {
            toast.error(response?.message || 'Please enter correct email.')
          }
        }
      })
    )
  }
  if (showOtpPage) {
    return <VerifyOtpPage email={userEmail} />
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] is-full relative p-6'>
      <Card className='flex flex-col sm:is-[460px]'>
        <CardContent className='p-6 sm:!p-6'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Forgot Password 🔒</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Enter your email to reset your password</Typography>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    autoFocus
                    label='Email'
                    type='email'
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={22} color='inherit' /> : 'Send reset link'}
              </Button>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center gap-1.5'>
                  <DirectionalIcon
                    ltrIconClass='ri-arrow-left-s-line'
                    rtlIconClass='ri-arrow-right-s-line'
                    className='text-xl'
                  />
                  <span>Back to Login</span>
                </Link>
              </Typography>
            </form>
          </div>
        </CardContent>
      </Card>
      <img src={authBackground} className='absolute bottom-[5%] z-[-1] is-full max-md:hidden' />
    </div>
  )
}

export default ForgotPassword
