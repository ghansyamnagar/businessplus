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

const KpiData = ({ leadKpiData, kpiData, onDownload, hideDownload }: { leadKpiData?: any[], kpiData?: any[], onDownload?: () => void, hideDownload?: boolean }) => {
    // States
    const [overallSeries, setOverallSeries] = useState<number[]>([0, 0, 0, 0])
    const [leadSeries, setLeadSeries] = useState<number[]>([0, 0, 0, 0])

    const chartLabels = ['Target missed', 'Target missed/ marginal gap wrt to target', 'Met the target/ Better than target', 'HOLD']


    useEffect(() => {
        if (kpiData) {
            const green = kpiData.reduce((acc, curr) => acc + (curr.green || 0), 0)
            const yellow = kpiData.reduce((acc, curr) => acc + (curr.yellow || 0), 0)
            const red = kpiData.reduce((acc, curr) => acc + (curr.red || 0), 0)
            const gray = kpiData.reduce((acc, curr) => acc + (curr.gray || 0), 0)
            setOverallSeries([green, yellow, red, gray])
        }
    }, [kpiData])

    useEffect(() => {
        if (leadKpiData) {
            const green = leadKpiData.reduce((acc, curr) => acc + (curr.green || 0), 0)
            const yellow = leadKpiData.reduce((acc, curr) => acc + (curr.yellow || 0), 0)
            const red = leadKpiData.reduce((acc, curr) => acc + (curr.red || 0), 0)
            const gray = leadKpiData.reduce((acc, curr) => acc + (curr.gray || 0), 0)
            setLeadSeries([green, yellow, red, gray])
        }
    }, [leadKpiData])


    const ChartColors = [
        '#4caf50', // Green
        '#ffe802', // Yellow
        '#f44336', // Red
        '#9fa6ad', // Grey
    ]
    return (
        <Card>
            <CardHeader
                title='KPI Status'
                titleTypographyProps={{ align: 'center', fontWeight: 'bold' }}
                action={
                    !hideDownload && (
                        <Tooltip title="Download PDF" placement='top'>
                            <IconButton
                                onClick={onDownload}
                                style={{ color: '#1976d2', fontSize: '20px' }}
                            >
                                <i className='ri-download-2-line' />
                            </IconButton>
                        </Tooltip>
                    )
                }
            />
            <CardContent>
                <Grid container spacing={6} alignItems='center'>
                    <Grid item xs={12} md={4}>
                        <PieChart
                            title='Overall KPI'
                            series={overallSeries}
                            labels={chartLabels}
                            colors={ChartColors}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <PieChart
                            title='Lead KPI'
                            series={leadSeries}
                            colors={ChartColors}
                            labels={chartLabels}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                justifyContent: 'center',
                                pl: { md: 10 }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 18, height: 18, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                                    <i className='ri-close-line' style={{ fontSize: '16px', fontWeight: 'bold' }} />
                                </Box>
                                <Typography variant='body2' sx={{ fontWeight: 500 }}>Target missed</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: '18px solid #ffd900' }} />
                                <Typography variant='body2' sx={{ fontWeight: 500 }}>Target missed/ marginal gap wrt to target</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    bgcolor: '#4caf50'
                                }} />
                                <Typography variant='body2' sx={{ fontWeight: 500 }}>Met the target/ Better than target</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '4px',
                                    bgcolor: '#9fa6ad'
                                }} />
                                <Typography variant='body2' sx={{ fontWeight: 500 }}>HOLD</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

            </CardContent>
        </Card>
    )
}

export default KpiData
