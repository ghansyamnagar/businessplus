import { useMemo } from 'react'
import { Controller } from 'react-hook-form'

import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'

interface StepBudgetProps {
    control: any
    watch: any
    MenuProps: any
    departments: any[]
    budgetFields: any[]
    appendBudget: (value: any) => void
    removeBudget: (index: number) => void
    watchedTotalCost: string
    totalAllocated: number
    remainingBudget: number
}

const StepBudget = ({
    control,
    watch,
    MenuProps,
    departments,
    budgetFields,
    appendBudget,
    removeBudget,
    watchedTotalCost,
    totalAllocated,
    remainingBudget
}: StepBudgetProps) => {
    const watchedAllocations = watch('allocation_dept')

    // Collect all selected dept IDs
    const selectedDeptIds = useMemo(() => {
        if (!watchedAllocations) return new Set<string>()
        return new Set<string>(
            watchedAllocations
                .map((a: any) => String(a.dept_id))
                .filter((id: string) => id !== '')
        )
    }, [watchedAllocations])

    // Filter departments for a given row — exclude already selected, but keep own current value
    const getDeptOptions = (currentIndex: number) => {
        const currentDeptId = watchedAllocations?.[currentIndex]?.dept_id
        return departments.filter(
            d => !selectedDeptIds.has(String(d.dept_id)) || String(d.dept_id) === String(currentDeptId)
        )
    }

    return (
        <>
            <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name='currency' control={control} rules={{ required: 'Currency is required' }} render={({ field, fieldState }) => (
                    <TextField select {...field} label='Currency' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }}>
                        <MenuItem value='$'>U.S. Dollar $</MenuItem>
                        <MenuItem value='€'>Euro €</MenuItem>
                        <MenuItem value='₹'>Indian Rupee ₹</MenuItem>
                    </TextField>
                )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
                <Controller name='total_pro_cost' control={control} rules={{ required: 'Total Project Cost is required' }} render={({ field, fieldState }) => (
                    <TextField {...field} label='Total Project Cost' fullWidth type='number' error={!!fieldState.error} helperText={fieldState.error?.message} />
                )} />
            </Grid>

            {/* Budget summary */}
            {/* {Number(watchedTotalCost) > 0 && (
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', p: 2, borderRadius: 1, backgroundColor: remainingBudget < 0 ? 'error.lighter' : 'success.lighter' }}>
                        <Typography variant='body2'>
                            <strong>Total Cost:</strong> {watchedTotalCost}
                        </Typography>
                        <Typography variant='body2'>
                            <strong>Allocated:</strong> {totalAllocated}
                        </Typography>
                        <Typography variant='body2' color={remainingBudget < 0 ? 'error.main' : 'success.main'}>
                            <strong>Remaining:</strong> {remainingBudget}
                        </Typography>
                        {remainingBudget < 0 && (
                            <Typography variant='body2' color='error.main'>
                                ⚠ Allocation exceeds total project cost!
                            </Typography>
                        )}
                    </Box>
                </Grid>
            )} */}

            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6'>Allocation To Department</Typography>
            </Box>
            {budgetFields.map((field, index) => (
                <Grid container spacing={3} key={field.id} sx={{ mb: 2, width: '100%' }}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                        <Controller name={`allocation_dept.${index}.dept_id` as any} control={control} rules={{ required: 'Department is required' }} render={({ field, fieldState }) => (
                            <TextField select {...field} label='Department' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }}>
                                {getDeptOptions(index).map(d => <MenuItem key={d.dept_id} value={String(d.dept_id)}>{d.dept_name}</MenuItem>)}
                            </TextField>
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                        <Controller name={`allocation_dept.${index}.allocation_dstrbt_vl` as any} control={control} rules={{ required: 'Allocation value is required' }} render={({ field, fieldState }) => (
                            <TextField {...field} label='Value' fullWidth type='number' error={!!fieldState.error} helperText={fieldState.error?.message} />
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        {index === 0 ? (
                            <Tooltip title="Add Allocation">
                                <IconButton color='primary' onClick={() => appendBudget({ dept_id: '', allocation_dstrbt_vl: '' })}>
                                    <i className='ri-add-circle-line' />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Remove Allocation">
                                <IconButton color='error' onClick={() => removeBudget(index)}>
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

export default StepBudget
