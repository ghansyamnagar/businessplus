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
import { useEffect, useState } from 'react'
// Component Imports
import PieChart from '@/components/common/chart/PieChart'

// const kpiOverallChartSeries = [11, 3, 1, 1, 1] // Grey, Green, Blue, Red, Yellow (Matching BusinessPlan)
// const kpiLeadhartSeries = [13, 14, 1, 1, 1] // Grey, Red, Green, Yellow, Blue (Matching BusinessPlan)
// const chartLabels = ['Incorrect address', 'Weather conditions', 'Federal Holidays', 'Damage during transit']

const KpiData = ({ leadKpiData, kpiData }: { leadKpiData?: any[], kpiData?: any[] }) => {
    // Hooks
    // States
    const [overallSeries, setOverallSeries] = useState<number[]>([0, 0, 0, 0])
    const [leadSeries, setLeadSeries] = useState<number[]>([0, 0, 0, 0])

    const chartLabels = ['Target missed', 'Target missed/ marginal gap wrt to target', 'Met the target/ Better than target', 'HOLD']

    // console.log('ggggggggggggggg', kpiData)

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
            />
            <CardContent>
                <Grid container spacing={6}>
                    <Grid item xs={12} md={6}>
                        <PieChart
                            title='Overall KPI'
                            series={overallSeries}
                            labels={chartLabels}
                            colors={ChartColors}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <PieChart
                            title='Lead KPI'
                            series={leadSeries}
                            colors={ChartColors}
                            labels={chartLabels}
                        />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 4 }}>
                    <Typography variant='h6' sx={{ mb: 1 }}>Legend</Typography>
                    <Box
                        sx={{
                            border: '1px solid',
                            borderRadius: '4px',
                            borderColor: 'divider',
                            p: 2,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3,
                            justifyContent: 'flex-start',
                            width: 'fit-content'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 18, height: 18, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                                <i className='ri-close-line' style={{ fontSize: '16px', fontWeight: 'bold' }} />
                            </Box>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>Target Missed/ No action plan in place</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: '18px solid #ffd900' }} />
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>Delay/ Action plan in place</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                bgcolor: '#4caf50'
                            }} />
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>Target met/ Exceeded target</Typography>
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
                </Box>
            </CardContent>
        </Card>
    )
}

export default KpiData
