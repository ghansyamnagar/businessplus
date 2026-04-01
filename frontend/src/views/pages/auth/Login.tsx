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
import Alert from '@mui/material/Alert'
// Third-party Imports
import { signIn, getSession } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'
// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'
import CircularProgress from '@mui/material/CircularProgress'
// Component Imports
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

import { useSettings } from '@core/hooks/useSettings'
// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import HomeButton from './HomeButton'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { loginRequest } from '@/redux-store/slices/auth/auth.slice'
import { getMenuRequest } from '@/redux-store/slices/master/master.slice'
import { setPermissions } from '@/redux-store/slices/permissionSlice'
import { getCompanySettingViewRequest } from '@/redux-store/slices/user/user.slice'
import { setCompanyDetails } from '@/redux-store/slices/companySlice'
type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>
const schema = object({
  email: pipe(string(), minLength(1, 'This field is required'), email('Please enter a valid email address')),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const Login = ({ mode }: { mode: Mode }) => {
  const dispatch = useDispatch()
// States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
 const [loading, setLoading] = useState(false)
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
 
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
 
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
 
  const authBackground = useImageVariant(mode, lightImg, darkImg)
 
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
 
 const onSubmit: SubmitHandler<FormData> = data => {
  setLoading(true)

  dispatch(
    loginRequest({
      payload: {
        email: data.email,
        password: data.password
      },
      callback: async (response, error) => {
        setLoading(false)

        if (error) {
          toast.error(error.message)
          return
        }
        
        const session = await getSession();
        toast.success('Login successful')

        // Determine redirect URL based on company_details
        let redirectURL = searchParams.get('redirectTo') ?? '/'
        const companyDetails = session?.user?.company_details

        if (String(companyDetails) === 'true') {
          redirectURL = '/pages/unit-home'
          modulesPermissionGet(redirectURL)
        } else if (String(companyDetails) === 'false') {
          redirectURL = '/company-setup'
           router.replace(getLocalizedUrl(redirectURL, locale as Locale))
        }

       
      }
    })
  )
}
  // const modulesPermissionGet = (redirectURL: any) => {
  //   dispatch(
  //     getMenuRequest({
  //       payload: { },
  //       callback: (response, error) => {
  //         if (response?.la_menu) {
  //           dispatch(setPermissions(response.la_menu));
  //           localStorage.setItem('userModulePermission', JSON.stringify(response.la_menu))
  //         }

  //         router.replace(getLocalizedUrl(redirectURL, locale as Locale))
  //       }
  //     })
  //   )
  // }

   const modulesPermissionGet = (redirectURL: any) => {
    dispatch(
      getMenuRequest({
        payload: { },
        callback: (response, error) => {
          if (response?.la_menu) {
            dispatch(setPermissions(response.la_menu));
            localStorage.setItem('userModulePermission', JSON.stringify(response.la_menu));
               dispatch(
                getCompanySettingViewRequest({
                  payload: { },
                  callback: (response, error) => {
                    if (response?.status== 'success') {
                     dispatch(setCompanyDetails(response.data));
                     localStorage.setItem('allDetailsCompany', JSON.stringify(response.data));
                     router.replace(getLocalizedUrl(redirectURL, locale as Locale))
                    }else{
                      
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
    <div className='flex justify-center items-center min-bs-[100dvh] is-full relative p-6'>
      <Card className='flex flex-col sm:is-[460px]'>
        <CardContent className='p-6 sm:!p-6'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
              <Typography className='mbs-1'>Please sign-in to your account</Typography>
            </div>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
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
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                <FormControlLabel control={<Checkbox />} label='Remember me' />
                <Typography
                  className='text-end'
                  color='primary.main'
                  component={Link}
                  href={getLocalizedUrl('/forgot-password', locale as Locale)}
                >
                  Forgot password?
                </Typography>
              </div>
              <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} color='inherit' /> : 'Log In'}
            </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>New on our platform?</Typography>
                <Typography component={Link} href={getLocalizedUrl('/register', locale as Locale)} color='primary.main'>
                  Create an account
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

export default Login




// 'use client'

// // React Imports
// import { useState } from 'react'
// // Next Imports
// import Link from 'next/link'
// import { useParams, useRouter, useSearchParams } from 'next/navigation'
// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import IconButton from '@mui/material/IconButton'
// import InputAdornment from '@mui/material/InputAdornment'
// import Checkbox from '@mui/material/Checkbox'
// import Button from '@mui/material/Button'
// import FormControlLabel from '@mui/material/FormControlLabel'
// import Divider from '@mui/material/Divider'
// import Alert from '@mui/material/Alert'
// // Third-party Imports
// import { signIn } from 'next-auth/react'
// import { Controller, useForm } from 'react-hook-form'
// import { valibotResolver } from '@hookform/resolvers/valibot'
// import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
// import type { SubmitHandler } from 'react-hook-form'
// import type { InferInput } from 'valibot'
// import classnames from 'classnames'
// // Type Imports
// import type { Mode } from '@core/types'
// import type { Locale } from '@configs/i18n'
// import CircularProgress from '@mui/material/CircularProgress'
// // Component Imports
// import Logo from '@components/layout/shared/Logo'

// // Config Imports
// import themeConfig from '@configs/themeConfig'

// // Hook Imports
// import { useImageVariant } from '@core/hooks/useImageVariant'

// import { useSettings } from '@core/hooks/useSettings'
// // Util Imports
// import { getLocalizedUrl } from '@/utils/i18n'
// import HomeButton from './HomeButton'
// import { toast } from 'react-toastify'

// type ErrorType = {
//   message: string[]
// }

// type FormData = InferInput<typeof schema>
// const schema = object({
//   email: pipe(string(), minLength(1, 'This field is required'), email('Please enter a valid email address')),
//   password: pipe(
//     string(),
//     nonEmpty('This field is required'),
//     minLength(5, 'Password must be at least 5 characters long')
//   )
// })

// const Login = ({ mode }: { mode: Mode }) => {
// // States
//   const [isPasswordShown, setIsPasswordShown] = useState(false)
//   const [errorState, setErrorState] = useState<ErrorType | null>(null)
//  const [loading, setLoading] = useState(false)
//   // Vars
//   const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
//   const lightImg = '/images/pages/auth-v2-mask-1-light.png'
//   const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
//   const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
//   const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
//   const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'
 
//   // Hooks
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { lang: locale } = useParams()
//   const { settings } = useSettings()
 
//   const {
//     control,
//     handleSubmit,
//     formState: { errors }
//   } = useForm<FormData>({
//     resolver: valibotResolver(schema),
//     defaultValues: {
//       email: 'DigiTesting2@gmail.com',
//       password: 'Test@123'
//     }
//   })
 
//   const authBackground = useImageVariant(mode, lightImg, darkImg)
 
//   // const characterIllustration = useImageVariant(
//   //   mode,
//   //   lightIllustration,
//   //   darkIllustration,
//   //   borderedLightIllustration,
//   //   borderedDarkIllustration
//   // )
 
//   const handleClickShowPassword = () => setIsPasswordShown(show => !show)
 
//   const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
//     try {
//     setLoading(true)

//     const res = await signIn('credentials', {
//       email: data.email,
//       password: data.password,
//       redirect: false
//     })

//     if (res && res.ok && !res.error) {
//       toast.success('Login successful')

//       const redirectURL = searchParams.get('redirectTo') ?? '/'
//       router.replace(getLocalizedUrl(redirectURL, locale as Locale))
//     } else {
//       toast.error('Invalid email or password')
//     }
//   } catch (error) {
//     toast.error('Something went wrong. Please try again.')
//   } finally {
//     setLoading(false)
//   }
//   }


//   return (
//     <div className='flex justify-center items-center min-bs-[100dvh] is-full relative p-6'>
//       <Card className='flex flex-col sm:is-[460px]'>
//         <CardContent className='p-6 sm:!p-6'>
//           <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center items-center mbe-6'>
//             <Logo />
//           </Link>
//           <div className='flex flex-col gap-5'>
//             <div>
//               <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
//               <Typography className='mbs-1'>Please sign-in to your account</Typography>
//             </div>
//             <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
//               {/* <TextField autoFocus fullWidth label='Email' />
//               <TextField
//                 fullWidth
//                 label='Password'
//                 id='outlined-adornment-password'
//                 type={isPasswordShown ? 'text' : 'password'}
//                 slotProps={{
//                   input: {
//                     endAdornment: (
//                       <InputAdornment position='end'>
//                         <IconButton
//                           size='small'
//                           edge='end'
//                           onClick={handleClickShowPassword}
//                           onMouseDown={e => e.preventDefault()}
//                         >
//                           <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                         </IconButton>
//                       </InputAdornment>
//                     )
//                   }
//                 }}
//               /> */}
//               <Controller
//                             name='email'
//                             control={control}
//                             rules={{ required: true }}
//                             render={({ field }) => (
//                               <TextField
//                                 {...field}
//                                 fullWidth
//                                 autoFocus
//                                 type='email'
//                                 label='Email'
//                                 onChange={e => {
//                                   field.onChange(e.target.value)
//                                   errorState !== null && setErrorState(null)
//                                 }}
//                                 {...((errors.email || errorState !== null) && {
//                                   error: true,
//                                   helperText: errors?.email?.message || errorState?.message[0]
//                                 })}
//                               />
//                             )}
//                           />
//                           <Controller
//                             name='password'
//                             control={control}
//                             rules={{ required: true }}
//                             render={({ field }) => (
//                               <TextField
//                                 {...field}
//                                 fullWidth
//                                 label='Password'
//                                 id='login-password'
//                                 type={isPasswordShown ? 'text' : 'password'}
//                                 onChange={e => {
//                                   field.onChange(e.target.value)
//                                   errorState !== null && setErrorState(null)
//                                 }}
//                                 slotProps={{
//                                   input: {
//                                     endAdornment: (
//                                       <InputAdornment position='end'>
//                                         <IconButton
//                                           edge='end'
//                                           onClick={handleClickShowPassword}
//                                           onMouseDown={e => e.preventDefault()}
//                                           aria-label='toggle password visibility'
//                                         >
//                                           <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                                         </IconButton>
//                                       </InputAdornment>
//                                     )
//                                   }
//                                 }}
//                                 {...(errors.password && { error: true, helperText: errors.password.message })}
//                               />
//                             )}
//                           />
//               <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
//                 <FormControlLabel control={<Checkbox />} label='Remember me' />
//                 <Typography
//                   className='text-end'
//                   color='primary.main'
//                   component={Link}
//                   href={getLocalizedUrl('/forgot-password', locale as Locale)}
//                 >
//                   Forgot password?
//                 </Typography>
//               </div>
//               <Button
//               fullWidth
//               variant='contained'
//               type='submit'
//               disabled={loading}
//             >
//               {loading ? <CircularProgress size={22} color='inherit' /> : 'Log In'}
//             </Button>
//               <div className='flex justify-center items-center flex-wrap gap-2'>
//                 <Typography>New on our platform?</Typography>
//                 <Typography component={Link} href={getLocalizedUrl('/register', locale as Locale)} color='primary.main'>
//                   Create an account
//                 </Typography>
//               </div>
//               {/* <Divider className='gap-3 text-textPrimary'>or</Divider>
//               <div className='flex justify-center items-center gap-2'>
//                 <IconButton size='small' className='text-facebook'>
//                   <i className='ri-facebook-fill' />
//                 </IconButton>
//                 <IconButton size='small' className='text-twitter'>
//                   <i className='ri-twitter-fill' />
//                 </IconButton>
//                 <IconButton size='small' className='text-textPrimary'>
//                   <i className='ri-github-fill' />
//                 </IconButton>
//                 <IconButton size='small' className='text-googlePlus'>
//                   <i className='ri-google-fill' />
//                 </IconButton>
//               </div> */}
//             </form>
//           </div>
//         </CardContent>
//       </Card>
//       <HomeButton />
//       <img src={authBackground} className='absolute bottom-[5%] z-[-1] is-full max-md:hidden' />
//     </div>
//   )
// }

// export default Login

// 'use client'
// // React Imports
// import { useState } from 'react'
 
// // Next Imports
// import Link from 'next/link'
// import { useParams, useRouter, useSearchParams } from 'next/navigation'
 
// // MUI Imports
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import IconButton from '@mui/material/IconButton'
// import InputAdornment from '@mui/material/InputAdornment'
// import Checkbox from '@mui/material/Checkbox'
// import Button from '@mui/material/Button'
// import FormControlLabel from '@mui/material/FormControlLabel'
// import Divider from '@mui/material/Divider'
// import Alert from '@mui/material/Alert'
 
// // Third-party Imports
// import { signIn } from 'next-auth/react'
// import { Controller, useForm } from 'react-hook-form'
// import { valibotResolver } from '@hookform/resolvers/valibot'
// import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
// import type { SubmitHandler } from 'react-hook-form'
// import type { InferInput } from 'valibot'
// import classnames from 'classnames'
 
// // Type Imports
// import type { Mode } from '@core/types'
// import type { Locale } from '@/configs/i18n'
 
// // Component Imports
// import Logo from '@components/layout/shared/Logo'
 
// // Config Imports
// import themeConfig from '@configs/themeConfig'
 
// // Hook Imports
// import { useImageVariant } from '@core/hooks/useImageVariant'
// import { useSettings } from '@core/hooks/useSettings'
 
// // Util Imports
// import { getLocalizedUrl } from '@/utils/i18n'
 
// type ErrorType = {
//   message: string[]
// }
 
// type FormData = InferInput<typeof schema>
 
// const schema = object({
//   email: pipe(string(), minLength(1, 'This field is required'), email('Please enter a valid email address')),
//   password: pipe(
//     string(),
//     nonEmpty('This field is required'),
//     minLength(5, 'Password must be at least 5 characters long')
//   )
// })
 
// const Login = ({ mode }: { mode: Mode }) => {
//   // States
//   const [isPasswordShown, setIsPasswordShown] = useState(false)
//   const [errorState, setErrorState] = useState<ErrorType | null>(null)
 
//   // Vars
//   const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
//   const lightImg = '/images/pages/auth-v2-mask-1-light.png'
//   const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
//   const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
//   const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
//   const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'
 
//   // Hooks
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { lang: locale } = useParams()
//   const { settings } = useSettings()
 
//   const {
//     control,
//     handleSubmit,
//     formState: { errors }
//   } = useForm<FormData>({
//     resolver: valibotResolver(schema),
//     defaultValues: {
//       email: 'DigiTesting2@gmail.com',
//       password: 'Test@123'
//     }
//   })
 
//   const authBackground = useImageVariant(mode, lightImg, darkImg)
 
//   const characterIllustration = useImageVariant(
//     mode,
//     lightIllustration,
//     darkIllustration,
//     borderedLightIllustration,
//     borderedDarkIllustration
//   )
 
//   const handleClickShowPassword = () => setIsPasswordShown(show => !show)
 
//   const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
//     const res = await signIn('credentials', {
//       email: data.email,
//       password: data.password,
//       redirect: false
//     })

    
// console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa',res)
//     if (res && res.ok && res.error === null) {
//       // Vars
//       const redirectURL = searchParams.get('redirectTo') ?? '/'
 
//       router.replace(getLocalizedUrl(redirectURL, locale as Locale))
//     } else {
//       if (res?.error) {
//         const error = JSON.parse(res.error)
// console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa',res.error)
//         //setErrorState(error)
//       }
//     }
//   }
 
//   return (
//     <div className='flex bs-full justify-center'>
//       <div
//         className={classnames(
//           'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
//           {
//             'border-ie': settings.skin === 'bordered'
//           }
//         )}
//       >
//         <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
//           <img
//             src={characterIllustration}
//             alt='character-illustration'
//             className='max-bs-[673px] max-is-full bs-auto'
//           />
//         </div>
//         <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
//       </div>
//       <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
//         <div className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
//           <Logo />
//         </div>
//         <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
//           <div>
//             <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
//             <Typography>Please sign-in to your account and start the adventure</Typography>
//           </div>
//           <Alert icon={false} className='bg-[var(--mui-palette-primary-lightOpacity)]'>
//             <Typography variant='body2' color='primary.main'>
//               Email: <span className='font-medium'>admin@materialize.com</span> / Pass:{' '}
//               <span className='font-medium'>admin</span>
//             </Typography>
//           </Alert>
 
//           <form
//             noValidate
//             action={() => {}}
//             autoComplete='off'
//             onSubmit={handleSubmit(onSubmit)}
//             className='flex flex-col gap-5'
//           >
//             <Controller
//               name='email'
//               control={control}
//               rules={{ required: true }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   fullWidth
//                   autoFocus
//                   type='email'
//                   label='Email'
//                   onChange={e => {
//                     field.onChange(e.target.value)
//                     errorState !== null && setErrorState(null)
//                   }}
//                   {...((errors.email || errorState !== null) && {
//                     error: true,
//                     helperText: errors?.email?.message || errorState?.message[0]
//                   })}
//                 />
//               )}
//             />
//             <Controller
//               name='password'
//               control={control}
//               rules={{ required: true }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   fullWidth
//                   label='Password'
//                   id='login-password'
//                   type={isPasswordShown ? 'text' : 'password'}
//                   onChange={e => {
//                     field.onChange(e.target.value)
//                     errorState !== null && setErrorState(null)
//                   }}
//                   slotProps={{
//                     input: {
//                       endAdornment: (
//                         <InputAdornment position='end'>
//                           <IconButton
//                             edge='end'
//                             onClick={handleClickShowPassword}
//                             onMouseDown={e => e.preventDefault()}
//                             aria-label='toggle password visibility'
//                           >
//                             <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                           </IconButton>
//                         </InputAdornment>
//                       )
//                     }
//                   }}
//                   {...(errors.password && { error: true, helperText: errors.password.message })}
//                 />
//               )}
//             />
//             <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
//               <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me' />
//               <Typography
//                 className='text-end'
//                 color='primary.main'
//                 component={Link}
//                 href={getLocalizedUrl('/forgot-password', locale as Locale)}
//               >
//                 Forgot password?
//               </Typography>
//             </div>
//             <Button fullWidth variant='contained' type='submit'>
//               Log In
//             </Button>
//             <div className='flex justify-center items-center flex-wrap gap-2'>
//               <Typography>New on our platform?</Typography>
//               <Typography component={Link} href={getLocalizedUrl('/register', locale as Locale)} color='primary.main'>
//                 Create an account
//               </Typography>
//             </div>
//           </form>
//           <Divider className='gap-3'>or</Divider>
//           <Button
//             color='secondary'
//             className='self-center text-textPrimary'
//             startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
//             sx={{ '& .MuiButton-startIcon': { marginInlineEnd: 3 } }}
//             onClick={() => signIn('google')}
//           >
//             Sign in with Google
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
 
// export default Login
