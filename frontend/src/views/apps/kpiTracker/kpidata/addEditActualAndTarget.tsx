
'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Third-party Imports
import { useDispatch, useSelector } from 'react-redux'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

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
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Slice Imports
import { getNewKpiTrackersTrackRequest, updateTargetActualRequest } from '@/redux-store/slices/kpiTracker/kpiTracker.slice'
import { getUserListRequest } from '@/redux-store/slices/user/user.slice'

// Type Imports
import type { AppDispatch } from '@/redux-store'

type AddEditActualAndTargetProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    kpiId: number
    selectedYear: number
    action: 'Target' | 'Actual'
    kpiData?: any // Optional: basic info about the KPI
}

const MONTHS_ORDER = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const AddEditActualAndTarget = ({ open, handleClose, kpiId, selectedYear, action, kpiData }: AddEditActualAndTargetProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const [loading, setLoading] = useState(false)
    const [userList, setUserList] = useState<any[]>([])
    const [trackData, setTrackData] = useState<any[]>([])

    const currentYearFull = new Date().getFullYear()
    const currentMonthNumber = new Date().getMonth()

    const { control, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            rows: [] as any[]
        }
    })

    const { fields } = useFieldArray({
        control,
        name: 'rows'
    })

    // Fetch User List
    useEffect(() => {
        if (open) {
            dispatch(getUserListRequest({
                payload: {},
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setUserList(response.data)
                    }
                }
            }))
        }
    }, [open, dispatch])

    // Fetch Track Data
    useEffect(() => {
        if (open && kpiId) {
            setLoading(true)
            dispatch(getNewKpiTrackersTrackRequest({
                payload: {
                    kpi_id: kpiId,
                    select_year: selectedYear
                },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        const fetchedData = response.data || []
                        setTrackData(fetchedData)

                        // Prepare form rows
                        const rows = MONTHS_ORDER.map(month => {
                            const monthData = fetchedData.find((d: any) => d.month === month) || {}

                            // Calculate status based on trend and actual/target
                            const target = parseFloat(monthData.kpi_target)
                            const actual = monthData.kpi_actual !== null ? parseFloat(monthData.kpi_actual) : null

                            let month_label = '4' // default
                            if (target !== null && actual !== null && !isNaN(target) && !isNaN(actual) && target !== 0) {
                                const ratio = actual / target
                                if (monthData.ideal_trend === 'positive') {
                                    month_label = ratio >= 1.0 ? '1' : (ratio < 1.0 && ratio >= 0.9) ? '2' : ratio < 0.9 ? '3' : '4'
                                } else {
                                    month_label = ratio >= 1.1 ? '3' : (ratio < 1.1 && ratio > 1.0) ? '2' : ratio <= 1.0 ? '1' : '4'
                                }
                            }

                            // Month end logic: A month can only have 'Actual' data entered after it has ended.
                            const monthIndex = MONTHS_ORDER.indexOf(month)
                            const isMonthEnded = (selectedYear < currentYearFull) || (selectedYear === currentYearFull && monthIndex < currentMonthNumber)
                            const readableMonth = isMonthEnded

                            return {
                                month: month,
                                target: monthData.kpi_target || '',
                                actual: monthData.kpi_actual || '',
                                comment: monthData.comment || '',
                                recovery_plan: monthData.recovery_plan || '',
                                responsibility: monthData.responsibility || '',
                                target_date: monthData.target_date || null,
                                status: month_label,
                                comment_id: monthData.comment_id,
                                target_id: monthData.target_id,
                                actual_id: monthData.actual_id,
                                lateentry_id: monthData.lateentry_id,
                                ideal_trend: monthData.ideal_trend,
                                readableMonth: readableMonth
                            }
                        })
                        reset({ rows })
                    }
                    setLoading(false)
                }
            }))
        }
    }, [open, kpiId, selectedYear, dispatch, reset, currentMonthNumber, currentYearFull])

    const onSubmit = (formData: any) => {
        setLoading(true)

        const { rows } = formData

        const targetData: any = {
            target_id: rows[0].target_id,
            target_year: selectedYear
        }

        const actualData: any = {
            actual_id: rows[0].actual_id,
            actual_year: selectedYear
        }

        const data: any[] = []
        const updatedata: any[] = []
        const currentdate = format(new Date(), 'yyyy-MM-dd')

        rows.forEach((row: any) => {
            targetData[row.month] = row.target
            actualData[row.month] = row.actual

            // Angular logic for bordershow/late_entry
            // Simplified here: if actual is filled, it's 'filled'
            const isFilled = row.actual !== '' && row.actual !== null

            data.push({
                kpi_id: kpiId,
                year: selectedYear,
                month: row.month,
                comment_id: row.comment_id,
                comment: row.comment,
                recovery_plan: row.recovery_plan,
                responsibility: row.responsibility,
                lateentry_id: row.lateentry_id,
                late_entry: false, // You might need more complex logic here for late entry
                entrydate: isFilled ? currentdate : '',
                target_date: row.target_date ? format(new Date(row.target_date), 'yyyy-MM-dd') : null,
                status: row.status
            })

            updatedata.push({
                kpi_id: kpiId,
                year: selectedYear,
                month: row.month,
                comment_id: row.comment_id,
                comment: row.comment,
                recovery_plan: row.recovery_plan,
                responsibility: row.responsibility,
                late_entry2: isFilled ? 'filled' : 'not-filled',
                entrydate: currentdate,
                target_date: row.target_date ? format(new Date(row.target_date), 'yyyy-MM-dd') : null,
                status: row.status
            })
        })

        const payload = {
            kpi_id: kpiId,
            year: selectedYear,
            action: action,
            targetData: targetData,
            actualData: actualData,
            data: data,
            updatedata: updatedata
        }

        dispatch(updateTargetActualRequest({
            payload: payload,
            callback: (response: any) => {
                if (response?.status === 'success') {
                    toast.success(response.message || 'Updated successfully')
                    handleClose(true)
                } else {
                    toast.error(response?.message || 'Update failed')
                }
                setLoading(false)
            }
        }))
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case '1': return <i className='ri-checkbox-blank-circle-fill' style={{ color: '#4caf50' }} />
            case '2': return <i className='ri-checkbox-blank-circle-fill' style={{ color: '#ffd900' }} />
            case '3': return <i className='ri-checkbox-blank-circle-fill' style={{ color: '#ff0000' }} />
            default: return <i className='ri-checkbox-blank-circle-fill' style={{ color: '#808080' }} />
        }
    }

    // Helper to check if a field should be required based on trend and actual vs target
    const isRequired = (index: number) => {
        const row = watch(`rows.${index}`)
        if (!row || !row.actual || !row.target) return false

        const actual = parseFloat(row.actual)
        const target = parseFloat(row.target)
        if (row.ideal_trend === 'positive') {
            return actual < target
        } else {
            return actual > target
        }
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={() => handleClose(false)}
            maxWidth='xl'
            scroll='body'
        >
            <DialogTitle>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <Typography variant='h6'>
                        {trackData[0]?.kpi_name || kpiData?.kpi_name || 'KPI'} - {selectedYear}
                    </Typography>
                    <Box display='flex' alignItems='center' gap={2}>
                        {trackData[0]?.ideal_trend === 'positive' ? (
                            <i className='ri-arrow-up-line' style={{ color: '#4caf50', fontSize: '24px', fontWeight: 'bold' }} />
                        ) : (
                            <i className='ri-arrow-down-line' style={{ color: '#ff0000', fontSize: '24px', fontWeight: 'bold' }} />
                        )}
                        <IconButton onClick={() => handleClose(false)}>
                            <i className='ri-close-line' />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {loading ? (
                        <Box p={4} textAlign='center'><CircularProgress /></Box>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                                        <th style={headerStyle} className='w-[80px]'>Month</th>
                                        <th style={headerStyle} className='w-[100px]'>Target</th>
                                        <th style={headerStyle} className='w-[100px]'>Actual</th>
                                        <th style={headerStyle}>Comment</th>
                                        <th style={headerStyle}>Recovery Plan</th>
                                        <th style={headerStyle}>Responsibility</th>
                                        <th style={headerStyle} className='w-[120px]'>Target Date</th>
                                        <th style={headerStyle} className='w-[80px]'>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map((field, index) => {
                                        const needsPlan = isRequired(index)
                                        const readableMonth = watch(`rows.${index}.readableMonth`)

                                        return (
                                            <tr key={field.id}>
                                                <td style={cellStyle}>
                                                    <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                                                        {watch(`rows.${index}.month`)}
                                                    </Typography>
                                                </td>
                                                <td style={{ ...cellStyle, backgroundColor: action === 'Actual' ? '#80808020' : 'inherit' }}>
                                                    <Controller
                                                        name={`rows.${index}.target`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                size='small'
                                                                fullWidth
                                                                variant='standard'
                                                                type='number'
                                                                slotProps={{ input: { readOnly: action === 'Actual', disableUnderline: true } }}
                                                            />
                                                        )}
                                                    />
                                                </td>
                                                <td style={{ ...cellStyle, backgroundColor: action === 'Target' ? '#80808020' : 'inherit' }}>
                                                    <Controller
                                                        name={`rows.${index}.actual`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                size='small'
                                                                fullWidth
                                                                variant='standard'
                                                                type='number'
                                                                slotProps={{ input: { readOnly: action === 'Target' || !readableMonth, disableUnderline: true } }}
                                                                onClick={() => {
                                                                    if (action === 'Actual' && !readableMonth) {
                                                                        toast.warning("Sorry you can't do it before month ends!")
                                                                    }
                                                                }}
                                                                onChange={(e) => {
                                                                    field.onChange(e)
                                                                    // Recalculate status on change
                                                                    const actual = parseFloat(e.target.value)
                                                                    const target = parseFloat(watch(`rows.${index}.target`))
                                                                    const trend = watch(`rows.${index}.ideal_trend`)
                                                                    if (!isNaN(actual) && !isNaN(target) && target !== 0) {
                                                                        const ratio = actual / target
                                                                        let label = '4'
                                                                        if (trend === 'positive') {
                                                                            label = ratio >= 1.0 ? '1' : (ratio < 1.0 && ratio >= 0.9) ? '2' : ratio < 0.9 ? '3' : '4'
                                                                        } else {
                                                                            label = ratio >= 1.1 ? '3' : (ratio < 1.1 && ratio > 1.0) ? '2' : ratio <= 1.0 ? '1' : '4'
                                                                        }
                                                                        setValue(`rows.${index}.status`, label)
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </td>
                                                <td style={cellStyle}>
                                                    <Controller
                                                        name={`rows.${index}.comment`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                size='small'
                                                                fullWidth
                                                                multiline
                                                                variant='standard'
                                                                placeholder='Comment...'
                                                                error={needsPlan && !field.value}
                                                                disabled={action === 'Target' || !readableMonth}
                                                                InputProps={{ disableUnderline: true }}
                                                            />
                                                        )}
                                                    />
                                                </td>
                                                <td style={cellStyle}>
                                                    <Controller
                                                        name={`rows.${index}.recovery_plan`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                size='small'
                                                                fullWidth
                                                                multiline
                                                                variant='standard'
                                                                placeholder='Recovery plan...'
                                                                error={needsPlan && !field.value}
                                                                disabled={action === 'Target' || !readableMonth}
                                                                InputProps={{ disableUnderline: true }}
                                                            />
                                                        )}
                                                    />
                                                </td>
                                                <td style={cellStyle}>
                                                    <Controller
                                                        name={`rows.${index}.responsibility`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                select
                                                                {...field}
                                                                size='small'
                                                                fullWidth
                                                                variant='standard'
                                                                error={needsPlan && !field.value}
                                                                disabled={action === 'Target' || !readableMonth}
                                                                InputProps={{ disableUnderline: true }}
                                                                SelectProps={{
                                                                    MenuProps: {
                                                                        PaperProps: {
                                                                            style: {
                                                                                maxHeight: 300
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <MenuItem value=''>Select</MenuItem>
                                                                {userList.map(user => (
                                                                    <MenuItem key={user.user_id} value={String(user.user_id)}>
                                                                        {user.name}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        )}
                                                    />
                                                </td>
                                                <td style={cellStyle}>
                                                    <Controller
                                                        name={`rows.${index}.target_date`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <AppReactDatepicker
                                                                selected={field.value ? new Date(field.value) : null}
                                                                onChange={(date) => field.onChange(date)}
                                                                disabled={action === 'Target' || !readableMonth}
                                                                customInput={
                                                                    <TextField
                                                                        size='small'
                                                                        fullWidth
                                                                        variant='standard'
                                                                        error={needsPlan && !field.value}
                                                                        disabled={action === 'Target' || !readableMonth}
                                                                        InputProps={{
                                                                            disableUnderline: true,
                                                                            endAdornment: (
                                                                                <i className='ri-calendar-line' style={{ color: 'rgba(0, 0, 0, 0.54)', cursor: 'pointer' }} />
                                                                            )
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                        )}
                                                    />
                                                </td>
                                                <td style={cellStyle}>
                                                    {getStatusIcon(watch(`rows.${index}.status`))}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' type='submit' disabled={loading}>
                        Submit
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => handleClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

const headerStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '12px',
    fontWeight: 600,
    textAlign: 'center'
}

const cellStyle: React.CSSProperties = {
    padding: '4px',
    border: '1px solid #e0e0e0',
    textAlign: 'center',
    minWidth: '80px'
}

export default AddEditActualAndTarget
