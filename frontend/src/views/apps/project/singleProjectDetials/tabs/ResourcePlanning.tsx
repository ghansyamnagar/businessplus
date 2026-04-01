'use client'

import { useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'

// Slice Imports
import { addProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

interface ResourcePlanningProps {
    projectData: any
    refreshData: () => void
}

const ResourcePlanning = ({ projectData, refreshData }: ResourcePlanningProps) => {
    const { projectId } = useParams()
    const dispatch = useDispatch()
    const [view, setView] = useState<'table' | 'form'>('table')
    const [selectedUser, setSelectedUser] = useState<any>(null)

    const resourcePlanningData = projectData?.ResourcePlanning || {}
    const totalWeeks = resourcePlanningData.totalweek || []
    const resourceData = resourcePlanningData.recourceData || []

    // Transform data for the table
    const tableData = useMemo(() => {
        const preData: any[] = []
        const totalColumnsTarget: any = {}
        const totalColumnsActual: any = {}
        let totalColumnsTargetSum = 0
        let totalColumnsActualSum = 0

        resourceData.forEach((element: any, index: number) => {
            const targetData: any = {
                'Sl.No': index + 1,
                user_id: element.user_id,
                user: element.user,
                'T/A': 'Target',
                setColor: '',
                Total: 0
            }
            const actualData: any = {
                'Sl.No': '',
                user_id: element.user_id,
                user: '',
                'T/A': 'Actual',
                setColor: '',
                Total: 0
            }
            const percentageData: any = {
                'Sl.No': '',
                user_id: element.user_id,
                user: '',
                'T/A': '%',
                setColor: 'percentageColor',
                Total: 0
            }

            let totalRowTarget = 0
            let totalRowActual = 0

            element.totalweeks.forEach((weekData: any) => {
                targetData[weekData.week] = weekData.target
                actualData[weekData.week] = weekData.actual

                const percenCalculate = weekData.target > 0 ? (weekData.actual / weekData.target) * 100 : 0
                percentageData[weekData.week] = percenCalculate.toFixed(0)

                totalRowTarget += Number(weekData.target || 0)
                totalRowActual += Number(weekData.actual || 0)

                // Column totals
                totalColumnsTarget[weekData.week] = (totalColumnsTarget[weekData.week] || 0) + Number(weekData.target || 0)
                totalColumnsActual[weekData.week] = (totalColumnsActual[weekData.week] || 0) + Number(weekData.actual || 0)
            })

            targetData.Total = totalRowTarget
            actualData.Total = totalRowActual
            percentageData.Total = totalRowTarget > 0 ? ((totalRowActual / totalRowTarget) * 100).toFixed(0) : '0'

            totalColumnsTargetSum += totalRowTarget
            totalColumnsActualSum += totalRowActual

            preData.push(targetData, actualData, percentageData)
        })

        // Add footer rows
        if (resourceData.length > 0) {
            const footerTarget = {
                'Sl.No': 'Total',
                user: 'All',
                'T/A': 'Target',
                setColor: '',
                Total: totalColumnsTargetSum,
                ...totalColumnsTarget
            }
            const footerActual = {
                'Sl.No': '',
                user: '',
                'T/A': 'Actual',
                setColor: '',
                Total: totalColumnsActualSum,
                ...totalColumnsActual
            }
            preData.push(footerTarget, footerActual)
        }

        return preData
    }, [resourceData])

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            data_user: [] as any[]
        }
    })

    const handleEdit = (userId: number) => {
        const user = resourceData.find((u: any) => u.user_id === userId)
        if (user) {
            setSelectedUser(user)
            reset({
                data_user: user.totalweeks.map((w: any) => ({
                    id: w.id,
                    week: w.week,
                    target: w.target,
                    actual: w.actual
                }))
            })
            setView('form')
        }
    }

    const onSubmit = (data: any) => {
        const payload = {
            project_id: projectId,
            projectDetails: 'ResourcePlanning',
            user_id: selectedUser.user_id,
            data_user: data.data_user
        }

        dispatch(addProjectRequest({
            payload,
            callback: (res: any) => {
                if (res?.status === 'success' || res?.status_code === 200) {
                    toast.success(res?.message || 'Resource updated successfully')
                    refreshData()
                    setView('table')
                } else {
                    toast.error(res?.message || 'Failed to update resource')
                }
            }
        }))
    }

    const getPercentageColor = (value: string) => {
        const num = parseFloat(value)
        if (isNaN(num)) return 'inherit'
        if (num >= 100) return 'success.main'
        if (num > 0 && num < 100) return 'error.main'
        return 'inherit'
    }

    if (view === 'form') {
        return (
            <Card>
                <CardHeader
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => setView('table')} size='small'>
                                <i className='ri-arrow-left-line' />
                            </IconButton>
                            <Typography variant='h5'>Update Resource Planning - {selectedUser?.user}</Typography>
                        </Box>
                    }
                />
                <Divider />
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={6}>
                            {selectedUser.totalweeks.map((week: any, index: number) => (
                                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                                    <Paper variant='outlined' sx={{ p: 3, borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, bgcolor: 'primary.main' }} />
                                        <Typography variant='subtitle2' color='primary' sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            {week.week}
                                        </Typography>
                                        <Grid container spacing={4}>
                                            <Grid size={{ xs: 6 }}>
                                                <Controller
                                                    name={`data_user.${index}.target`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label='Target'
                                                            variant='outlined'
                                                            size='small'
                                                            type='number'
                                                            fullWidth
                                                            onFocus={(e) => e.target.select()}
                                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                            slotProps={{ inputLabel: { shrink: true } }}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Controller
                                                    name={`data_user.${index}.actual`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label='Actual'
                                                            variant='outlined'
                                                            size='small'
                                                            type='number'
                                                            fullWidth
                                                            onFocus={(e) => e.target.select()}
                                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                            slotProps={{ inputLabel: { shrink: true } }}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            ))}
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
                                    <Button type='submit' variant='contained' size='large' sx={{ minWidth: 120 }}>
                                        Save Changes
                                    </Button>
                                    <Button variant='outlined' color='secondary' size='large' onClick={() => setView('table')}>
                                        Cancel
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader
                title='Resource Planning'
                subheader='Manage weekly targets and actual performance'
            />
            {/* <Divider /> */}
            <TableContainer sx={{ maxHeight: 700, overflow: 'auto' }}>
                <Table stickyHeader className={tableStyles.table} size='small' sx={{ '& th, & td': {} }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 12, minWidth: 60 }}>Sl.No</TableCell>
                            <TableCell sx={{ position: 'sticky', left: 60, zIndex: 12, minWidth: 150 }}>user</TableCell>
                            <TableCell sx={{ position: 'sticky', left: 210, zIndex: 12, minWidth: 80 }}>T/A</TableCell>
                            {totalWeeks.map((week: string) => (
                                <TableCell key={week} align='center' sx={{ minWidth: 50 }}>{week}</TableCell>
                            ))}
                            <TableCell sx={{ position: 'sticky', right: 80, zIndex: 12, minWidth: 80 }} align='center'>Total</TableCell>
                            <TableCell sx={{ position: 'sticky', right: 0, zIndex: 12, minWidth: 60 }} align='center'>Action</TableCell>
                        </TableRow >
                    </TableHead >
                    <TableBody>
                        {tableData.map((row, index) => {
                            const isGroupStart = row['Sl.No'] !== '' && row['Sl.No'] !== 'Total' && row['Sl.No'] !== 'All'
                            const isFooterStart = row['Sl.No'] === 'Total'
                            const isFooterSecondRow = (index === tableData.length - 1) && row['Sl.No'] === '' && row.user === ''
                            const isPercentageRow = row['T/A'] === '%'
                            const isFooterRow = isFooterStart || isFooterSecondRow

                            // const rowBg = isFooterRow ? '#f1f3f5' : (isPercentageRow ? '#f9f0f1' : 'background.paper')
                            const rowBg = isFooterRow ? '#f7f7f7' : (isPercentageRow ? '#f7f7f7' : 'background.paper')
                            return (
                                <TableRow
                                    key={index}
                                    sx={{
                                        bgcolor: rowBg,
                                        '& td, & th': {
                                            // border: '1px solid rgba(0, 0, 0, 0.12) !important',
                                            border: '1px solid var(--border-color) !important',
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    {isGroupStart ? (
                                        <>
                                            <TableCell
                                                rowSpan={3}
                                                sx={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 1,
                                                    bgcolor: 'background.paper',
                                                    verticalAlign: 'middle',
                                                    // fontWeight: 'bold'
                                                }}
                                            >
                                                {row['Sl.No']}
                                            </TableCell>
                                            <TableCell
                                                rowSpan={3}
                                                sx={{
                                                    position: 'sticky',
                                                    left: 60,
                                                    zIndex: 1,
                                                    bgcolor: 'background.paper',
                                                    verticalAlign: 'middle',
                                                    textAlign: 'left !important',
                                                    minWidth: 150,
                                                    // fontWeight: 'bold'
                                                }}
                                            >
                                                {row.user}
                                            </TableCell>
                                        </>
                                    ) : isFooterStart ? (
                                        <>
                                            <TableCell
                                                rowSpan={2}
                                                sx={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 1,
                                                    bgcolor: rowBg,
                                                    verticalAlign: 'middle',
                                                    // fontWeight: 'bold'
                                                }}
                                            >
                                                {row['Sl.No']}
                                            </TableCell>
                                            <TableCell
                                                rowSpan={2}
                                                sx={{
                                                    position: 'sticky',
                                                    left: 60,
                                                    zIndex: 1,
                                                    bgcolor: rowBg,
                                                    verticalAlign: 'middle',
                                                    textAlign: 'left !important',
                                                    minWidth: 150,
                                                    // fontWeight: 'bold'
                                                }}
                                            >
                                                {row.user}
                                            </TableCell>
                                        </>
                                    ) : (isFooterSecondRow || isPercentageRow || row['T/A'] === 'Actual') ? null : (
                                        // This catch-all handle Target/Actual rows that aren't group starts (they are skipped because of rowSpan above)
                                        null
                                    )}

                                    {/* The Actual and % rows don't render Sl.No/User because of rowSpan above, 
                                        but if it's NOT a row that was skipped by rowSpan, we'd need them.
                                        But since we ALWAYS have 3 rows for data and 2 for footer, the above logic is correct. */}

                                    <TableCell
                                        sx={{
                                            position: 'sticky',
                                            left: 210,
                                            zIndex: 1,
                                            bgcolor: rowBg,
                                            // fontWeight: '500'
                                        }}
                                    >
                                        {row['T/A']}
                                    </TableCell>
                                    {totalWeeks.map((week: string) => (
                                        <TableCell key={week}>
                                            {row.setColor === 'percentageColor' ? (
                                                <Typography variant='caption' sx={{ color: getPercentageColor(row[week]) }}>
                                                    {row[week]}%
                                                </Typography>
                                            ) : (
                                                <Typography variant='caption'>{row[week]}</Typography>
                                            )}
                                        </TableCell>
                                    ))}
                                    <TableCell
                                        sx={{
                                            position: 'sticky',
                                            right: 80,
                                            zIndex: 1,
                                            bgcolor: rowBg,
                                            // fontWeight: 'bold'
                                        }}
                                    >
                                        <Typography variant='caption' >
                                            {row.setColor === 'percentageColor' ? `${row.Total}%` : row.Total}
                                        </Typography>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            position: 'sticky',
                                            right: 0,
                                            zIndex: 1,
                                            bgcolor: rowBg
                                        }}
                                    >
                                        {isGroupStart && row.user_id && (
                                            <Tooltip title="Update Resource Allocation">
                                                <IconButton
                                                    size='small'
                                                    onClick={() => handleEdit(row.user_id)}
                                                    sx={{ p: 0 }}
                                                >
                                                    <i className='ri-edit-box-line' style={{ fontSize: '18px' }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {tableData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={totalWeeks.length + 5} align='center' sx={{ py: 10 }}>
                                    <Box className='flex flex-col items-center gap-2'>
                                        <i className='ri-file-search-line text-4xl text-textDisabled' />
                                        <Typography color='textDisabled'>No resource planning data available</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table >
            </TableContainer >
        </Card >
    )
}

export default ResourcePlanning
