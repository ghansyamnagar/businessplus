'use client'

import { useState, forwardRef, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, check } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'
import { format, parse, isValid, startOfDay } from 'date-fns'

// MUI Imports
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
import InputAdornment from '@mui/material/InputAdornment'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Redux Imports
import { addProjectRequest } from '@/redux-store/slices/project/project.slice'

const schema = (minDate?: Date) => object({
    milestone_status: pipe(string(), nonEmpty('Status is required')),
    actual_date: pipe(
        string(),
        nonEmpty('Actual Date is required'),
        check((value) => {
            if (!minDate || !value) return true
            const selectedDate = parse(value, 'yyyy-MM-dd', new Date())
            return isValid(selectedDate) && selectedDate >= startOfDay(minDate)
        }, 'Actual Date cannot be before Project Start Date')
    ),
    comment: pipe(string(), nonEmpty('Comment is required'))
})

type FormData = InferInput<ReturnType<typeof schema>>

interface UpdateMilestoneStatusProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    milestoneData: any
    projectDetails: any
}

const UpdateMilestoneStatus = ({ open, handleClose, milestoneData, projectDetails }: UpdateMilestoneStatusProps) => {
    // Hooks
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)

    // Calculate minDate from projectDetails.start_date
    const minDateValue = useMemo(() => {
        if (!projectDetails?.start_date || projectDetails.start_date === '-') return undefined

        // Try parsing yyyy-MM-dd (from log) first
        let parsed = parse(projectDetails.start_date, 'yyyy-MM-dd', new Date())
        if (!isValid(parsed)) {
            // Fallback to dd-MM-yyyy
            parsed = parse(projectDetails.start_date, 'dd-MM-yyyy', new Date())
        }

        return isValid(parsed) ? parsed : undefined
    }, [projectDetails?.start_date])

    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema(minDateValue)),
        defaultValues: {
            milestone_status: '',
            actual_date: '',
            comment: ''
        }
    })

    useEffect(() => {
        if (open && milestoneData) {
            let formattedDate = ''
            if (milestoneData.actual_date && milestoneData.actual_date !== '-') {
                try {
                    // Start with smart parsing
                    let parsedDate = parse(milestoneData.actual_date, 'yyyy-MM-dd', new Date())
                    if (!isValid(parsedDate)) {
                        parsedDate = parse(milestoneData.actual_date, 'dd-MM-yyyy', new Date())
                    }

                    if (isValid(parsedDate)) {
                        formattedDate = format(parsedDate, 'yyyy-MM-dd')
                    }
                } catch (e) {
                    console.error('Error parsing date:', e)
                }
            }

            reset({
                milestone_status: milestoneData.milestone_status || '',
                actual_date: formattedDate,
                comment: milestoneData.comment || ''
            })
        }
    }, [open, milestoneData, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset()
    }

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
                slotProps={{
                    htmlInput: {
                        readOnly: true,
                        onKeyDown: (e: any) => e.preventDefault()
                    },
                    input: {
                        endAdornment: (
                            <InputAdornment position='end'>
                                <i className='ri-calendar-line text-textSecondary' />
                            </InputAdornment>
                        )
                    }
                }}
            />
        )
    })

    const onSubmit = (data: FormData) => {
        setLoading(true)

        // Logic from Angular: current_project_steps_idtwo == 5 ? step_id[1] (5) : step_id[0] (1)
        const project_step_id = projectDetails.project_step_id == 5 ? 5 : 1

        // Format date to dd-MM-yyyy for payload as per Angular datepipe
        let formattedActualDate = ''
        if (data.actual_date) {
            const parsedDate = parse(data.actual_date, 'yyyy-MM-dd', new Date())
            if (isValid(parsedDate)) {
                formattedActualDate = format(parsedDate, 'dd-MM-yyyy')
            }
        }

        const payload = {
            project_id: projectDetails.id,
            start_date: projectDetails.start_date,
            end_date: projectDetails.end_date,
            project_duration: projectDetails.project_duration,
            projectDetails: 'projectKeyDates',
            mile_stone: [
                {
                    project_id: projectDetails.id || projectDetails.project_id,
                    project_milestone_id: milestoneData.id || milestoneData.project_milestone_id,
                    milestone_status: data.milestone_status,
                    actual_date: formattedActualDate,
                    comment: data.comment,
                    project_step_id: project_step_id
                }
            ]
        }

        dispatch(addProjectRequest({
            payload: payload,
            callback: (response: any) => {
                setLoading(false)
                if (response?.status_code == 200 || response?.status === 'success') {
                    toast.success(response.message || 'Milestone status updated successfully')
                    handleDialogClose(true)
                } else {
                    toast.error(response?.message || 'Error updating milestone status')
                }
            }
        }))
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={() => handleDialogClose(false)}
            maxWidth='sm'
            scroll='body'
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>Milestone Status</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='milestone_status'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        fullWidth
                                        label='Status'
                                        {...field}
                                        error={!!errors.milestone_status}
                                        helperText={errors.milestone_status?.message}
                                    >
                                        <MenuItem value='Green'>Green</MenuItem>
                                        <MenuItem value='Yellow'>Yellow</MenuItem>
                                        <MenuItem value='Red'>Red</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='actual_date'
                                control={control}
                                render={({ field: { value, onChange } }) => {
                                    const dateValue = value ? parse(value, 'yyyy-MM-dd', new Date()) : null

                                    return (
                                        <AppReactDatepicker
                                            selected={isValid(dateValue) ? dateValue : null}
                                            onChange={(date: Date | null) => onChange(date && isValid(date) ? format(date, 'yyyy-MM-dd') : '')}
                                            minDate={minDateValue}
                                            placeholderText='YYYY-MM-DD'
                                            dateFormat="yyyy-MM-dd"
                                            customInput={<PickersComponent label='Actual Date' error={!!errors.actual_date} helperText={errors.actual_date?.message} />}
                                        />
                                    )
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='comment'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label='Comment'
                                        error={!!errors.comment}
                                        helperText={errors.comment?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-end pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[100px]'>
                        {loading ? <CircularProgress size={20} color='inherit' /> : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog >
    )
}

export default UpdateMilestoneStatus
