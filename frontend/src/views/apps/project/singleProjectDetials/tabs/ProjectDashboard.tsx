'use client'

import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'

// Third Party Imports
import { format, differenceInDays, intervalToDuration } from 'date-fns'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import PieChart from '@/components/common/chart/PieChart'

// Slice Imports
import { getProjectViewGraphRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'



const StatusBadge = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'bgColor'
})<{ bgColor: string }>(({ bgColor }) => ({
    backgroundColor: bgColor,
    color: '#fff',
    borderRadius: '50px',
    padding: '2px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    minWidth: '40px',
    height: '20px'
}))

const ProjectDashboard = ({ projectData, onDownload, hideDownload }: { projectData: any, onDownload?: () => void, hideDownload?: boolean }) => {


    const { projectId } = useParams()
    const dispatch = useDispatch()
    const [graphData, setGraphData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (projectId) {

            setLoading(true)
            dispatch(getProjectViewGraphRequest({
                payload: { project_id: projectId },
                callback: (res: any) => {
                    setLoading(false)
                    if (res?.status === 'success') {
                        setGraphData(res.data)
                    }
                }
            }))
        }
    }, [projectId, dispatch])

    const projectInfo = useMemo(() => projectData?.projectData?.[0] || {}, [projectData])

    const leader = useMemo(() => projectData?.project_member_data?.find((m: any) => m.project_leader === 1)?.name || '-', [projectData])
    const coLeader = useMemo(() => projectData?.project_member_data?.find((m: any) => m.project_leader === 2)?.name || '-', [projectData])

    const formatDateDifference = (start: Date, end: Date) => {
        if (end < start) return null
        const duration = intervalToDuration({ start, end })
        const years = duration.years || 0
        const months = duration.months || 0
        const days = duration.days || 0

        const result = []
        if (years > 0) result.push(`${years} ${years > 1 ? 'Years' : 'Year'}`)
        if (months > 0) result.push(`${months} ${months > 1 ? 'Months' : 'Month'}`)
        if (days > 0) result.push(`${days} ${days > 1 ? 'Days' : 'Day'}`)

        return result.length > 0 ? result.join(' ') : '0 Days'
    }

    const projectDuration = useMemo(() => {
        if (!projectInfo?.start_date || !projectInfo?.end_date) return '-'
        const start = new Date(projectInfo.start_date)
        const end = new Date(projectInfo.end_date)
        return formatDateDifference(start, end) || '0 Days'
    }, [projectInfo])

    const timeLeft = useMemo(() => {
        if (!projectInfo?.end_date) return '-'
        const end = new Date(projectInfo.end_date)
        const now = new Date()
        if (end < now) return 'Expired'
        return formatDateDifference(now, end) || '0 Days'
    }, [projectInfo])

    // Chart Data for Deliverables
    const deliverableSeries = useMemo(() => [
        graphData?.projectDeliverable?.reduce((a: any, b: any) => a + (b.Green || 0), 0) || 0,
        graphData?.projectDeliverable?.reduce((a: any, b: any) => a + (b.Yellow || 0), 0) || 0,
        graphData?.projectDeliverable?.reduce((a: any, b: any) => a + (b.Red || 0), 0) || 0
    ], [graphData])

    const deliverableLabels = ['Green', 'Yellow', 'Red']
    const deliverableColors = ['#4caf50', '#FFD933', '#f44336']

    // Chart Data for Issues
    const issueSeries = useMemo(() => [
        graphData?.issueRemarkGraph?.Closed?.slice(-1)[0] || 0,
        graphData?.issueRemarkGraph?.Open?.slice(-1)[0] || 0,
        graphData?.issueRemarkGraph?.Delayed?.slice(-1)[0] || 0,
        graphData?.issueRemarkGraph?.Closed_With_Delay?.slice(-1)[0] || 0,
        graphData?.issueRemarkGraph?.On_Hold?.slice(-1)[0] || 0
    ], [graphData])

    const issueLabels = ['Closed', 'Open', 'Delayed', 'Closed with Delay', 'On Hold']
    const issueColors = ['#4caf50', '#FFD933', '#ef5350', '#a9b7b6', '#039cfd']

    if (loading) return <Box className='flex justify-center p-10'><CircularProgress /></Box>

    return (
        <Grid container spacing={6}>
            {/* Project Summary Cards */}
            <Grid size={{ xs: 12, md: 2 }}>
                <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                    <Avatar
                        src={projectInfo?.file_name || '/images/avatars/1.png'}
                        sx={{ width: 120, height: 120 }}
                        variant='rounded'
                    />
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title='Project Details' />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Project Leader:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{leader}</Typography></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Co-Leader:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{coLeader}</Typography></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Start Date:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{projectInfo?.start_date || '-'}</Typography></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Finish Date:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{projectInfo?.end_date || '-'}</Typography></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Duration:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{projectDuration}</Typography></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Time left:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{timeLeft}</Typography></Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title='Status' />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Report Date:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{format(new Date(), 'yyyy-MM-dd')}</Typography></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Current Milestone:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{projectData?.project_milestone_data?.[0]?.milestone_name || '-'}</Typography></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Next Milestone:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{projectData?.project_milestone_data?.[1]?.milestone_name || '-'}</Typography></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Timeline Status:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><i className='ri-checkbox-circle-fill text-success' /></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Deliverable Status:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><i className='ri-error-warning-fill text-warning' /></Grid>

                            <Grid size={{ xs: 5 }}><Typography variant='body2' fontWeight='bold'>Budget:</Typography></Grid>
                            <Grid size={{ xs: 7 }}><Typography variant='body2'>{projectInfo?.project_cost || '0'}</Typography></Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Milestone Status Table */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title='Milestone Status' />
                    <TableContainer>
                        <Table className={tableStyles.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Sr.No.</TableCell>
                                    <TableCell>Milestone Name</TableCell>
                                    <TableCell>Target Date</TableCell>
                                    <TableCell>Actual Date</TableCell>
                                    <TableCell>Symbol</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Comments</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projectData?.project_milestone_data?.length > 0 ? (
                                    projectData.project_milestone_data.map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.milestone_name}</TableCell>
                                            <TableCell>{row.mile_stone_date}</TableCell>
                                            <TableCell>{row.actual_date || '-'}</TableCell>
                                            <TableCell><i className={row.symbol || 'ri-flag-line'} /></TableCell>
                                            <TableCell>
                                                <div className='flex justify-center'>
                                                    {row.milestone_status === 'Green' ? (
                                                        <div className='flex justify-center'>
                                                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                        </div>
                                                    ) : row.milestone_status === 'Yellow' ? (
                                                        <div className='flex justify-center'>
                                                            <Box sx={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: '19px solid #ffd900' }} />
                                                        </div>
                                                    ) : row.milestone_status === 'Red' ? (
                                                        <div className='flex justify-center'>
                                                            <Box sx={{ width: 18, height: 18, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                                                                <i className='ri-close-line' style={{ fontSize: '16px', fontWeight: 'bold' }} />
                                                            </Box>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>{row.comment || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={7} align='center'>No milestones found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>

            {/* Deliverables and Issues section */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                    {/* <CardHeader title='Project Deliverables' /> */}
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                            <PieChart
                                title='Project Deliverables'
                                series={deliverableSeries}
                                labels={deliverableLabels}
                                colors={deliverableColors}
                                height={220}
                            />
                        </Box>
                        <TableContainer>
                            <Table size='small' className={tableStyles.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Department</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>
                                            <div className='flex justify-center'>
                                                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex justify-center'>
                                                <Box sx={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: '19px solid #ffd900' }} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ width: 18, height: 18, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                                                <i className='ri-close-line' style={{ fontSize: '16px', fontWeight: 'bold' }} />
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {graphData?.projectDeliverable?.map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.dept_name}</TableCell>
                                            <TableCell>{row.total}</TableCell>
                                            <TableCell>
                                                <div className='flex justify-center'>
                                                    <StatusBadge bgColor='#4caf50'> {row.Green || 0}</StatusBadge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex justify-center'>
                                                    <StatusBadge bgColor='#ffd900'> {row.Yellow || 0}</StatusBadge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex justify-center'>
                                                    <StatusBadge bgColor='#f44336'> {row.Red || 0}</StatusBadge>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                    {/* <CardHeader title='Project Issues' /> */}
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                            <PieChart
                                title='Project Issues'
                                series={issueSeries}
                                labels={issueLabels}
                                colors={issueColors}
                                height={220}
                            />
                        </Box>
                        <TableContainer>
                            <Table size='small' className={tableStyles.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Priority</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>
                                            <div className='flex justify-center'>
                                                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex justify-center'>
                                                <Box sx={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: '19px solid #ffd900' }} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex justify-center'>
                                                <Box sx={{ width: 18, height: 18, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                                                    <i className='ri-close-line' style={{ fontSize: '16px', fontWeight: 'bold' }} />
                                                </Box>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex justify-center'>
                                                <Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: '#9fa6ad' }} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex justify-center'>
                                                <Box sx={{ width: 18, height: 18, border: '2px solid #7dabf5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7dabf5', fontWeight: 'bold', fontSize: '14px' }}>
                                                    H
                                                </Box>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {['high', 'medium', 'low'].map((p) => {
                                        const data = graphData?.issueRemarkGraph?.[p];
                                        if (!data) return null;
                                        return (
                                            <TableRow key={p}>
                                                <TableCell sx={{ textTransform: 'capitalize' }}>{p}</TableCell>
                                                <TableCell>{data.phtotal || data.pmtotal || data.pltotal || 0}</TableCell>
                                                <TableCell>
                                                    <div className='flex justify-center'>
                                                        <StatusBadge bgColor='#4caf50'> {data.phclosed || data.pmclosed || data.plclosed || 0}</StatusBadge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex justify-center'>
                                                        <StatusBadge bgColor='#ffd900'> {data.phopen || data.pmopen || data.plopen || 0}</StatusBadge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex justify-center'>
                                                        <StatusBadge bgColor='#f44336'> {data.phdelayed || data.pmdelayed || data.pldelayed || 0}</StatusBadge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex justify-center'>
                                                        <StatusBadge bgColor='#9fa6ad'> {data.phcwd || data.pmcwd || data.plcwd || 0}</StatusBadge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex justify-center'>
                                                        <StatusBadge bgColor='#7dabf5'> {data.phhold || data.pmhold || data.plhold || 0}</StatusBadge>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>


            {/* <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title='Project Deviations' />
                    <TableContainer>
                        <Table size='small' className={tableStyles.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Sr.No.</TableCell>
                                    <TableCell>Deviation Name</TableCell>
                                    <TableCell>Criticality</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projectData?.projectDeviation?.length > 0 ? (
                                    projectData.projectDeviation.map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.deviation_name}</TableCell>
                                            <TableCell>{row.deviation_risk_name || '-'}</TableCell>
                                            <TableCell>
                                                <Box sx={{
                                                    width: 15, height: 15, borderRadius: '50%',
                                                    bgcolor: row.deviation_risk_name === 'Low' ? 'success.main' : row.deviation_risk_name === 'Medium' ? 'warning.main' : 'error.main'
                                                }} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} align='center'>No deviations found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>

       
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title='Project Risk' />
                    <TableContainer>
                        <Table size='small' className={tableStyles.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Sr.No.</TableCell>
                                    <TableCell>Risk Item</TableCell>
                                    <TableCell>Level</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projectData?.RiskAccessmentLog?.length > 0 ? (
                                    projectData.RiskAccessmentLog.map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.risk_item}</TableCell>
                                            <TableCell>{row.risk_level_name || '-'}</TableCell>
                                            <TableCell>
                                                <Box sx={{
                                                    width: 15, height: 15, borderRadius: '50%',
                                                    bgcolor: row.risk_level_name === 'Low' ? 'success.main' : row.risk_level_name === 'Medium' ? 'warning.main' : 'error.main'
                                                }} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} align='center'>No risks found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid> */}

            {/* <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title='Overall Final Comment' />
                    <CardContent>
                        <Box sx={{ minHeight: 60, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                            {projectInfo?.comment ? (
                                <div dangerouslySetInnerHTML={{ __html: projectInfo.comment }} />
                            ) : (
                                <Typography variant='body2' color='text.secondary'>No final comments available</Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid> */}
        </Grid>
    )
}

export default ProjectDashboard
