
'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface DepartmentBarChartProps {
    chartData?: any[]
}

const DepartmentBarChart = ({ chartData }: DepartmentBarChartProps) => {
    // Hooks
    const theme = useTheme()

    const { series, categories, actualColors } = useMemo(() => {
        if (!chartData || chartData.length === 0) return { series: [], categories: [], actualColors: [] }

        const categories = chartData.map((item: any) => item.dept_name)

        // Detect if it is Task data or KPI data
        const isTaskData = chartData[0].hasOwnProperty('closed') || chartData[0].hasOwnProperty('open')

        if (isTaskData) {
            const greenData = chartData.map((item: any) => item.closed || 0)
            const yellowData = chartData.map((item: any) => item.open || 0)
            const redData = chartData.map((item: any) => item.delayed || 0)
            const greyData = chartData.map((item: any) => item.closedWithDelay || 0)
            const blueData = chartData.map((item: any) => item.onHold || 0)

            const series = [
                { name: 'Closed', data: greenData },
                { name: 'WIP', data: yellowData },
                { name: 'Delayed', data: redData },
                { name: 'Closed With Delay', data: greyData },
                { name: 'On Hold', data: blueData }
            ]

            const actualColors = ['#4caf50', '#ffe802', '#f44336', '#9fa6ad', '#7dabf5']

            return { series, categories, actualColors }
        } else {
            const greenData = chartData.map((item: any) => item.green || 0)
            const redData = chartData.map((item: any) => item.red || 0)
            const yellowData = chartData.map((item: any) => item.yellow || 0)
            const greyData = chartData.map((item: any) => item.gray || 0)

            const series = [
                { name: 'Green', data: greenData },
                { name: 'Red', data: redData },
                { name: 'Yellow', data: yellowData },
                { name: 'Grey', data: greyData }
            ]

            const actualColors = ['#4caf50', '#f44336', '#ffe802', '#9fa6ad']

            return { series, categories, actualColors }
        }
    }, [chartData])

    const options: ApexOptions = {
        chart: {
            type: 'bar',
            stacked: true,
            parentHeightOffset: 0,
            toolbar: { show: false }
        },
        tooltip: { enabled: true },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 8,
                barHeight: '80%',

                dataLabels: {
                    total: {
                        enabled: true,
                        style: {
                            fontSize: '13px',
                            fontWeight: 900
                        }
                    }
                }
            }
        },
        stroke: {
            width: 0,
            colors: ['var(--mui-palette-background-paper)']
        },
        colors: actualColors,
        dataLabels: {
            enabled: true,
            style: { fontSize: '0.8125rem', fontWeight: 500 },
            offsetY: 7
        },
        states: {
            hover: {
                filter: { type: 'none' }
            },
            active: {
                filter: { type: 'none' }
            }
        },
        legend: { show: false, position: 'top' },
        grid: {
            strokeDashArray: 6,
            borderColor: 'var(--mui-palette-divider)',
            xaxis: {
                lines: { show: true }
            },
            yaxis: {
                lines: { show: false }
            },
            padding: {
                top: -10,
                left: theme.direction === 'rtl' ? 7 : -10,
                right: -5,
                bottom: 10
            }
        },
        xaxis: {
            categories: categories,
            axisTicks: { show: false },
            axisBorder: { show: false },
            labels: {
                style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '13px' },
            }
        },
        yaxis: {
            labels: {
                show: true,
                align: theme.direction === 'rtl' ? 'right' : 'left',
                style: {
                    fontSize: '0.8125rem',
                    colors: 'var(--mui-palette-text-primary)'
                }
            }
        },
        responsive: [
            {
                breakpoint: 1024,
                options: {
                    dataLabels: {
                        style: { fontSize: '0.625rem' }
                    }
                }
            }
        ]
    }

    return (

        <Grid container>
            <Grid size={{ xs: 12, sm: 12 }} className=''>
                <CardHeader title='Department Wise Status' className='pt-0 pl-0 pr-0 pb-1' titleTypographyProps={{ align: 'center' }} />
                <CardContent>
                    <AppReactApexCharts width='100%' type='bar' series={series} options={options} />
                </CardContent>
            </Grid>
        </Grid>

    )
}

export default DepartmentBarChart
