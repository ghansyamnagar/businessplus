'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, email, pipe, nonEmpty, check } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import HomeButton from './HomeButton'
import { toast } from 'react-toastify'
import { CircularProgress } from '@mui/material'
import { useDispatch } from 'react-redux'
import { registerRequest } from '@/redux-store/slices/auth/auth.slice'
type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>
const schema = pipe(
  object({
    name: pipe(
      string(),
      nonEmpty('This field is required'),
    ),
    email: pipe(
      string(),
      nonEmpty('This field is required'),
      email('Please enter a valid email address')
    ),

    password: pipe(
      string(),
      nonEmpty('This field is required'),
      minLength(5, 'Password must be at least 5 characters long')
    ),

    confirmPassword: pipe(
      string(),
      nonEmpty('Confirm password is required')
    )
  }),

  // ✅ PASSWORD MATCH CHECK
  check(
    data => data.password === data.confirmPassword,
    'Password and Confirm Password must match'
  )
)
const Register = ({ mode }: { mode: Mode }) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [loading, setLoading] = useState(false)
  // Vars
  const darkImg = '/images/pages/auth-v1-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-2-light.png'

  // Hooks
  const { lang: locale } = useParams()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setLoading(true)
    dispatch(
      registerRequest({
        payload: {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role_id: 2,
          company_id: '',
          user_id: '',
          multi_dept_id: [],
          multi_unit_id: [],
          multi_section_id: [],
        },
        callback: (response, error) => {
          setLoading(false)
          if (error) {
            toast.error(error?.message || 'Something went wrong')
            return
          }
          if (response?.status === 'success' && response?.status_code === 200) {
            toast.success(response?.message || 'Registered successfully')
            let redirectURL = searchParams.get('redirectTo') ?? '/'
            redirectURL = '/login'
            router.replace(getLocalizedUrl(redirectURL, locale as Locale))
          } else {
            toast.error(response?.message || 'Registration failed')
          }
        }
      })
    )
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] is-full relative p-6'>
      <Card className='flex flex-col sm:is-[460px]'>
        <CardContent className='p-6 sm:!p-6'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Services starts here 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Create an account for enjoy services</Typography>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    autoFocus
                    type='text'
                    label='Name'
                    onChange={e => {
                      field.onChange(e.target.value)
                      errorState !== null && setErrorState(null)
                    }}
                    {...((errors.name || errorState !== null) && {
                      error: true,
                      helperText: errors?.name?.message || errorState?.message[0]
                    })}
                  />
                )}
              />
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    autoFocus
                    type='email'
                    label='Email'
                    onChange={e => {
                      field.onChange(e.target.value)
                      errorState !== null && setErrorState(null)
                    }}
                    {...((errors.email || errorState !== null) && {
                      error: true,
                      helperText: errors?.email?.message || errorState?.message[0]
                    })}
                  />
                )}
              />
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Password'
                    id='login-password'
                    type={isPasswordShown ? 'text' : 'password'}
                    onChange={e => {
                      field.onChange(e.target.value)
                      errorState !== null && setErrorState(null)
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={handleClickShowPassword}
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                    {...(errors.password && { error: true, helperText: errors.password.message })}
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
                    helperText={
                      errors.confirmPassword?.message ||
                      (errors.root?.message && 'Password and Confirm Password must match')
                    }
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
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <>
                    <span>I agree to </span>
                    <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                      privacy policy & terms
                    </Link>
                  </>
                }
              />

              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} color='inherit' /> : 'Sign Up'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href={getLocalizedUrl('/login', locale as Locale)} color='primary.main'>
                  Sign in instead
                </Typography>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <HomeButton />
      <img src={authBackground} className='absolute bottom-[5%] z-[-1] is-full max-md:hidden' />
    </div>
  )
}

export default Register
