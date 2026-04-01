'use client'

import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, number, array, optional, check } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'

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
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import FormHelperText from '@mui/material/FormHelperText'

// Redux Imports
import { addGovernanceRequest, updateGovernanceRequest } from '@/redux-store/slices/project/project.slice'

const schema = object({
    meeting_name: pipe(string(), nonEmpty('Meeting Name is required')),
    chair_person: pipe(number(), check((val) => val > 0, 'Chair Person is required')),
    co_chair_person: pipe(number(), check((val) => val > 0, 'Co-chair Person is required')),
    member_id: array(number()),
    gov_frequency: pipe(string(), nonEmpty('Frequency is required')),
    gov_venue: pipe(string(), nonEmpty('Venue is required')),
    gov_duration: pipe(string(), nonEmpty('Duration is required')),
    meeting_day: optional(string()),
    meeting_shedule: optional(string()),
    agenda: pipe(string(), nonEmpty('Agenda is required'))
})

type FormData = InferInput<typeof schema>

interface AddEditGovernanceProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    data?: any
    projectData: any
}

const FREQUENCIES = ['Monthly', 'Weekly', 'Daily']

const DURATIONS = [
    { label: '30 Minute', value: 'half_hour' },
    { label: '1 Hour', value: 'one_hour' },
    { label: '2 Hour', value: 'two_hour' },
    { label: 'Half day', value: 'half_day' },
    { label: 'Full day', value: 'full_Day' }
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SCHEDULES = ['1st', '2nd', '3rd', '4th']

const AddEditGovernance = ({ open, handleClose, data, projectData }: AddEditGovernanceProps) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)

    const members = (projectData?.project_member_data || []).reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.user_id === current.user_id)
        if (!x) {
            return acc.concat([current])
        } else {
            return acc
        }
    }, [])
    const isEdit = !!data

    const {
        control,
        reset,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: {
            meeting_name: '',
            chair_person: 0,
            co_chair_person: 0,
            member_id: [],
            gov_frequency: '',
            gov_venue: '',
            gov_duration: '',
            meeting_day: '',
            meeting_shedule: '',
            agenda: ''
        }
    })

    const frequency = watch('gov_frequency')

    useEffect(() => {
        if (open && data) {
            reset({
                meeting_name: data.meeting_name || '',
                chair_person: Number(data.chair_person) || 0,
                co_chair_person: Number(data.co_chair_person) || 0,
                member_id: data.member_id?.split(',').map((id: string) => Number(id)) || [],
                gov_frequency: data.gov_frequency || '',
                gov_venue: data.gov_venue || '',
                gov_duration: data.gov_duration || '',
                meeting_day: data.meeting_day || '',
                meeting_shedule: data.meeting_shedule || '',
                agenda: data.agenda || ''
            })
        } else if (open) {
            reset({
                meeting_name: '',
                chair_person: 0,
                co_chair_person: 0,
                member_id: [],
                gov_frequency: '',
                gov_venue: '',
                gov_duration: '',
                meeting_day: '',
                meeting_shedule: '',
                agenda: ''
            })
        }
    }, [open, data, reset])

    const onSubmit = (formData: FormData) => {
        setLoading(true)
        const projectId = projectData?.projectData?.[0]?.id

        let payload: any

        if (isEdit) {
            payload = {
                ...formData,
                gov_member: formData.member_id.join(','),
                project_id: projectId,
                projectDetails: 'governanceProject',
                project_gov_id: data.id,
                project_gov_memebers_id: data.id
            }
        } else {
            payload = {
                project_id: projectId,
                projectDetails: 'governanceProject',
                govMeting: [
                    {
                        project_id: projectId,
                        project_gov_id: '',
                        meeting_name: formData.meeting_name,
                        chair_person: formData.chair_person,
                        co_chair_person: formData.co_chair_person,
                        gov_member: formData.member_id.join(','),
                        gov_frequency: formData.gov_frequency,
                        meeting_day: formData.meeting_day,
                        meeting_shedule: formData.meeting_shedule,
                        gov_venue: formData.gov_venue,
                        gov_duration: formData.gov_duration,
                        agenda: formData.agenda
                    }
                ]
            }
        }

        const actionRequest = isEdit ? updateGovernanceRequest : addGovernanceRequest

        dispatch(actionRequest({
            payload: payload,
            callback: (res: any) => {
                setLoading(false)
                if (res?.status === 'success' || res?.status_code === 200) {
                    toast.success(res.message || `Governance ${isEdit ? 'updated' : 'added'} successfully`)
                    handleClose(true)
                } else {
                    toast.error(res?.message || res?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} governance`)
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={() => handleClose(false)} fullWidth maxWidth='md'>
            <DialogTitle variant='h5' className='flex flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8 text-center'>
                {isEdit ? 'Edit Governance Structure' : 'Enter New Governance'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible'>
                    <IconButton onClick={() => handleClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='meeting_name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Meeting Name'
                                        error={!!errors.meeting_name}
                                        helperText={errors.meeting_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='chair_person'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Chair Person'
                                        error={!!errors.chair_person}
                                        helperText={errors.chair_person?.message}
                                    >
                                        <MenuItem value={0}>Select Chair Person</MenuItem>
                                        {members.map((m: any) => (
                                            <MenuItem key={m.user_id} value={Number(m.user_id)}>{m.name}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='co_chair_person'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Co-chair Person'
                                        error={!!errors.co_chair_person}
                                        helperText={errors.co_chair_person?.message}
                                    >
                                        <MenuItem value={0}>Select Co-chair Person</MenuItem>
                                        {members.map((m: any) => (
                                            <MenuItem key={m.user_id} value={Number(m.user_id)}>{m.name}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth error={!!errors.member_id}>
                                <InputLabel>Members</InputLabel>
                                <Controller
                                    name='member_id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            multiple
                                            renderValue={(selected) =>
                                                members.filter((m: any) => (selected as any[]).includes(Number(m.user_id))).map((m: any) => m.name).join(', ')
                                            }
                                        >
                                            {members.map((m: any) => (
                                                <MenuItem key={m.user_id} value={Number(m.user_id)}>
                                                    <Checkbox checked={field.value.indexOf(Number(m.user_id)) > -1} />
                                                    <ListItemText primary={m.name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.member_id && <FormHelperText>{errors.member_id.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='gov_frequency'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Frequency'
                                        error={!!errors.gov_frequency}
                                        helperText={errors.gov_frequency?.message}
                                    >
                                        <MenuItem value=''>Select Frequency</MenuItem>
                                        {FREQUENCIES.map((f) => (
                                            <MenuItem key={f} value={f}>{f}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='gov_venue'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Venue'
                                        error={!!errors.gov_venue}
                                        helperText={errors.gov_venue?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='gov_duration'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label='Duration'
                                        error={!!errors.gov_duration}
                                        helperText={errors.gov_duration?.message}
                                    >
                                        <MenuItem value=''>Select Duration</MenuItem>
                                        {DURATIONS.map((d) => (
                                            <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        {(frequency === 'Weekly' || frequency === 'Monthly') && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name='meeting_day'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            label='Meeting Day'
                                        >
                                            <MenuItem value=''>Select Day</MenuItem>
                                            {DAYS.map((d) => (
                                                <MenuItem key={d} value={d}>{d}</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                        )}
                        {frequency === 'Monthly' && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name='meeting_shedule'
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            label='Meeting Schedule'
                                        >
                                            <MenuItem value=''>Select Schedule</MenuItem>
                                            {SCHEDULES.map((s) => (
                                                <MenuItem key={s} value={s}>{s}</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                        )}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='agenda'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label='Agenda'
                                        error={!!errors.agenda}
                                        helperText={errors.agenda?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='sm:pli-8 sm:pbe-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[100px]'>
                        {loading ? <CircularProgress size={20} color='inherit' /> : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => handleClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditGovernance
