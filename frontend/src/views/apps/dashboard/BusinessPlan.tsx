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
import StraInitiActionTableStatus from '@/components/common/chart/StraInitiActionTableStatus'

const BusinessPlan = ({ strategicObjectivesDash }: { strategicObjectivesDash?: any }) => {
    // Hooks
    const theme = useTheme()

    // Helper to extract series data
    const getSeries = (data?: any) => {
        if (!data) return [0, 0, 0, 0, 0]
        return [
            data.green || 0,
            data.blue || 0,
            data.gray || 0,
            data.red || 0,
            data.yellow || 0
        ]
    }

    // Common Colors and Labels
    const chartColors = [
        '#4caf50', // Green: On track
        '#666cff', // Blue: Target met
        '#9fa6ad', // Grey: Hold
        '#f44336', // Red: Target Missed
        '#ffe802'  // Yellow: Delayed
    ]

    const chartLabels = [
        'On track/ Due date not arrived',
        'Target met/ Exceeded target',
        'Hold/ Deferred',
        'Target Missed/ No recovery plan in place',
        'Delayed/ Recovery Plan available'
    ]

    // Series Data
    const initiativesSeries = getSeries(strategicObjectivesDash?.initiatives)
    const actionPlanSeries = getSeries(strategicObjectivesDash?.action_plans)
    const strategicObjectivesSeries = getSeries(strategicObjectivesDash?.strategic_objectives)

    return (
        <Card>
            <CardHeader
                title='Business Plan'
                titleTypographyProps={{ align: 'center', fontWeight: 'bold' }}
            />
            <Grid container spacing={6} alignItems="center">
                {/* Strategic Objectives */}
                <Grid item xs={12} md={6} lg={2.6} className='pt-0 pl-0'>
                    <PieChart
                        title='Strategic Objectives'
                        series={strategicObjectivesSeries}
                        labels={chartLabels}
                        colors={chartColors}
                        height={250}
                        showPercentage={true}
                    />
                </Grid>

                {/* Initiatives */}
                <Grid item xs={12} md={6} lg={2.6} className='pt-0 pl-0'>
                    <PieChart
                        title='Initiatives'
                        series={initiativesSeries}
                        labels={chartLabels}
                        colors={chartColors}
                        height={250}
                        showPercentage={true}
                    />
                </Grid>

                {/* Action Plan */}
                <Grid item xs={12} md={6} lg={2.6} className='pt-0 pl-0'>
                    <PieChart
                        title='Action Plan'
                        series={actionPlanSeries}
                        labels={chartLabels}
                        colors={chartColors}
                        height={250}
                        showPercentage={true}
                    />
                </Grid>

                {/* Status Table */}
                <Grid item xs={12} md={12} lg={4.2} className='pt-0 pl-0'>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant='h6' sx={{ mb: 2 }}>Summary Status</Typography>
                        <StraInitiActionTableStatus strategicObjectivesDash={strategicObjectivesDash} />
                    </Box>
                </Grid>
            </Grid>
            <Box sx={{ mt: 4, ml: 4, mb: 4 }}>
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
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>Target Missed/ No recovery plan in place</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: '18px solid #ffd900' }} />
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>Delayed/ Recovery Plan available</Typography>
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
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>On track/ Due date not arrived</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 18, height: 18, paddingTop: "2px", borderRadius: '4px', bgcolor: '#4b89dc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>H</Box>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>Hold/ Deferred</Typography>
                    </Box>
                </Box>
            </Box>
        </Card>
    )
}

export default BusinessPlan
