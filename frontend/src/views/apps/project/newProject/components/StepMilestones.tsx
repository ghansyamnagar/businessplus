import { Controller } from 'react-hook-form'
import { format, parse } from 'date-fns'

import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

interface StepMilestonesProps {
    control: any
    MenuProps: any
    milestoneFields: any[]
    appendMilestone: (value: any) => void
    removeMilestone: (index: number) => void
    watchedStartDate: string
    watchedEndDate: string
}

const SYMBOL_OPTIONS = [
    { value: 'ri-triangle-line', icon: 'ri-triangle-line', label: 'Triangle' },
    { value: 'ri-triangle-line rotate-180', icon: 'ri-triangle-line rotate-180', label: 'Inverted Triangle' },
    { value: 'ri-checkbox-blank-line', icon: 'ri-checkbox-blank-line', label: 'Square' },
    { value: 'ri-checkbox-blank-circle-line', icon: 'ri-checkbox-blank-circle-line', label: 'Circle' },
    { value: 'ri-add-circle-line', icon: 'ri-add-circle-line', label: 'Add Circle' },
    { value: 'ri-checkbox-circle-line', icon: 'ri-checkbox-circle-line', label: 'Check Circle' },
    { value: 'ri-star-line', icon: 'ri-star-line', label: 'Star' },
]

const StepMilestones = ({
    control,
    MenuProps,
    milestoneFields,
    appendMilestone,
    removeMilestone,
    watchedStartDate,
    watchedEndDate
}: StepMilestonesProps) => {
    return (
        <>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6'>Major Milestones</Typography>
            </Box>
            {milestoneFields.map((field, index) => (
                <Grid container spacing={3} key={field.id} sx={{ mb: 4, width: '100%' }}>
                    <Grid size={{ xs: 12, sm: 3 }}><Controller name={`mile_stone.${index}.milestone_name` as any} control={control} rules={{ required: 'Milestone name is required' }} render={({ field, fieldState }) => <TextField {...field} label='Milestone Name' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} /></Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Controller name={`mile_stone.${index}.mile_stone_date` as any} control={control} rules={{ required: 'Date is required' }} render={({ field: { value, onChange }, fieldState }) => (
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
                                        label='Date'
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
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
                                maxDate={watchedEndDate ? parse(watchedEndDate, 'yyyy-MM-dd', new Date()) : undefined}
                            />
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <Controller name={`mile_stone.${index}.symbol` as any} control={control} render={({ field }) => (
                            <TextField select {...field} label='Symbol' fullWidth SelectProps={{ MenuProps }}>
                                {SYMBOL_OPTIONS.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <i className={opt.icon} style={{ fontSize: '18px' }} />
                                            <span>{opt.label}</span>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}><Controller name={`mile_stone.${index}.description` as any} control={control} render={({ field }) => <TextField {...field} label='Description' fullWidth />} /></Grid>
                    <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        {index === 0 ? (
                            <Tooltip title="Add Milestone">
                                <IconButton color='primary' onClick={() => appendMilestone({ milestone_name: '', mile_stone_date: '', symbol: 'ri-star-line', description: '' })}>
                                    <i className='ri-add-circle-line' />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Remove Milestone">
                                <IconButton color='error' onClick={() => removeMilestone(index)}>
                                    <i className='ri-delete-bin-7-line' />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Grid>
                </Grid>
            ))}
        </>
    )
}

export default StepMilestones
