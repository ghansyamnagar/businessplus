'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CardHeader from '@mui/material/CardHeader'
import { format, parseISO } from 'date-fns'
import PieChart from '@/components/common/chart/PieChart'
import { getFunctionReportDetailsRequest, getStrategicObjectivesDashRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import { IconButton } from '@mui/material'
import tableStyles from '@core/styles/table.module.css'
import StraInitiActionTableStatus from '@/components/common/chart/StraInitiActionTableStatus'
import { getKpiDashboardRequest, getLeadKpiDashboardRequest } from '@/redux-store/slices/kpiTracker/kpiTracker.slice'
import KpiData from '../../dashboard/KpiData'
import { getActionPlansListReq } from '@/redux-store/slices/actionplans/actionplans.slice'
const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'Green':
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box
                        sx={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            bgcolor: '#4caf50'
                        }}
                    />
                </Box>
            )
        case 'Yellow':
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box
                        sx={{
                            width: 0,
                            height: 0,
                            borderLeft: '11px solid transparent',
                            borderRight: '11px solid transparent',
                            borderBottom: '18px solid #ffd900'
                        }}
                    />
                </Box>
            )
        case 'Red':
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 18,
                            height: 18,
                            border: '2px solid #f44336',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#f44336'
                        }}
                    >
                        <i className='ri-close-line' style={{ fontSize: '18px', fontWeight: 'bold' }} />
                    </Box>
                </Box>
            )
        case 'Gray (Started)':
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box
                        sx={{
                            width: 18,
                            height: 18,
                            borderRadius: '4px',
                            bgcolor: '#9fa6ad'
                        }}
                    />
                </Box>
            )
        case 'Blue (Hold)':
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box
                        sx={{
                            width: 18,
                            height: 18,
                            borderRadius: '4px',
                            bgcolor: '#4b89dc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            paddingTop: '2px'
                        }}
                    >
                        H
                    </Box>
                </Box>
            )
        default:
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box
                        sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: '#ccc'
                        }}
                    />
                </Box>
            )
    }
}

const ViewQtlySummary = () => {
    const { deptId, reportId } = useParams()
    const dispatch = useDispatch()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [reportData, setReportData] = useState<any>(null)
    const [strategicObjectivesSeries, setStrategicObjectivesSeriesDash] = useState<number[]>([0, 0, 0, 0, 0])
    const [initiativesSeriesDash, setInitiativesSeriesDash] = useState<number[]>([0, 0, 0, 0, 0])
    const [actionPlanSeriesDash, setActionPlanSeriesDash] = useState<number[]>([0, 0, 0, 0, 0])
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [kpiData, setKpiData] = useState<any[]>([])
    const [leadKpiData, setLeadKpiData] = useState<any[]>([])
    const [actionPlansListData, setActionPlansListData] = useState<any[]>([])

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

    useEffect(() => {
        if (reportId) {
            dispatch(getFunctionReportDetailsRequest({
                payload: { quartupdatmanufacturs_id: Number(reportId) },
                callback: (res: any) => {
                    if (res?.status === 'success') {
                        setReportData(res.data)
                        dispatch(getStrategicObjectivesDashRequest({
                            payload: {
                                unit_id: res.data?.unit_id,
                                dept_id: deptId,
                                year: res.data?.year
                            },
                            callback: (response: any) => {
                                if (response?.status === 'success' && response.data) {
                                    setStrategicObjectivesSeriesDash(getSeries(response.data.strategic_objectives))
                                    setInitiativesSeriesDash(getSeries(response.data.initiatives))
                                    setActionPlanSeriesDash(getSeries(response.data.action_plans))
                                    setDashboardData(response.data)
                                }
                            }
                        }))
                        dispatch(getKpiDashboardRequest({
                            payload: {
                                unit_id: res.data?.unit_id,
                                dept_id: deptId,
                                year: res.data?.year
                            },
                            callback: (data: any) => {
                                if (data?.data) {
                                    setKpiData(data.data)
                                }
                            }
                        }))
                        dispatch(getLeadKpiDashboardRequest({
                            payload: {
                                unit_id: res.data?.unit_id,
                                dept_id: deptId,
                                year: res.data?.year
                            },
                            callback: (data: any) => {
                                if (data?.data) {
                                    setLeadKpiData(data.data)
                                }
                            }
                        }))
                        dispatch(getActionPlansListReq({
                            payload: {
                                unit_id: res.data?.unit_id,
                                dept_id: deptId,
                                year: res.data?.year
                            },
                            callback: (response: any) => {
                                if (response?.data) {
                                    const filteredData = response?.data.filter((item: any) => String(item.dept_id) === String(deptId))

                                    setActionPlansListData(filteredData)
                                } else {
                                    setActionPlansListData([])
                                }
                            }
                        }))
                    }
                    setLoading(false)
                }
            }))
        }
    }, [reportId, dispatch, deptId])

    if (loading) {
        return (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardContent>
                        <Box mb={4} display='flex' justifyContent='center' position="relative" alignItems='center'>
                            <IconButton sx={{ position: 'absolute', left: 0 }} onClick={() => router.back()}>
                                <i className='ri-arrow-left-line' />
                            </IconButton>
                            <Typography variant='h5'>Monthly Report Summary</Typography>
                        </Box>

                        <TableContainer component={Paper} variant='outlined' sx={{ mb: 6 }}>
                            <Table size='small'>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ backgroundColor: 'action.hover', fontWeight: 'bold', width: '15%' }}>Unit</TableCell>
                                        <TableCell sx={{ width: '35%' }}>{reportData?.unit_name || '-'}</TableCell>
                                        <TableCell sx={{ backgroundColor: 'action.hover', fontWeight: 'bold', width: '15%' }}>Financial Year</TableCell>
                                        <TableCell sx={{ width: '35%' }}>{reportData?.year || '-'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ backgroundColor: 'action.hover', fontWeight: 'bold' }}>Department</TableCell>
                                        <TableCell>{reportData?.dept_name || '-'}</TableCell>
                                        <TableCell sx={{ backgroundColor: 'action.hover', fontWeight: 'bold' }}>Period</TableCell>
                                        <TableCell>{reportData?.quarterly || '-'}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader
                        title='Business Plan'
                        titleTypographyProps={{ align: 'center', fontWeight: 'bold' }}
                    />
                    <Grid container spacing={6} alignItems="center">
                        {/* Strategic Objectives */}
                        <Grid size={{ xs: 12, md: 6, lg: 2.6 }} className='pt-0 pl-0'>
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
                        <Grid size={{ xs: 12, md: 6, lg: 2.6 }} className='pt-0 pl-0'>
                            <PieChart
                                title='Initiatives'
                                series={initiativesSeriesDash}
                                labels={chartLabels}
                                colors={chartColors}
                                height={250}
                                showPercentage={true}
                            />
                        </Grid>

                        {/* Action Plan */}
                        <Grid size={{ xs: 12, md: 6, lg: 2.6 }} className='pt-0 pl-0'>
                            <PieChart
                                title='Action Plan'
                                series={actionPlanSeriesDash}
                                labels={chartLabels}
                                colors={chartColors}
                                height={250}
                                showPercentage={true}
                            />
                        </Grid>

                        {/* Status Table */}
                        <Grid size={{ xs: 12, md: 12, lg: 4.2 }} className='pt-0 pl-3'>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant='h6' sx={{ mb: 2 }}>Summary Status</Typography>
                                <StraInitiActionTableStatus strategicObjectivesDash={dashboardData} />
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
            </Grid>
            <Grid size={{ xs: 12 }}>
                <KpiData kpiData={kpiData} leadKpiData={leadKpiData} />
            </Grid>

            {/* Action Plans Table */}
            <Grid size={{ xs: 12 }}>
                <Card elevation={4}>
                    {/* <Box className={tableStyles.cardHeaderTitle}>
                        Action Plans
                    </Box> */}
                    <CardContent>
                        <TableContainer className={tableStyles.tableContainer} component={Paper} elevation={0} sx={{ border: '1px solid var(--mui-palette-divider)', maxHeight: 300, overflowY: 'auto' }}>
                            <Table size="small" stickyHeader>
                                <TableHead sx={{ bgcolor: 'var(--mui-palette-action-hover)' }}>
                                    <TableRow>
                                        <TableCell>S. No.</TableCell>
                                        <TableCell>Action Plan</TableCell>
                                        <TableCell>Resp.</TableCell>
                                        <TableCell>Department</TableCell>
                                        <TableCell>Related KPI</TableCell>
                                        <TableCell>Target Value</TableCell>
                                        <TableCell>Start</TableCell>
                                        <TableCell>Finish</TableCell>
                                        <TableCell>Completion</TableCell>
                                        <TableCell className={tableStyles.statusThForIcone}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {actionPlansListData?.map((data: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{data.sr_no}</TableCell>
                                            <TableCell sx={{ minWidth: 200 }}>{data.action_plan_definition}</TableCell>
                                            <TableCell>
                                                {data.assign_action_plan_user?.map((u: any) => u && (
                                                    <Typography key={u.co_owner} variant="caption" display="block">{u.user_name}</Typography>
                                                ))}
                                            </TableCell>
                                            <TableCell>{data.dept_name}</TableCell>
                                            <TableCell>
                                                {data.kpi_data?.map((k: any) => k && k.kpi_name && (
                                                    <Typography key={k.kpi_id || k.id} variant="caption" display="block">{k.kpi_name}</Typography>
                                                ))}
                                            </TableCell>
                                            <TableCell>{data.target}</TableCell>
                                            <TableCell>{data.start_date ? format(parseISO(data.start_date), 'dd-MM-yyyy') : ''}</TableCell>
                                            <TableCell>{data.end_date ? format(parseISO(data.end_date), 'dd-MM-yyyy') : ''}</TableCell>
                                            <TableCell>{data.percentage}%</TableCell>
                                            <TableCell><StatusIcon status={data.status_name} /></TableCell>
                                        </TableRow>
                                    ))}
                                    {(!actionPlansListData || actionPlansListData.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">No data available</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>



            <Grid size={{ xs: 12 }}>
                <Card elevation={4} >
                    <Box className={tableStyles.cardHeaderTitle}>
                        Highlights
                    </Box>
                    <CardContent sx={{ p: 6 }}>
                        <Typography
                            variant="body1"
                            sx={{ textAlign: 'left', color: 'text.secondary', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            dangerouslySetInnerHTML={{ __html: reportData?.highlight || 'No highlights available' }}
                        />
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Card elevation={4} >
                    <Box className={tableStyles.cardHeaderTitle}>
                        Improvement Opportunities
                    </Box>
                    <CardContent sx={{ p: 6 }}>
                        <Typography
                            variant="body1"
                            sx={{ textAlign: 'left', color: 'text.secondary', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            dangerouslySetInnerHTML={{ __html: reportData?.majorgaps || 'No Improvement Opportunities available' }}
                        />
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Card elevation={4} >
                    <Box className={tableStyles.cardHeaderTitle}>
                        Challenges
                    </Box>
                    <CardContent sx={{ p: 6 }}>
                        <Typography
                            variant="body1"
                            sx={{ textAlign: 'left', color: 'text.secondary', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            dangerouslySetInnerHTML={{ __html: reportData?.challenges || 'No challenges available' }}
                        />
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Card elevation={4} >
                    <Box className={tableStyles.cardHeaderTitle}>
                        Priorities - Next Quarterly
                    </Box>
                    <CardContent sx={{ p: 6 }}>
                        <Typography
                            variant="body1"
                            sx={{ textAlign: 'left', color: 'text.secondary', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            dangerouslySetInnerHTML={{ __html: reportData?.priorities || 'No priorities available' }}
                        />
                    </CardContent>
                </Card>
            </Grid>

        </Grid>
    )
}

export default ViewQtlySummary
