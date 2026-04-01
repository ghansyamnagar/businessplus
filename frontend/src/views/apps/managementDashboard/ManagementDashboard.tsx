'use client'

import { useEffect, useState, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'
import { getPerformanceKpiDashboardRequest, getBusinessPlansListRequest } from '@/redux-store/slices/master/master.slice'
import tableStyles from '@core/styles/table.module.css'

const ManagementDashboard = () => {
    const { data: session } = useSession()
    const dispatch = useDispatch()
    const [businessPlans, setBusinessPlans] = useState<any>(null)
    const [leadKpis, setLeadKpis] = useState<any[]>([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [loading, setLoading] = useState(false)

    const selectedYear = Number(session?.user?.userSelectedYear) || new Date().getFullYear()

    useEffect(() => {
        setLoading(true)
        let plansDone = false
        let kpisDone = false

        const checkDone = () => {
            if (plansDone && kpisDone) setLoading(false)
        }

        dispatch(getBusinessPlansListRequest({
            payload: {},
            callback: (data: any) => {
                plansDone = true
                if (data?.status_code === 200) {
                    setBusinessPlans(data.data)
                }
                checkDone()
            }
        }))

        dispatch(getPerformanceKpiDashboardRequest({
            payload: {},
            callback: (data: any) => {
                kpisDone = true
                if (data?.status_code === 200) {
                    setLeadKpis(data.data)
                }
                checkDone()
            }
        }))
        setPage(0)
    }, [dispatch, selectedYear])

    const getColorForStatus = (kpistatus: any, idealTrend: string) => {
        if (kpistatus === null || kpistatus === undefined || Math.abs(kpistatus) < 0.000001) return '#f3f3f3'

        const status = parseFloat(kpistatus)

        if (idealTrend === 'positive') {
            if (status >= 1.0) return '#4caf50' // Green
            if (status >= 0.9) return '#FFD933' // Yellow
            return '#f40000' // Red
        } else {
            if (status >= 1.1) return '#f40000' // Red
            if (status > 1.0) return '#FFD933' // Yellow
            return '#4caf50' // Green
        }
    }

    const getTargetData = (kpi: any, year: number) => {
        return kpi.kpi_targets?.find((t: any) => Number(t.target_year) === year)
    }

    const getActualData = (kpi: any, year: number) => {
        return kpi.kpi_actuals?.find((a: any) => Number(a.actual_year) === year)
    }

    const calculateDiff = (current: any, last: any) => {
        const currVal = parseFloat(current) || 0
        const lastVal = parseFloat(last) || 0

        if (lastVal === 0) {
            return (currVal - lastVal).toFixed(2)
        }
        const diff = ((currVal - lastVal) * 100) / lastVal
        return diff.toFixed(2)
    }

    const paginatedKpis = leadKpis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const renderTopCards = () => {
        const cards = [
            { title: 'Vision', content: businessPlans?.vision },
            { title: 'Mission', content: businessPlans?.mission },
            { title: 'Values', content: businessPlans?.values },
            { title: "CEO'S Msg", content: businessPlans?.message_of_ceo }
        ]

        return (
            <Grid container spacing={6}>
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card elevation={4} className={tableStyles.statusCard}>
                            <Box className={tableStyles.statusCardHeader}>
                                {card.title}
                            </Box>
                            <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{
                                        textAlign: 'left',
                                        fontSize: '0.90rem',
                                        lineHeight: 1.6,
                                        fontStyle: card.title === "CEO'S Msg" ? 'italic' : 'normal'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: card.content || '' }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        )
    }

    return (
        <Box sx={{ p: { xs: 4, md: 8 } }}>
            {renderTopCards()}

            <Card elevation={4} className={tableStyles.highlightsCard}>
                <Box className={tableStyles.cardHeaderTitle}>
                    Highlights
                </Box>
                <CardContent sx={{ p: 6 }}>
                    <Typography
                        variant="body1"
                        sx={{ textAlign: 'left', color: 'text.secondary', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        dangerouslySetInnerHTML={{ __html: businessPlans?.highlights || 'No highlights available' }}
                    />
                </CardContent>
            </Card>

            <Card elevation={4} sx={{ mt: 10, borderRadius: '8px', overflow: 'hidden' }}>
                <Box className={tableStyles.cardHeaderTitle} >
                    Lead KPIs
                </Box>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className={tableStyles.dashboardTable}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2}>S. No.</th>
                                        <th rowSpan={2} style={{ minWidth: '200px' }}>Lead KPI</th>
                                        <th rowSpan={2}>Year</th>
                                        <th>{selectedYear - 1}</th>
                                        <th>{selectedYear - 2}</th>
                                        <th>{selectedYear - 3}</th>
                                        <th>{selectedYear - 4}</th>
                                        <th>{selectedYear} YTD</th>
                                        <th>Current Month</th>
                                        <th>Last Year Month</th>
                                        <th>% Change</th>
                                        <th>CAGR %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedKpis.length > 0 ? paginatedKpis.map((kpi, index) => {
                                        const targetCurrent = getTargetData(kpi, selectedYear)
                                        const actualCurrent = getActualData(kpi, selectedYear)
                                        const targetLast = getTargetData(kpi, selectedYear - 1)
                                        const actualLast = getActualData(kpi, selectedYear - 1)

                                        const targetDiff = calculateDiff(targetCurrent?.current_month_target || 0, targetLast?.current_month_target || 0)
                                        const actualDiff = calculateDiff(actualCurrent?.current_month_actual || 0, actualLast?.current_month_actual || 0)

                                        return (
                                            <Fragment key={kpi.kpi_id}>
                                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                                    <td rowSpan={2}>{(page * rowsPerPage) + index + 1}</td>
                                                    <td rowSpan={2} className={tableStyles.kpiNameCell}>{kpi.kpi_name}</td>
                                                    <td style={{ color: 'text.secondary' }}>Target</td>
                                                    <td>{getTargetData(kpi, selectedYear - 1)?.avg || 0}</td>
                                                    <td>{getTargetData(kpi, selectedYear - 2)?.avg || 0}</td>
                                                    <td>{getTargetData(kpi, selectedYear - 3)?.avg || 0}</td>
                                                    <td>{getTargetData(kpi, selectedYear - 4)?.avg || 0}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{targetCurrent?.ytd || 0}</td>
                                                    <td>{targetCurrent?.current_month_target || 0}</td>
                                                    <td>{targetLast?.current_month_target || 0}</td>
                                                    <td style={{ fontWeight: 500 }}>{targetDiff}%</td>
                                                    <td>-</td>
                                                </tr>
                                                <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #ddd' }}>
                                                    <td style={{ color: 'text.secondary' }}>Actual</td>
                                                    <td>{getActualData(kpi, selectedYear - 1)?.avg || 0}</td>
                                                    <td>{getActualData(kpi, selectedYear - 2)?.avg || 0}</td>
                                                    <td>{getActualData(kpi, selectedYear - 3)?.avg || 0}</td>
                                                    <td>{getActualData(kpi, selectedYear - 4)?.avg || 0}</td>
                                                    <td>
                                                        <Box sx={{
                                                            minWidth: '45px',
                                                            height: '24px',
                                                            borderRadius: '12px',
                                                            bgcolor: getColorForStatus(kpi.kpistatus, kpi.ideal_trend),
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            px: 2,
                                                            color: (getColorForStatus(kpi.kpistatus, kpi.ideal_trend) === '#f3f3f3' || getColorForStatus(kpi.kpistatus, kpi.ideal_trend) === '#FFD933') ? 'text.primary' : '#fff',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                        }}>
                                                            {actualCurrent?.ytd || 0}
                                                        </Box>
                                                    </td>
                                                    <td>{actualCurrent?.current_month_actual || 0}</td>
                                                    <td>{actualLast?.current_month_actual || 0}</td>
                                                    <td>{actualDiff}%</td>
                                                    <td>-</td>
                                                </tr>
                                            </Fragment>
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                                No KPI data available for the selected period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component='div'
                            count={leadKpis.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                )}
            </Card>
        </Box>
    )
}

export default ManagementDashboard
