'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRef } from 'react'
import { useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Link from 'next/link'
import { getLocalizedUrl } from '@/utils/i18n'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, length, pipe } from 'valibot'
import type { InferInput } from 'valibot'
import { useDispatch } from 'react-redux'
import { verifyOtpRequest, resendOtpRequest } from '@/redux-store/slices/auth/auth.slice'
import type { Locale } from '@configs/i18n'
import DirectionalIcon from '@components/DirectionalIcon'
import { toast } from 'react-toastify'
import Logo from '@components/layout/shared/Logo'
const schema = object({
    otp: pipe(
        string(),
        length(6, 'OTP must be 6 digits')
    )
})

type FormData = InferInput<typeof schema>

const VerifyOtpPage = ({ email }: { email: string }) => {
    const dispatch = useDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()

    // const email = searchParams.get('email')
    const OTP_LENGTH = 6
    const { lang: locale } = useParams()

    const [otpArray, setOtpArray] = useState(Array(OTP_LENGTH).fill(''))

    const inputsRef = useRef<(HTMLInputElement | null)[]>([])
    const {
        handleSubmit,
        setValue,
        clearErrors,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            otp: ''
        }
    })

    useEffect(() => {
        const otpValue = otpArray.join('')

        setValue('otp', otpValue)

        if (otpValue.length === 6) {
            clearErrors('otp')
        }
    }, [otpArray])

    const handleChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return

        const newOtp = [...otpArray]
        newOtp[index] = value
        setOtpArray(newOtp)

        // Move to next input
        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        // Backspace → go to previous
        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
    }

    const otp = otpArray.join('')

    // const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!email) {
            toast.error('Email missing. Please try again.')
            router.push('/forgot-password')
        }
    }, [email])

    const onSubmit = (data: FormData) => {




        setLoading(true)

        dispatch(
            verifyOtpRequest({
                payload: {
                    email,
                    otp: data.otp
                },
                callback: (response: any, error: any) => {
                    setLoading(false)

                    if (response && !error) {
                        toast.success(response.message)

                        const token = response?.token

                        router.push(`/reset-password?token=${token}`)
                    } else {
                        toast.error(error?.message || 'Invalid OTP')
                    }
                }
            })
        )
    }

    const handleResendOtp = () => {
        if (!email) {
            toast.error('Email missing')
            return
        }

        dispatch(
            resendOtpRequest({
                payload: { email },
                callback: (res: any, err: any) => {
                    if (res) {
                        toast.success(`${res.message || 'otp resent successfully'}- OTP: ${res.otp}`, {
                            autoClose: 8000
                        }
                        )

                        setOtpArray(Array(OTP_LENGTH).fill(''))
                        inputsRef.current[0]?.focus()
                    } else {
                        toast.error(err?.message || 'Failed to resend OTP')
                    }
                }
            })
        )
    }

    return (
        <div className='flex justify-center items-center min-h-screen p-6'>
            <Card sx={{ width: 400 }}>
                <CardContent>
                    <Link
                        href={getLocalizedUrl('/', locale as Locale)}
                        className='flex justify-center items-center mbe-6'
                    >
                        <Logo />
                    </Link>

                    <Typography variant='h5' gutterBottom>
                        Verify OTP 🔐
                    </Typography>

                    <Typography variant='body2' mb={3}>
                        Enter the OTP sent to your email
                    </Typography>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box display='flex' flexDirection='column' gap={5}>
                            <Box>
                                <Box display="flex" justifyContent="space-between" gap={1}>
                                    {otpArray.map((digit, index) => (
                                        <TextField
                                            key={index}
                                            value={digit}
                                            inputRef={(el) => (inputsRef.current[index] = el)}
                                            onChange={(e) => handleChange(e.target.value, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            inputProps={{
                                                maxLength: 1,
                                                style: { textAlign: 'center', fontSize: '20px' }
                                            }}
                                            sx={{ width: 50 }}
                                        />
                                    ))}
                                </Box>
                                {errors.otp && (
                                    <Typography sx={{ color: 'error.main' }} variant='body2'>
                                        {errors.otp.message}
                                    </Typography>
                                )}
                                <Typography
                                    onClick={handleResendOtp}
                                    className="text-left text-[13px] text-primary font-medium mt-3 cursor-pointer hover:underline"

                                >
                                    Resend OTP
                                </Typography>
                            </Box>

                            <Button variant='contained' type='submit' disabled={loading}>
                                {loading ? <CircularProgress size={22} color='inherit' /> : 'Verify OTP'}
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

                        </Box>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default VerifyOtpPage
