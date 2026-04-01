'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Component Imports
import KPIChartLIneGraph from '@/components/common/chart/KPIChartLIneGraph'

// Redux Imports
import type { AppDispatch } from '@/redux-store'
import { getKpiTrackersTrackRequest } from '@/redux-store/slices/kpiTracker/kpiTracker.slice'

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const KpiDataGraph = () => {
    const { id: deptId, lang } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { data: session } = useSession()

    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const selectedYear = (session?.user as any)?.userSelectedYear

    const historicalYears = useMemo(() => {
        if (!selectedYear) return [0, 0, 0, 0]
        return [
            selectedYear - 4,
            selectedYear - 3,
            selectedYear - 2,
            selectedYear - 1,
        ]
    }, [selectedYear])

    useEffect(() => {
        if (deptId) {
            setLoading(true)
            dispatch(getKpiTrackersTrackRequest({
                payload: { dept_id: deptId },
                callback: (response: any, error: any) => {
                    if ((response?.status === 'Success' || response?.status === 'success') && response?.data?.length > 0) {
                        setData(response.data[0])
                    } else {
                        setData(null)
                    }
                    setLoading(false)
                }
            }))
        }
    }, [deptId, selectedYear, dispatch])

    const kpiList = data?.add_kpis_data || []

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!data || kpiList.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <IconButton onClick={() => router.push(`/${lang}/apps/kpiTracker/kpidata`)}>
                            <i className='ri-arrow-left-line' />
                        </IconButton>
                        <Typography variant='h5'>KPI Data Graphs</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant='h6' color='text.secondary'>
                            No KPI data available for this department
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => router.push(`/${lang}/apps/kpiTracker/kpidata`)}>
                            <i className='ri-arrow-left-line' />
                        </IconButton>
                        <Box>
                            <Typography variant='h5'>
                                KPI Data Graphs
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Department: {data.dept_name}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        label={`${kpiList.length} KPI${kpiList.length !== 1 ? 's' : ''}`}
                        color='primary'
                        variant='tonal'
                        size='small'
                    />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Charts Grid - 2 columns */}
                <Grid container spacing={4}>
                    {kpiList.map((kpi: any) => {
                        const currentTarget = kpi.kpi_targets?.find((t: any) => t.target_year === selectedYear)
                        const currentActual = kpi.kpi_actuals?.find((a: any) => a.actual_year === selectedYear)

                        return (
                            <Grid size={{ xs: 12, md: 6 }} key={kpi.kpi_id}>

                                {/* KPI Info Header */}
                                <Box
                                    sx={{
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {kpi.kpi_name}
                                    </Typography>

                                    <Chip
                                        label={kpi.ideal_trend === 'positive' ? 'Positive' : 'Negative'}
                                        variant="tonal"
                                        color={kpi.ideal_trend === 'positive' ? 'success' : 'error'}
                                        icon={
                                            kpi.ideal_trend === 'positive'
                                                ? <i className="ri-arrow-up-line" />
                                                : <i className="ri-arrow-down-line" />
                                        }
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    />
                                </Box>

                                {/* Line Chart */}
                                <KPIChartLIneGraph
                                    kpi={kpi}
                                    historicalYears={historicalYears}
                                    selectedYear={selectedYear}
                                    months={MONTHS}
                                />
                            </Grid>
                        )
                    })}
                </Grid>
            </CardContent>
        </Card>
    )
}

export default KpiDataGraph
