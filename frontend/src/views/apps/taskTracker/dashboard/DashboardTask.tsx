'use client'

// React Imports
import { useTheme } from '@mui/material/styles'

// MUI Import
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Component Imports
import PieChart from '@/components/common/chart/PieChart'
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

// React Imports
import { useEffect, useState } from 'react'

const DashboardTask = ({ totalTaskStatusData, onDownload, hideDownload }: { totalTaskStatusData?: any, onDownload?: () => void, hideDownload?: boolean }) => {
    // States
    const [overallSeries, setOverallSeries] = useState<number[]>([0, 0, 0, 0])


    // const chartLabels = ['Completed', 'Due date not arrived', 'Delayed', 'Completed but delayed', 'On Hold']
    const chartLabels = ['Closed Task', 'Wip Task', 'Delayed Task', 'Closed With Delay', 'Hold Task']
    useEffect(() => {
        if (totalTaskStatusData) {
            const green = totalTaskStatusData?.closed || 0
            const yellow = totalTaskStatusData?.open || 0
            const red = totalTaskStatusData?.delayed || 0
            const blue = totalTaskStatusData?.onHold || 0
            const gray = totalTaskStatusData?.closedWithDelay || 0

            // Mapping to match chartLabels and image legend:
            // 1. Completed (green) -> closed
            // 2. Due date not arrived (yellow) -> open
            // 3. Delayed (red) -> delayed
            // 4. Completed but delayed (blue) -> closedWithDelay
            // 5. On Hold (gray) -> onHold
            setOverallSeries([green, yellow, red, gray, blue])
        }
    }, [totalTaskStatusData])

    const ChartColors = [
        '#4caf50', // Green: Completed
        '#ffe802', // Yellow: Due date not arrived
        '#f44336', // Red: Delayed
        '#7dabf5', // Blue: Completed but delayed
        '#9fa6ad', // Grey: On Hold
    ]

    const LegendRow = ({ color, icon, label, isLast }: { color: string, icon: 'circle' | 'triangle' | 'square-x' | 'square' | 'square-h', label: string, isLast?: boolean }) => (
        <Box sx={{ display: 'flex', borderBottom: isLast ? 'none' : '1px solid', borderColor: 'divider' }}>
            <Box sx={{ width: 50, height: 35, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon === 'circle' && <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: color }} />}
                {icon === 'triangle' && <Box sx={{ width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: `18px solid ${color}` }} />}
                {icon === 'square-x' && (
                    <Box sx={{ width: 18, height: 18, border: `2px solid ${color}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                        <i className='ri-close-line' style={{ fontSize: '18px', fontWeight: 'bold' }} />
                    </Box>
                )}
                {icon === 'square' && <Box sx={{ width: 18, height: 18, borderRadius: '2px', bgcolor: color }} />}
                {icon === 'square-h' && (
                    <Box sx={{ width: 18, height: 18, border: `2px solid ${color}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, fontWeight: 'bold', fontSize: '14px' }}>
                        H
                    </Box>
                )}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant='caption' sx={{ fontSize: '12px', color: 'text.primary' }}>{label}</Typography>
            </Box>
        </Box>
    )

    return (
        <Card>
            <CardHeader
                title='Task Status'
                titleTypographyProps={{ align: 'center', fontWeight: 'bold' }}
                action={
                    !hideDownload && (
                        <Tooltip title="Download PDF" placement='top'>
                            <IconButton onClick={onDownload} style={{ color: '#1976d2', fontSize: '20px' }}>
                                <i className='ri-download-2-line' />

                            </IconButton>
                        </Tooltip>
                    )
                }
            />
            <CardContent>
                <Grid container spacing={6} alignItems='center'>
                    <Grid item xs={12} md={7}>
                        <PieChart
                            title='Task'
                            series={overallSeries}
                            labels={chartLabels}
                            colors={ChartColors}
                        />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Box sx={{ border: '1px solid', borderColor: 'divider', width: '240px', mx: 'auto' }}>
                            <LegendRow color='#4caf50' icon='circle' label='Closed Task' />
                            <LegendRow color='#ffe802' icon='triangle' label='Wip Task' />
                            <LegendRow color='#f44336' icon='square-x' label='Delayed' />
                            <LegendRow color='#9fa6ad' icon='square' label='Closed With Delay' />
                            <LegendRow color='#7dabf5' icon='square-h' label='On Hold' isLast />
                        </Box>
                    </Grid>
                </Grid>

            </CardContent>
        </Card>
    )
}

export default DashboardTask
