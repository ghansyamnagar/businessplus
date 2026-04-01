import { useRef, type ChangeEvent } from 'react'
import { Controller } from 'react-hook-form'
import { format, parse } from 'date-fns'

import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import InputAdornment from '@mui/material/InputAdornment'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

interface StepProjectDetailsProps {
    control: any
    errors: any
    departments: any[]
    MenuProps: any
    imgSrc: string
    setImgSrc: (src: string) => void
    setSelectedFile: (file: File | null) => void
    watchedStartDate: string
    watchedEndDate: string
    projectDuration: string
    handleStartDateChange: (date: Date | null, onChange: (value: string) => void) => void
    setValue: any
}

const StepProjectDetails = ({
    control,
    errors,
    departments,
    MenuProps,
    imgSrc,
    setImgSrc,
    setSelectedFile,
    watchedStartDate,
    watchedEndDate,
    projectDuration,
    handleStartDateChange,
    setValue,
}: StepProjectDetailsProps) => {
    // Own local ref — guaranteed to be attached to the current DOM element
    const localFileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target
        if (files && files.length !== 0) {
            const reader = new FileReader()
            reader.onload = () => setImgSrc(reader.result as string)
            reader.readAsDataURL(files[0])
            setSelectedFile(files[0])
        }
        // Reset so the same file can be re-selected
        e.target.value = ''
    }

    return (
        <>
            <Grid size={{ xs: 12, sm: 9 }}>
                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <Controller name='project_name' control={control} rules={{ required: 'Project Title is required' }} render={({ field, fieldState }) => (
                            <TextField {...field} label='Project Title' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Controller name='department_id' control={control} rules={{ required: 'Department is required' }} render={({ field, fieldState }) => (
                            <TextField select {...field} label='Department' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }}>
                                {departments.map(d => <MenuItem key={d.dept_id} value={String(d.dept_id)}>{d.dept_name}</MenuItem>)}
                            </TextField>
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Controller name='project_mission' control={control} rules={{ required: 'Project Mission is required' }} render={({ field, fieldState }) => (
                            <TextField {...field} label='Project Mission' fullWidth multiline rows={2} error={!!fieldState.error} helperText={fieldState.error?.message} />
                        )} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant='body2' sx={{ mb: 2 }}>Project logo</Typography>
                <Box sx={{ position: 'relative' }}>
                    <Avatar src={imgSrc} sx={{ width: 100, height: 100, border: '2px solid #e0e0e0' }} />
                    <IconButton
                        type='button'
                        size='small'
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            border: '2px solid white',
                            '&:hover': { backgroundColor: 'primary.dark' }
                        }}
                        onClick={() => localFileInputRef.current?.click()}
                    >
                        <i className='ri-camera-line text-sm' />
                    </IconButton>
                </Box>
                <input
                    type='file'
                    ref={localFileInputRef}
                    onChange={handleFileChange}
                    accept='image/png, image/jpeg'
                    style={{ display: 'none' }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name='start_date' control={control} rules={{ required: true }} render={({ field: { value, onChange } }) => (
                    <AppReactDatepicker
                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                        minDate={new Date()}
                        onChange={(date: Date | null) => handleStartDateChange(date, onChange)}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        yearDropdownItemNumber={50}
                        customInput={
                            <TextField
                                fullWidth
                                label='Start Date'
                                error={!!errors.start_date}
                                helperText={errors.start_date ? 'Start Date is required' : ''}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <i className='ri-calendar-line text-textSecondary' />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        }
                    />
                )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name='end_date' control={control} rules={{ required: true }} render={({ field: { value, onChange } }) => (
                    <AppReactDatepicker
                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                        onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        yearDropdownItemNumber={50}
                        customInput={
                            <TextField
                                fullWidth
                                label='End Date'
                                error={!!errors.end_date}
                                helperText={errors.end_date ? 'End Date is required' : ''}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <i className='ri-calendar-line text-textSecondary' />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        }
                        minDate={watchedStartDate ? parse(watchedStartDate, 'yyyy-MM-dd', new Date()) : undefined}
                    />
                )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label='Total Duration' value={projectDuration} fullWidth disabled />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Controller name='key_objective' control={control} rules={{ required: 'Key Objective is required' }} render={({ field, fieldState }) => (
                    <TextField {...field} label='Project Key Objective' fullWidth multiline rows={4} error={!!fieldState.error} helperText={fieldState.error?.message} />
                )} />
            </Grid>
        </>
    )
}

export default StepProjectDetails
