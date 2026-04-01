'use client'

import type { ApexOptions } from 'apexcharts'
import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'

interface KPIChartLIneGraphProps {
    kpi: any
    historicalYears: number[]
    selectedYear: any
    months: string[]
}

const KPIChartLIneGraph = ({ kpi, historicalYears, selectedYear, months }: KPIChartLIneGraphProps) => {

    const getKPIChartOptions = (kpi: any): ApexOptions => {
        const historicalLabels = historicalYears.map(String)
        const monthLabelsMixed = months.map(m => m.charAt(0).toUpperCase() + m.slice(1))
        const categories = [...historicalLabels, ...monthLabelsMixed]

        return {
            chart: {
                height: 350,
                type: 'line',
                zoom: { enabled: false },
                toolbar: { show: false }
            },
            dataLabels: {
                enabled: true,
                offsetY: -10,
                style: {
                    fontSize: '10px',
                    fontWeight: '400'
                }
            },
            stroke: { curve: 'straight', width: 1 },
            colors: ['#666cff', '#4caf50'],
            xaxis: {
                categories: categories,
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            markers: {
                size: 4,
                strokeWidth: 0,
                hover: { size: 6 }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left'
            },
            grid: {
                borderColor: 'var(--mui-palette-divider)',
                xaxis: { lines: { show: true } }
            }
        }
    }

    return (
        <AppReactApexCharts
            options={getKPIChartOptions(kpi)}
            series={[
                {
                    name: 'Target',
                    data: (() => {
                        const currentTarget = kpi.kpi_targets?.find((t: any) => t.target_year === selectedYear)
                        return [
                            ...historicalYears.map(y => {
                                const t = kpi.kpi_targets?.find((target: any) => target.target_year === y)
                                return t ? t.avg || 0 : 0
                            }),
                            ...months.map(m => (currentTarget?.[m] !== null && currentTarget?.[m] !== undefined) ? currentTarget[m] : 0)
                        ]
                    })()
                },
                {
                    name: 'Actual',
                    data: (() => {
                        const currentActual = kpi.kpi_actuals?.find((a: any) => a.actual_year === selectedYear)
                        return [
                            ...historicalYears.map(y => {
                                const a = kpi.kpi_actuals?.find((actual: any) => actual.actual_year === y)
                                return a ? a.avg || 0 : 0
                            }),
                            ...months.map(m => (currentActual?.[m] !== null && currentActual?.[m] !== undefined) ? currentActual[m] : null)
                        ]
                    })()
                }
            ]}
            type="line"
            height={300}
        />
    )
}

export default KPIChartLIneGraph
