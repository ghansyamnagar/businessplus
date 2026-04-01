
'use client'

import { useEffect, useState, forwardRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, optional, any, check, forward } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import { format, parse } from 'date-fns'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import { addActionPlanSchedulesReq } from '@/redux-store/slices/actionplans/actionplans.slice'
import { getUserListRequest } from '@/redux-store/slices/user/user.slice'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import type { RootState } from '@/redux-store'

const schema = pipe(
    object({
        status: pipe(string(), nonEmpty('Current Status is required')),
        comment: pipe(string(), nonEmpty('Comment is required')),
        recovery_plan: optional(string()),
        implement_data: optional(string()),
        responsibility: optional(any()),
    }),
    forward(
        check((input) => {
            if (input.status === '5' && (!input.recovery_plan || input.recovery_plan.trim().length === 0)) {
                return false
            }
            return true
        }, 'Recovery plan is required'),
        ['recovery_plan']
    ),
    forward(
        check((input) => {
            if (input.status === '5' && (!input.implement_data || input.implement_data.trim().length === 0)) {
                return false
            }
            return true
        }, 'Target Date is required'),
        ['implement_data']
    ),
    forward(
        check((input) => {
            if (input.status === '5' && (!input.responsibility || String(input.responsibility).trim().length === 0)) {
                return false
            }
            return true
        }, 'Responsibility is required'),
        ['responsibility']
    )
)

type FormData = InferInput<typeof schema>

interface ChangeReviewProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    data: {
        element: any
        monthDate: number
        selectYear: number
    }
}

const ChangeReview = ({ open, handleClose, data }: ChangeReviewProps) => {
    const dispatch = useDispatch()
    // const { data: session } = useSession()
    const companyDetails = useSelector((state: RootState) => state.companyReducer.companyDetails)
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [commentStatus, setCommentStatus] = useState(false)

    const {
        control,
        reset,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            status: '',
            comment: '',
            recovery_plan: '',
            implement_data: '',
            responsibility: '',
        }
    })

    const selectedStatus = watch('status')

    useEffect(() => {
        if (selectedStatus === '5') {
            setCommentStatus(true)
        } else {
            setCommentStatus(false)
        }
    }, [selectedStatus])

    // eslint-disable-next-line react/display-name
    const PickersComponent = forwardRef((props: any, ref) => {
        return (
            <TextField
                inputRef={ref}
                fullWidth
                {...props}
                label={props.label || ''}
                error={props.error}
                helperText={props.helperText}
                autoComplete='off'
            />
        )
    })

    useEffect(() => {
        if (open) {
            dispatch(getUserListRequest({
                payload: {},
                callback: (res: any) => {
                    if (res?.status === 'success') {
                        setUsers(res.data)
                    }
                }
            }))
        }
    }, [open, dispatch])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset()
    }

    const onSubmit = (formData: FormData) => {
        setLoading(true)

        // Calculate dates like in Angular
        const month = data.monthDate + 1
        const day = '11' // Static day from Angular code
        let year = data.selectYear

        const financialYear = (companyDetails as any)?.general_data?.[0]?.financial_year || 'jan-dec'

        if (financialYear === 'april-march') {
            if (month <= 3) {
                year = data.selectYear + 1
            }
        }

        const month_date = `${day}-${month.toString().padStart(2, '0')}-${year}`
        const review_month_date = format(new Date(), 'dd-MM-yyyy')

        const payload = {
            action_plan_id: data.element.action_plan_id,
            co_owner_id: data.element.co_owner_id,
            month_date: month_date,
            review_month_date: review_month_date,
            status: Number(formData.status),
            comment: formData.comment,
            recovery_plan: formData.recovery_plan,
            implement_data: formData.implement_data ? format(parse(formData.implement_data, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : '',
            responsibility: formData.responsibility ? Number(formData.responsibility) : '',
            filled_status: 'filled'
        }

        dispatch(addActionPlanSchedulesReq({
            payload: payload,
            callback: (response: any) => {
                if (response?.status_code === 200 || response?.status === 'success') {
                    toast.success(response.message || 'Review submitted successfully')
                    handleDialogClose(true)
                } else {
                    toast.error(response?.message || 'Error submitting review')
                }
                setLoading(false)
            }
        }))
    }

    // Generate status options
    const statusOptions: { id: string; name: string; value?: number }[] = [
        { id: '1', name: 'Gray (Started)' },
        { id: '2', name: 'On Hold' },
        { id: '6', name: 'Un Hold(Reopen)' },
    ]

    // Red options (0-89%)
    for (let i = 0; i <= 89; i++) {
        statusOptions.push({ id: '5', name: `${i}% Complete`, value: i })
    }

    // Yellow options (90-99%)
    for (let i = 90; i <= 99; i++) {
        statusOptions.push({ id: '4', name: `${i}% Complete`, value: i })
    }

    // Green option (100%)
    statusOptions.push({ id: '3', name: '100% Complete' })

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={() => handleDialogClose(false)}
            maxWidth='sm'
            scroll='body'
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>Check Point</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='status'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        label='Current Status'
                                        fullWidth
                                        error={!!errors.status}
                                        helperText={errors.status?.message as string}
                                        SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
                                    >
                                        {statusOptions.map((opt, idx) => (
                                            <MenuItem key={idx} value={opt.id}>
                                                {opt.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='comment'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={commentStatus ? 'Respons For Delay' : 'Comment'}
                                        fullWidth
                                        error={!!errors.comment}
                                        helperText={errors.comment?.message as string}
                                        autoComplete='off'
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='recovery_plan'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label='Recovery plan'
                                        fullWidth
                                        error={!!errors.recovery_plan}
                                        helperText={errors.recovery_plan?.message as string}
                                        autoComplete='off'
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='implement_data'
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <AppReactDatepicker
                                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholderText='YYYY-MM-DD'
                                        dateFormat="yyyy-MM-dd"
                                        customInput={
                                            <PickersComponent
                                                label='Target Date'
                                                error={!!errors.implement_data}
                                                helperText={errors.implement_data?.message as string}
                                            />
                                        }
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='responsibility'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        label='Responsibility'
                                        fullWidth
                                        error={!!errors.responsibility}
                                        helperText={errors.responsibility?.message as string}
                                        SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 250 } } } }}
                                    >
                                        {users.map(u => (
                                            <MenuItem key={u.user_id} value={String(u.user_id)}>
                                                {u.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-end pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[100px]'>
                        {loading ? <CircularProgress size={22} color='inherit' /> : 'Ok'}
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default ChangeReview
