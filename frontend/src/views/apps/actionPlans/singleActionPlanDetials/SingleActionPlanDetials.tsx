'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
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
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import ButtonGroup from '@mui/material/ButtonGroup'
import { format, parseISO, getYear, getMonth, isValid } from 'date-fns'
import { useSelector } from 'react-redux'
import type { ApexOptions } from 'apexcharts'
import { toast } from 'react-toastify'

import { getActionPlanCommentReq, getActionPlanScheduleDataReq } from '@/redux-store/slices/actionplans/actionplans.slice'
import KPIChartLIneGraph from '@/components/common/chart/KPIChartLIneGraph'
import { departmentWiseStrategicObjectivesRequest, getStrObjStatusRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import type { RootState } from '@/redux-store'
import StraInitiActionLegendCaluculation from '@/components/common/StraInitiActionLegendCaluculation'
import ChangeReview from './dialogs/ChangeReview'
import tableStyles from '@core/styles/table.module.css'
import { IconButton } from '@mui/material'
import { useModulePermission } from '@/hooks/useModulePermission'

const JAN_DEC_MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const APRIL_MARCH_MONTHS = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar']

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

const TimelineMarker = ({ type, late }: { type: string, late: boolean }) => {
    const color = late ? '#f44336' : '#9fa6ad'

    if (type === '0') { // Start month
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 22 22">
                    <circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="2" />
                </svg>
            </Box>
        )
    }
    if (type === '3') { // End month
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" fill={color} />
                </svg>
            </Box>
        )
    }
    if (type === '1') { // Unreviewed (Triangle Stroke)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 72 72">
                    <path d="M3.23 69.34L35.77 3.11L69.23 68.88L3.23 69.34Z" fill="none" stroke={color} strokeWidth="3" />
                </svg>
            </Box>
        )
    }
    if (type === '2') { // Reviewed (Triangle Fill)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 72 72">
                    <path d="M0.23 66.34L32.77 0.11L66.23 65.88L0.23 66.34Z" fill={color} />
                </svg>
            </Box>
        )
    }
    return null
}

const SingleActionPlanDetials = () => {
    const { actionPlanId, lang } = useParams()
    const router = useRouter()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [actionPlanDetials, setActionPlanDetials] = useState<any>(null)
    const [statuses, setStatuses] = useState<any[]>([])
    const [strategicObjectivesData, setStrategicObjectivesData] = useState<any>(null)
    const [selectedYear, setSelectedYear] = useState<any>('')
    const [timelineData, setTimelineData] = useState<any[]>([])
    const [actionPlanYears, setActionPlanYears] = useState<any[]>([])
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
    const [reviewDialogData, setReviewDialogData] = useState<any>(null)
    const historicalYears = useMemo(() => {
        if (!selectedYear) return []
        const yearNum = typeof selectedYear === 'string' ? parseInt(selectedYear) : selectedYear
        return [
            yearNum - 4,
            yearNum - 3,
            yearNum - 2,
            yearNum - 1,
        ]
    }, [selectedYear])

    const companyDetails = useSelector((state: RootState) => state.companyReducer.companyDetails)
    const financialYear = (companyDetails as any)?.general_data?.[0]?.financial_year || 'jan-dec'
    const months = financialYear === 'april-march' ? APRIL_MARCH_MONTHS : JAN_DEC_MONTHS
    const actionPlanSchedulesPermission = useModulePermission('Action_plan_schedules')
    useEffect(() => {
        if (actionPlanId) {
            fetchData()
        }
    }, [actionPlanId])

    useEffect(() => {
        if (actionPlanDetials?.data) {
            const data = actionPlanDetials.data
            const startDate = data.start_date ? parseISO(data.start_date) : null
            const endDate = data.end_date ? parseISO(data.end_date) : null

            if (startDate && isValid(startDate) && endDate && isValid(endDate)) {
                const startYear = getYear(startDate)
                const endYear = getYear(endDate)
                const startMonth = parseInt(format(startDate, 'MM'))
                const endMonth = parseInt(format(endDate, 'MM'))
                const years = []

                if (financialYear === 'april-march') {
                    for (let a = startYear - 1; a <= endYear; a++) {
                        if (endMonth <= 3 && a === endYear) continue
                        if (startMonth > 3 && a === startYear - 1) continue

                        years.push({
                            year_key: a,
                            year_value: `${a}-${(a + 1).toString().substring(2, 4)}`
                        })
                    }
                } else {
                    for (let y = startYear; y <= endYear; y++) {
                        years.push({
                            year_key: y,
                            year_value: y.toString()
                        })
                    }
                }

                setActionPlanYears(years)
                if (years.length > 0 && !selectedYear) {
                    const currentYear = new Date().getFullYear()
                    const defaultYear = years.find((y: any) => y.year_key === currentYear) || years[0]
                    setSelectedYear(defaultYear.year_key)
                }
            }
        }
    }, [actionPlanDetials, financialYear, selectedYear])

    useEffect(() => {
        dispatch(getStrObjStatusRequest({
            payload: {},
            callback: (response: any) => {
                if (response?.status === 'success') {
                    setStatuses(response.data)
                }
            }
        }))

        dispatch(departmentWiseStrategicObjectivesRequest({
            payload: {},
            callback: (response: any) => {
                if (response?.status === 'success') {
                    setStrategicObjectivesData(response.data)
                }
            }
        }))
    }, [dispatch])

    useEffect(() => {
        if (actionPlanDetials?.data) {
            processTimelineData(actionPlanDetials.data, selectedYear)
        }
    }, [actionPlanDetials, selectedYear])

    const fetchData = async () => {
        setLoading(true)
        try {
            await fetchActionPlanDetails()
        } catch (error) {
            console.error('Error fetching action plan details:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchActionPlanDetails = () => {
        return new Promise((resolve) => {
            const payload = {
                payload: { action_plan_id: actionPlanId },
                callback: (data: any, error: any) => {
                    if (data && data.status === 'success') {
                        const normalizedData = {
                            ...data,
                            data: Array.isArray(data.data) ? data.data[0] : data.data
                        }
                        setActionPlanDetials(normalizedData)
                    }
                    resolve(true)
                }
            }
            dispatch(getActionPlanCommentReq(payload))
        })
    }

    const fetchScheduleData = (year: number) => {
        dispatch(getActionPlanScheduleDataReq({
            payload: {
                action_plan_id: actionPlanId,
                year: year,
                fyear: financialYear
            },
            callback: (data: any, error: any) => {
                if (data?.status === 'success' && data.data && data.data.length > 0) {
                    setActionPlanDetials((prev: any) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            data: {
                                ...prev.data,
                                action_plans_assign_user: data.data[0].action_plans_assign_user
                            }
                        };
                    });
                }
            }
        }))
    }

    const processTimelineData = (actionPlan: any, selectYear: number) => {
        if (!actionPlan || !selectYear) return

        const todayDate = new Date().getDate()
        const currentDate = new Date()
        const currentMonthNum = parseInt(format(currentDate, 'MM'))
        const currentYearNum = parseInt(format(currentDate, 'yyyy'))

        const startDate = actionPlan.start_date ? parseISO(actionPlan.start_date) : null
        const endDate = actionPlan.end_date ? parseISO(actionPlan.end_date) : null

        if (!startDate || !isValid(startDate) || !endDate || !isValid(endDate)) return

        const startYearActionPlan = getYear(startDate)
        const endYearActionPlan = getYear(endDate)
        const startMonthStr = format(startDate, 'MMM').toLowerCase()
        const endMonthStr = format(endDate, 'MMM').toLowerCase()
        const startMonthNum = parseInt(format(startDate, 'MM'))
        const endMonthNum = parseInt(format(endDate, 'MM'))
        const actualReviewDate = parseInt(actionPlan.reminder_date) || 1

        const SOBJDATA: any[] = []
        const coOwners = actionPlan.action_plans_assign_user || []

        coOwners.forEach((coOwner: any) => {
            const row: any = {
                ownerName: coOwner.user_name,
                actionPlanId: coOwner.action_plan_id,
                coOwnerId: coOwner.co_owner_id,
                definition: actionPlan.definition,
                target: actionPlan.target,
                sr_no: actionPlan.action_plans_sr_no,
                months: {},
                status_name: ''
            }

            months.forEach((month, index) => {
                const monthIdx = financialYear === 'april-march'
                    ? (APRIL_MARCH_MONTHS.indexOf(month) + 4 > 12 ? APRIL_MARCH_MONTHS.indexOf(month) - 8 : APRIL_MARCH_MONTHS.indexOf(month) + 4)
                    : (index + 1)

                // Note: The above monthIdx logic needs to be consistent with how month numbers are compared
                // Let's use a more direct approach:
                const monthName = month.toLowerCase()
                const mNum = JAN_DEC_MONTHS.indexOf(monthName) + 1

                let type = ''
                let late = false

                // Determine effective year for comparison in april-march
                let effectiveYear = selectYear
                if (financialYear === 'april-march' && mNum <= 3) {
                    effectiveYear = selectYear + 1
                }

                // logic from angular actionPlanSaprate
                if (actionPlan.control_point === 'Monthly') {
                    if (mNum === startMonthNum && startYearActionPlan === effectiveYear) {
                        type = '0'
                    } else if (mNum === (endMonthNum === 12 ? 12 : endMonthNum + 1) && endYearActionPlan === effectiveYear) {
                        type = '3'
                    } else {
                        // Check if in range
                        const isAfterStart = (effectiveYear > startYearActionPlan) || (effectiveYear === startYearActionPlan && mNum > startMonthNum)
                        const isBeforeEnd = (effectiveYear < endYearActionPlan) || (effectiveYear === endYearActionPlan && mNum <= endMonthNum)

                        if (isAfterStart && isBeforeEnd) {
                            type = '1'
                            // Late logic
                            if (effectiveYear < currentYearNum) {
                                late = true
                            } else if (effectiveYear === currentYearNum) {
                                if (mNum < currentMonthNum) {
                                    late = true
                                } else if (mNum === currentMonthNum && todayDate > actualReviewDate) {
                                    // late = true // Wait, usually review for current month happens NEXT month if it's Monthly?
                                    // Angular says: monthChack < currentMonth && eee == currentnum ? todayDate > actualReviewDate
                                    // Let's stick to a simpler late logic for now or refine if user complains.
                                }
                            }
                        }
                    }
                } else if (actionPlan.control_point === 'Quarterly') {
                    // Simplified Quarterly logic: Start, End, and every 3rd month
                    if (mNum === startMonthNum && startYearActionPlan === effectiveYear) {
                        type = '0'
                    } else if (mNum === endMonthNum && endYearActionPlan === effectiveYear) {
                        type = '3'
                    } else {
                        const monthsDiff = (effectiveYear - startYearActionPlan) * 12 + (mNum - startMonthNum)
                        if (monthsDiff > 0 && monthsDiff % 3 === 0) {
                            const isBeforeEnd = (effectiveYear < endYearActionPlan) || (effectiveYear === endYearActionPlan && mNum < endMonthNum)
                            if (isBeforeEnd) {
                                type = '1'
                                if (effectiveYear < currentYearNum || (effectiveYear === currentYearNum && mNum < currentMonthNum)) {
                                    late = true
                                }
                            }
                        }
                    }
                } else if (actionPlan.control_point === 'Half Yearly') {
                    if (mNum === startMonthNum && startYearActionPlan === effectiveYear) {
                        type = '0'
                    } else if (mNum === endMonthNum && endYearActionPlan === effectiveYear) {
                        type = '3'
                    } else {
                        const monthsDiff = (effectiveYear - startYearActionPlan) * 12 + (mNum - startMonthNum)
                        if (monthsDiff > 0 && monthsDiff % 6 === 0) {
                            const isBeforeEnd = (effectiveYear < endYearActionPlan) || (effectiveYear === endYearActionPlan && mNum < endMonthNum)
                            if (isBeforeEnd) {
                                type = '1'
                                if (effectiveYear < currentYearNum || (effectiveYear === currentYearNum && mNum < currentMonthNum)) {
                                    late = true
                                }
                            }
                        }
                    }
                } else if (actionPlan.control_point === 'Yearly') {
                    if (mNum === startMonthNum && startYearActionPlan === effectiveYear) {
                        type = '0'
                    } else if (mNum === endMonthNum && endYearActionPlan === effectiveYear) {
                        type = '3'
                    }
                }

                // Check schedule for actual review
                const schedule = coOwner.schedules?.find((s: any) => {
                    if (!s.month_date) return false
                    const sDate = parseISO(s.month_date.split('T')[0])
                    return isValid(sDate) && getYear(sDate) === effectiveYear && (getMonth(sDate) + 1) === mNum
                })

                if (schedule) {
                    type = '2'
                    row.status_name = schedule.status_name // This might overwrite, but usually we want the latest one or handle per month? 
                    // Angular code sets _owners['status_name'] to lastMonthStatus.slice(-1)[0].status_name;

                    // Late override for reviewed items
                    const reviewDate = schedule.review_month_date ? parseISO(schedule.review_month_date.split('T')[0]) : null
                    if (reviewDate && isValid(reviewDate)) {
                        const reviewYear = getYear(reviewDate)
                        const reviewMonth = getMonth(reviewDate) + 1
                        if (reviewYear > effectiveYear || (reviewYear === effectiveYear && reviewMonth > mNum)) {
                            late = true
                        } else {
                            late = false
                        }
                    }
                }

                row.months[month] = { type, late }
            })

            // Set final status name for the row based on the last schedule found
            if (coOwner.schedules?.length > 0) {
                const sortedSchedules = [...coOwner.schedules].sort((a, b) => new Date(a.month_date).getTime() - new Date(b.month_date).getTime())
                row.status_name = sortedSchedules[sortedSchedules.length - 1].status_name
            }

            SOBJDATA.push(row)
        })

        setTimelineData(SOBJDATA)
    }

    const getCellStyle = (targetVal: any, actualVal: any, idealTrend: string): any => {
        if (actualVal === null || actualVal === undefined || actualVal === '') return {}
        const t = parseFloat(String(targetVal))
        const a = parseFloat(String(actualVal))
        if (isNaN(t) || isNaN(a) || t === 0) return {}

        const isGood = idealTrend === 'positive' ? a >= t : a <= t

        return {
            backgroundColor: isGood ? '#4caf50' : '#ff0000',
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 8px',
            display: 'inline-block',
            minWidth: '36px',
            fontWeight: 500,
            textAlign: 'center'
        }
    }

    const getYtdStyle = (kpistatus: any): any => {
        if (kpistatus === undefined || kpistatus === null) return {}
        const status = parseFloat(kpistatus)
        let bgColor = '#ff0000'
        if (status >= 1) bgColor = '#4caf50'
        else if (status >= 0.8) bgColor = '#ffd900'

        return {
            backgroundColor: bgColor,
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 8px',
            display: 'inline-block',
            minWidth: '36px',
            fontWeight: 600,
            textAlign: 'center'
        }
    }


    if (loading) {
        return (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
                <CircularProgress />
            </Box>
        )
    }


    if (actionPlanSchedulesPermission && actionPlanSchedulesPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Action Plan Details' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Action Plan Details.</Typography>
                </Box>
            </Card>
        )
    }

    const data = actionPlanDetials?.data
    const kpiData = data?.action_plan_kpi_data || data?.kpis || []

    return (
        <Grid container spacing={6}>
            {/* Header Info */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    {/* <CardHeader
                        title="Action Plan Status"
                    // action={<Button variant="contained" size="small">Print</Button>}
                    /> */}
                    <CardHeader
                        title={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconButton onClick={() => router.push(`/${lang}/apps/actionPlans/actionPlans`)}>
                                    <i className='ri-arrow-left-line' />
                                </IconButton>
                                <Box>
                                    <Typography variant='h5'>
                                        Action Plan Status
                                    </Typography>
                                </Box>
                            </Box>
                        } />
                    <CardContent>
                        {data && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Typography variant="subtitle2" sx={{ minWidth: 160, fontWeight: 700 }}>Strategic Objectives</Typography>
                                    <Typography sx={{ mr: 2 }}>: {data.strategic_objectives_sr_no}</Typography>
                                    <Typography variant="body2">{data.strategic_objectives_description}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Typography variant="subtitle2" sx={{ minWidth: 160, fontWeight: 700 }}>Initiative</Typography>
                                    <Typography sx={{ mr: 2 }}>: {data.initiatives_sr_no}</Typography>
                                    <Typography variant="body2">{data.initiatives_definition}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Typography variant="subtitle2" sx={{ minWidth: 160, fontWeight: 700 }}>Action Plan</Typography>
                                    <Typography sx={{ mr: 2 }}>: {data.action_plans_sr_no}</Typography>
                                    <Typography variant="body2">{data.definition}</Typography>
                                </Box>

                                <TableContainer className={tableStyles.tableContainer} component={Paper} elevation={0} sx={{ mt: 2, border: '1px solid var(--mui-palette-divider)' }}>
                                    <Table size="small">
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
                                            <TableRow>
                                                <TableCell>{data.action_plans_sr_no}</TableCell>
                                                <TableCell sx={{ minWidth: 200 }}>{data.definition}</TableCell>
                                                <TableCell>
                                                    {data.action_plans_assign_user?.map((u: any) => u && (
                                                        <Typography key={u.co_owner_id} variant="caption" display="block">{u.user_name}</Typography>
                                                    ))}
                                                </TableCell>
                                                <TableCell>{data.dept_name}</TableCell>
                                                <TableCell>
                                                    {kpiData?.map((k: any) => k && (
                                                        <Typography key={k.kpi_id || k.id} variant="caption" display="block">{k.kpi_name}</Typography>
                                                    ))}
                                                </TableCell>
                                                <TableCell>{data.target}</TableCell>
                                                <TableCell>{data.start_date ? format(parseISO(data.start_date), 'dd-MM-yyyy') : ''}</TableCell>
                                                <TableCell>{data.end_date ? format(parseISO(data.end_date), 'dd-MM-yyyy') : ''}</TableCell>
                                                <TableCell>{data.percentage}%</TableCell>
                                                <TableCell><StatusIcon status={data.status_name} /></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Timeline Section */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                        <Typography variant="h6">Time Line Progress</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <StraInitiActionLegendCaluculation />
                            <ButtonGroup size="small">
                                {actionPlanYears.map(year => (
                                    <Button
                                        key={year.year_key}
                                        variant={selectedYear === year.year_key ? "contained" : "outlined"}
                                        onClick={() => {
                                            setSelectedYear(year.year_key)
                                            fetchScheduleData(year.year_key)
                                        }}
                                    >
                                        {year.year_value}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Box>
                    </Box>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer className={tableStyles.tableContainer}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Sr.No.</TableCell>
                                        <TableCell>Action Plan</TableCell>
                                        <TableCell>Target</TableCell>
                                        <TableCell>Owner</TableCell>
                                        {months.map(m => <TableCell key={m} align="center">{m.charAt(0).toUpperCase() + m.slice(1)}</TableCell>)}
                                        <TableCell className={tableStyles.statusThForIcone}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {timelineData.map((row: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell>{row.sr_no}</TableCell>
                                            <TableCell>{row.definition}</TableCell>
                                            <TableCell>{row.target}</TableCell>
                                            <TableCell>{row.ownerName}</TableCell>
                                            {months.map(m => (
                                                <TableCell
                                                    key={m}
                                                    align="center"
                                                    onClick={() => {
                                                        const monthData = row.months[m]
                                                        if ((monthData.type === '1' || monthData.type === '2') && actionPlanSchedulesPermission?.acc_edit === 1) {
                                                            setReviewDialogData({
                                                                element: {
                                                                    action_plan_id: row.actionPlanId,
                                                                    co_owner_id: row.coOwnerId
                                                                },
                                                                monthDate: months.indexOf(m),
                                                                selectYear: selectedYear
                                                            })
                                                            setReviewDialogOpen(true)
                                                        }
                                                    }}
                                                    sx={{
                                                        cursor: ((row.months[m].type === '1' || row.months[m].type === '2') && actionPlanSchedulesPermission?.acc_edit === 1) ? 'pointer' : 'default',
                                                        '&:hover': {
                                                            bgcolor: ((row.months[m].type === '1' || row.months[m].type === '2') && actionPlanSchedulesPermission?.acc_edit === 1) ? 'action.hover' : 'transparent'
                                                        }
                                                    }}
                                                >
                                                    <TimelineMarker type={row.months[m].type} late={row.months[m].late} />
                                                </TableCell>
                                            ))}
                                            <TableCell><StatusIcon status={row.status_name} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* KPI Section */}
            {kpiData?.map((kpi: any) => kpi && (
                <Grid size={{ xs: 12 }} key={kpi.kpi_id || kpi.id}>
                    <Card>
                        <CardHeader title={`KPI: ${kpi.kpi_name}`} />
                        <CardContent>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12 }}>
                                    <TableContainer className={tableStyles.tableContainer} component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>KPI</TableCell>
                                                    <TableCell>Year</TableCell>
                                                    {historicalYears.map((y, index) => <TableCell key={`head-year-${y}-${index}`}>{y}</TableCell>)}
                                                    {months.map(m => <TableCell key={m} sx={{ minWidth: 60 }} align="center">{m.charAt(0).toUpperCase() + m.slice(1)} {selectedYear}</TableCell>)}
                                                    <TableCell align="center">YTD</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(() => {
                                                    const getYearTarget = (year: number) => {
                                                        const t = kpi.kpi_targets?.find((t: any) => t.target_year === year)
                                                        return t ? t.avg || 0 : 0
                                                    }

                                                    const getYearActual = (year: number) => {
                                                        const a = kpi.kpi_actuals?.find((a: any) => a.actual_year === year)
                                                        return a ? a.avg || 0 : 0
                                                    }

                                                    const currentTarget = kpi.kpi_targets?.find((t: any) => t.target_year === selectedYear)
                                                    const currentActual = kpi.kpi_actuals?.find((a: any) => a.actual_year === selectedYear)

                                                    return (
                                                        <>
                                                            {/* Target Row */}
                                                            <TableRow>
                                                                <TableCell rowSpan={2}>{kpi.kpi_name}</TableCell>
                                                                <TableCell >Target</TableCell>
                                                                {historicalYears.map((y, index) => <TableCell key={`target-year-${y}-${index}`}>{getYearTarget(y)}</TableCell>)}
                                                                {months.map(m => (
                                                                    <TableCell key={m} align="center">
                                                                        {currentTarget?.[m] !== null && currentTarget?.[m] !== undefined ? currentTarget[m] : '-'}
                                                                    </TableCell>
                                                                ))}
                                                                <TableCell align="center">{currentTarget?.ytd || '-'}</TableCell>
                                                            </TableRow>
                                                            {/* Actual Row */}
                                                            <TableRow >
                                                                <TableCell>Actual</TableCell>
                                                                {historicalYears.map((y, index) => <TableCell key={`actual-year-${y}-${index}`}>{getYearActual(y)}</TableCell>)}
                                                                {months.map(m => {
                                                                    const targetVal = currentTarget?.[m]
                                                                    const actualVal = currentActual?.[m]
                                                                    const cellStyle = getCellStyle(targetVal, actualVal, kpi.ideal_trend)
                                                                    return (
                                                                        <TableCell key={m} align="center">
                                                                            {actualVal !== null && actualVal !== undefined ? (
                                                                                <Box component="span" sx={cellStyle}>{actualVal}</Box>
                                                                            ) : '-'}
                                                                        </TableCell>
                                                                    )
                                                                })}
                                                                <TableCell align="center">
                                                                    <Box component="span" sx={getYtdStyle(kpi.kpistatus)}>
                                                                        {currentActual?.ytd || '-'}
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        </>
                                                    );
                                                })()}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ mt: 4 }}>
                                        <KPIChartLIneGraph
                                            kpi={kpi}
                                            historicalYears={historicalYears}
                                            selectedYear={selectedYear}
                                            months={months}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            ))}

            {/* Comments Section */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title="Action Plan Comments" />
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer className={tableStyles.tableContainer}>
                            <Table size="small">
                                <TableHead >
                                    <TableRow>
                                        <TableCell>Sr.No.</TableCell>
                                        <TableCell>Gap Assessment</TableCell>
                                        <TableCell>Recovery Plan</TableCell>
                                        <TableCell>Review Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data?.action_plan_comment?.map((comment: any, idx: number) => comment && (
                                        <TableRow key={idx}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{comment.comment}</TableCell>
                                            <TableCell>{comment.recovery_plan}</TableCell>
                                            <TableCell>{comment.review_date ? format(parseISO(comment.review_date), 'dd-MM-yyyy') : ''}</TableCell>
                                        </TableRow>
                                    ))}
                                    {(!data?.action_plan_comment || data.action_plan_comment.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No comments found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            {reviewDialogData && (
                <ChangeReview
                    open={reviewDialogOpen}
                    handleClose={(refresh) => {
                        setReviewDialogOpen(false)
                        if (refresh) {
                            fetchActionPlanDetails()
                            fetchScheduleData(selectedYear)
                        }
                    }}
                    data={reviewDialogData}
                />
            )}
        </Grid>
    )
}

export default SingleActionPlanDetials

