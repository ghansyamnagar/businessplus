import { useMemo } from 'react'
import { Controller } from 'react-hook-form'

import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'

interface StepGovernanceProps {
    control: any
    watch: any
    MenuProps: any
    selectedTeamMembers: any[]
    govFields: any[]
    appendGov: (value: any) => void
    removeGov: (index: number) => void
}

const StepGovernance = ({
    control,
    watch,
    MenuProps,
    selectedTeamMembers,
    govFields,
    appendGov,
    removeGov
}: StepGovernanceProps) => {
    // Deduplicate team members by user_id to avoid duplicate React keys
    const uniqueMembers = useMemo(() => {
        const seen = new Set<string>()
        return selectedTeamMembers.filter(m => {
            const id = String(m.user_id)
            if (seen.has(id)) return false
            seen.add(id)
            return true
        })
    }, [selectedTeamMembers])

    return (
        <>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6'>Governance Review Meetings</Typography>
            </Box>
            {govFields.map((field, index) => (
                <Card variant='outlined' key={field.id} sx={{ p: 4, mb: 4, width: '100%' }}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 3 }}><Controller name={`govMeting.${index}.meeting_name` as any} control={control} rules={{ required: 'Meeting Name is required' }} render={({ field, fieldState }) => <TextField {...field} label='Meeting Name' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} /></Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Controller name={`govMeting.${index}.chair_person` as any} control={control} rules={{ required: 'Chair Person is required' }} render={({ field, fieldState }) => (
                                <TextField select {...field} label='Chair Person' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }}>
                                    {uniqueMembers.map(u => <MenuItem key={u.user_id} value={String(u.user_id)}>{u.name}</MenuItem>)}
                                </TextField>
                            )} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Controller name={`govMeting.${index}.co_chair_person` as any} control={control} rules={{ required: 'Co-Chair is required' }} render={({ field, fieldState }) => (
                                <TextField select {...field} label='Co-Chair' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }}>
                                    {uniqueMembers.map(u => <MenuItem key={u.user_id} value={String(u.user_id)}>{u.name}</MenuItem>)}
                                </TextField>
                            )} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Controller name={`govMeting.${index}.gov_member` as any} control={control} rules={{ validate: (value: any) => (Array.isArray(value) && value.length > 0) || 'Required' }} render={({ field, fieldState }) => (
                                <FormControl fullWidth error={!!fieldState.error}>
                                    <InputLabel>Members</InputLabel>
                                    <Select {...field} multiple label='Members' MenuProps={MenuProps} renderValue={(selected: any) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((val: any) => <Chip key={val} label={uniqueMembers.find(u => String(u.user_id) === String(val))?.name || val} size='small' />)}
                                        </Box>
                                    )}>
                                        {uniqueMembers.map(u => <MenuItem key={u.user_id} value={String(u.user_id)}>{u.name}</MenuItem>)}
                                    </Select>
                                    {fieldState.error && <Typography variant='caption' color='error' sx={{ ml: 1.5, mt: 0.5 }}>{fieldState.error.message}</Typography>}
                                </FormControl>
                            )} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Controller name={`govMeting.${index}.gov_frequency` as any} control={control} rules={{ required: 'Frequency is required' }} render={({ field, fieldState }) => (
                                <TextField select {...field} label='Frequency' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }}>
                                    <MenuItem value='Daily'>Daily</MenuItem>
                                    <MenuItem value='Weekly'>Weekly</MenuItem>
                                    <MenuItem value='Monthly'>Monthly</MenuItem>
                                </TextField>
                            )} />
                        </Grid>

                        {/* Days - shown & required for Weekly and Monthly */}
                        {(watch(`govMeting.${index}.gov_frequency` as any) === 'Weekly' || watch(`govMeting.${index}.gov_frequency` as any) === 'Monthly') && (
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <Controller name={`govMeting.${index}.meeting_day` as any} control={control} rules={{ required: 'Meeting Day is required' }} render={({ field, fieldState }) => (
                                    <TextField select {...field} label='Meeting Day' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }}>
                                        <MenuItem value='Sunday'>Sunday</MenuItem>
                                        <MenuItem value='Monday'>Monday</MenuItem>
                                        <MenuItem value='Tuesday'>Tuesday</MenuItem>
                                        <MenuItem value='Wednesday'>Wednesday</MenuItem>
                                        <MenuItem value='Thursday'>Thursday</MenuItem>
                                        <MenuItem value='Friday'>Friday</MenuItem>
                                        <MenuItem value='Saturday'>Saturday</MenuItem>
                                    </TextField>
                                )} />
                            </Grid>
                        )}

                        {/* Meeting Schedule - shown & required only for Monthly */}
                        {watch(`govMeting.${index}.gov_frequency` as any) === 'Monthly' && (
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <Controller name={`govMeting.${index}.meeting_shedule` as any} control={control} rules={{ required: 'Meeting Schedule is required' }} render={({ field, fieldState }) => (
                                    <TextField select {...field} label='Meeting Schedule' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }}>
                                        <MenuItem value='1st'>1st</MenuItem>
                                        <MenuItem value='2nd'>2nd</MenuItem>
                                        <MenuItem value='3rd'>3rd</MenuItem>
                                        <MenuItem value='4th'>4th</MenuItem>
                                    </TextField>
                                )} />
                            </Grid>
                        )}

                        {/* Venue - always required */}
                        <Grid size={{ xs: 12, sm: 3 }}><Controller name={`govMeting.${index}.gov_venue` as any} control={control} rules={{ required: 'Venue is required' }} render={({ field, fieldState }) => <TextField {...field} label='Venue' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />} /></Grid>

                        {/* Duration - always required */}
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Controller name={`govMeting.${index}.gov_duration` as any} control={control} rules={{ required: 'Duration is required' }} render={({ field, fieldState }) => (
                                <TextField select {...field} label='Duration' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }}>
                                    <MenuItem value='half_hour'>30 min</MenuItem>
                                    <MenuItem value='one_hour'>1 hour</MenuItem>
                                    <MenuItem value='two_hour'>2 hour</MenuItem>
                                    <MenuItem value='half_day'>Half Day</MenuItem>
                                </TextField>
                            )} />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller name={`govMeting.${index}.agenda` as any} control={control} rules={{ required: 'Agenda is required' }} render={({ field, fieldState }) => <TextField {...field} label='Agenda' fullWidth multiline rows={2} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
                        </Grid>
                        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            {index === 0 ? (
                                <Tooltip title="Add New Meeting">
                                    <IconButton color='primary' onClick={() => appendGov({ meeting_name: '', chair_person: '', co_chair_person: '', gov_member: [], gov_frequency: 'Monthly', meeting_day: '', meeting_shedule: '', gov_venue: '', gov_duration: 'one_hour', agenda: '' })}>
                                        <i className='ri-add-circle-line ri-24px' />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Remove Meeting">
                                    <IconButton color='error' onClick={() => removeGov(index)}>
                                        <i className='ri-delete-bin-7-line ri-24px' />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Grid>
                    </Grid>
                </Card>
            ))}
        </>
    )
}

export default StepGovernance
