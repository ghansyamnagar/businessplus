'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, pipe, nonEmpty } from 'valibot'
import type { InferInput } from 'valibot'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import DirectionalIcon from '@components/DirectionalIcon'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Third-party Imports
import { toast } from 'react-toastify'

// Redux Imports
import { useDispatch } from 'react-redux'
import { updatePasswordRequest } from '@/redux-store/slices/auth/auth.slice'

const schema = object({
  password: pipe(
    string(),
    nonEmpty('Password is required'),
    minLength(6, 'Password must be at least 6 characters')
  ),
  confirmPassword: pipe(
    string(),
    nonEmpty('Confirm password is required')
  )
})

type FormData = InferInput<typeof schema>
const ResetPasswordV1 = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  // const [newPassword, setNewPassword] = useState('')
  // const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-3-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-3-light.png'

  // Hooks
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  // Get the reset token from URL query params
  const resetToken = searchParams.get('token') || ''

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const token = searchParams.get('token') || ''

  // const [password, setPassword] = useState('')

  const onSubmit = (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      })
      return
    }

    if (!token) {
      toast.error('Invalid token')
      return
    }

    setLoading(true)

    dispatch(
      updatePasswordRequest({
        payload: {
          token,
          password: data.password,
          confirm_password: data.confirmPassword
        },
        callback: (response: any, error: any) => {
          setLoading(false)

          if (response?.status === 'success') {
            toast.success(response.message)

            router.push(getLocalizedUrl('/login', locale as Locale))
          } else {
            toast.error(error?.message || 'Failed to update password')
          }
        }
      })
    )
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] is-full relative p-6'>
      <Card className='flex flex-col sm:is-[460px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Reset Password 🔒</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>
              Your new password must be different from previously used passwords
            </Typography>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <Controller
                name='password'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    autoFocus
                    label='New Password'
                    type={isPasswordShown ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton onClick={handleClickShowPassword}>
                              <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
              <Controller
                name='confirmPassword'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Confirm Password'
                    type={isConfirmPasswordShown ? 'text' : 'password'}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton onClick={handleClickShowConfirmPassword}>
                              <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={22} color='inherit' /> : 'Set New Password'}
              </Button>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link
                  href={getLocalizedUrl('/login', locale as Locale)}
                  className='flex items-center gap-1.5'
                >
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

export default ResetPasswordV1
