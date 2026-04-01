'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'
import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'

interface PieChartProps {
    title: string
    series: number[]
    labels: string[]
    colors?: string[]
    height?: number
    showPercentage?: boolean
}

const defaultChartColors = [
    '#9fa6ad', // Grey
    '#4caf50', // Green
    '#666cff', // Blue
    '#f44336', // Red
    '#ffe802'  // Yellow
]

const PieChart = (props: PieChartProps) => {
    // Props
    const { title, series, labels, colors = defaultChartColors, height = 250, showPercentage = true } = props

    const options: ApexOptions = {
        labels: labels,
        stroke: {
            width: 0
        },
        colors: colors,
        dataLabels: {
            enabled: true,
            formatter(val: string, opts: any) {
                if (showPercentage) {
                    return `${Number.parseInt(val)}%`
                }
                return opts.w.config.series[opts.seriesIndex]
            }
        },
        legend: {
            show: false
        },
        grid: {
            padding: {
                top: 15
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        value: {
                            fontSize: '22px',
                            color: 'var(--mui-palette-text-primary)',
                            fontWeight: 500,
                            offsetY: -20
                        },
                        name: { offsetY: 20 },
                        total: {
                            show: true,
                            fontSize: '0.9375rem',
                            fontWeight: 400,
                            label: '',
                            color: 'var(--mui-palette-text-secondary)',
                            formatter(w) {
                                return w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0)
                            }
                        }
                    }
                }
            }
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant='h6' sx={{ mb: 2 }}>{title}</Typography>
            <AppReactApexCharts
                type='donut'
                height={height}
                width='100%'
                series={series}
                options={options}
            />
        </Box>
    )
}

export default PieChart
