'use client'

import { useMemo, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Collapse from '@mui/material/Collapse'

// Component Imports
import AgendaGovernance from './Governance/AgendaGovernance'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Third Party Imports
import { intervalToDuration } from 'date-fns'

const ProjectCharter = ({ projectData }: { projectData: any }) => {
    const projectInfo = useMemo(() => projectData?.projectData?.[0] || {}, [projectData])
    const members = useMemo(() => projectData?.project_member_data || [], [projectData])

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

    // States for Agenda Popup
    const [openAgenda, setOpenAgenda] = useState(false)
    const [selectedRow, setSelectedRow] = useState<any>(null)

    const handleOpenAgenda = (row: any) => {
        setSelectedRow(row)
        setOpenAgenda(true)
    }

    return (
        <Grid container spacing={6}>
            {/* Project Logo/Avatar */}
            <Grid size={{ xs: 12, md: 2 }}>
                <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                    <Avatar
                        src={projectInfo?.file_name || '/images/avatars/1.png'}
                        sx={{ width: 120, height: 120 }}
                        variant='rounded'
                    />
                </Card>
            </Grid>

            {/* Project Details */}
            <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title='Project Details' />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 5 }}>
                                <Typography variant='body2' fontWeight='bold'>Lead Department:</Typography>
                            </Grid>
                            <Grid size={{ xs: 7 }}>
                                <Typography variant='body2'>{projectInfo?.dept_name || '-'}</Typography>
                            </Grid>

                            <Grid size={{ xs: 5 }}>
                                <Typography variant='body2' fontWeight='bold'>Start Date:</Typography>
                            </Grid>
                            <Grid size={{ xs: 7 }}>
                                <Typography variant='body2'>{projectInfo?.start_date || '-'}</Typography>
                            </Grid>

                            <Grid size={{ xs: 5 }}>
                                <Typography variant='body2' fontWeight='bold'>Finish Date:</Typography>
                            </Grid>
                            <Grid size={{ xs: 7 }}>
                                <Typography variant='body2'>{projectInfo?.end_date || '-'}</Typography>
                            </Grid>

                            <Grid size={{ xs: 5 }}>
                                <Typography variant='body2' fontWeight='bold'>Duration:</Typography>
                            </Grid>
                            <Grid size={{ xs: 7 }}>
                                <Typography variant='body2'>{projectDuration}</Typography>
                            </Grid>

                            <Grid size={{ xs: 5 }}>
                                <Typography variant='body2' fontWeight='bold'>Budget:</Typography>
                            </Grid>
                            <Grid size={{ xs: 7 }}>
                                <Typography variant='body2'>{projectInfo?.project_cost || '0'}</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Project Team */}
            <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ height: '100%' }}>
                    <CardHeader title='Project Team' />
                    <CardContent sx={{ maxHeight: 230, overflow: 'auto' }}>
                        <Grid container spacing={2}>
                            {members.length > 0 ? (
                                members.map((member: any, index: number) => (
                                    <Grid key={index} size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={member.avatar} sx={{ width: 30, height: 30 }} />
                                        <Box>
                                            <Typography variant='body2' fontWeight='bold'>{member.name}</Typography>
                                            <Typography variant='caption'>{member.project_leader === 1 ? 'Project Leader' : member.project_leader === 2 ? 'Co-Leader' : 'Member'}</Typography>
                                        </Box>
                                    </Grid>
                                ))
                            ) : (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant='body2'>No team members assigned</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Key Objective & Mission */}
            <Grid size={{ xs: 6 }}>
                <Card>
                    <CardHeader title='Key Objective' />
                    <CardContent>
                        <Typography variant='body2'>
                            {projectInfo?.key_objective || 'No key objectives defined'}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 6 }}>
                <Card>
                    <CardHeader title='Mission' />
                    <CardContent>
                        <Typography variant='body2'>
                            {projectInfo?.project_mission || 'No mission statement defined'}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Major Milestone Status */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title='Major milestone' />
                    <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <Table size='small' stickyHeader className={tableStyles.table}>
                            <TableHead>
                                <TableRow sx={{ '& th': { bgcolor: 'action.hover !important' } }}>
                                    <TableCell>Sr.No.</TableCell>
                                    <TableCell>Milestone Name</TableCell>
                                    <TableCell>Symbol</TableCell>
                                    <TableCell>Target Date</TableCell>
                                    <TableCell>Actual Date</TableCell>
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
                                            <TableCell>Symbol</TableCell>
                                            <TableCell>{row.mile_stone_date}</TableCell>
                                            <TableCell>{row.actual_date || '-'}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    {row.milestone_status === 'Green' ? (
                                                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                    ) : row.milestone_status === 'Yellow' ? (
                                                        <Box sx={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '14px solid #ffd900' }} />
                                                    ) : row.milestone_status === 'Red' ? (
                                                        <Box sx={{ width: 14, height: 14, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                                                            <i className='ri-close-line' style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                                        </Box>
                                                    ) : '-'}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{row.comment || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ textAlign: 'center' }}>No milestones found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>

            {/* Major Activity Plan */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title='Major activity plan' />
                    <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <Table size='small' stickyHeader className={tableStyles.table}>
                            <TableHead>
                                <TableRow sx={{ '& th': { bgcolor: 'action.hover !important' } }}>
                                    <TableCell>Sr.No.</TableCell>
                                    <TableCell>Activity</TableCell>
                                    <TableCell>Linked milestone</TableCell>
                                    <TableCell>Start</TableCell>
                                    <TableCell>Finish</TableCell>
                                    <TableCell>Preceeding activity</TableCell>
                                    <TableCell>Next activity</TableCell>
                                    <TableCell>Responsibility</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projectData?.project_majr_activity_data?.length > 0 ? (
                                    projectData.project_majr_activity_data.map((row: any, index: number) => (
                                        <ActivityRow key={index} row={row} index={index} />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} sx={{ textAlign: 'center' }}>No major activities found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>

            {/* Governance Structure */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title='Governance Structure' />
                    <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <Table size='small' stickyHeader className={tableStyles.table}>
                            <TableHead>
                                <TableRow sx={{ '& th': { bgcolor: 'action.hover !important' } }}>
                                    <TableCell>Sr.No.</TableCell>
                                    <TableCell>Meeting Name</TableCell>
                                    <TableCell>Chair Person</TableCell>
                                    <TableCell>Co-chair Person</TableCell>
                                    <TableCell>Member</TableCell>
                                    <TableCell>Frequency</TableCell>
                                    <TableCell>Meeting days</TableCell>
                                    <TableCell>Meeting duration</TableCell>
                                    <TableCell>Venue</TableCell>
                                    <TableCell>Agenda</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projectData?.project_goverances?.length > 0 ? (
                                    projectData.project_goverances.map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.meeting_name}</TableCell>
                                            <TableCell>{row.chair_person_name}</TableCell>
                                            <TableCell>{row.co_chair_person_name}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'normal', minWidth: 200 }}>
                                                {row.gov_members?.map((m: any) => m.member_name).join(', ')}
                                            </TableCell>
                                            <TableCell>{row.gov_frequency}</TableCell>
                                            <TableCell>{row.meeting_day}</TableCell>
                                            <TableCell>{row.gov_duration}</TableCell>
                                            <TableCell>{row.gov_venue}</TableCell>
                                            <TableCell>
                                                <Tooltip title={row.agenda || 'No Agenda'}>
                                                    <IconButton size='small' onClick={() => handleOpenAgenda(row)}>
                                                        <i className='ri-file-list-2-line text-textSecondary' />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} sx={{ textAlign: 'center' }}>No governance structure found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>

            {/* Budget Tracking */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title='Budget tracking' />
                    <CardContent sx={{ pb: 0 }}>
                        <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 4 }}>
                            Total project cost:- {projectInfo?.project_cost || '0'}
                        </Typography>
                    </CardContent>
                    <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <Table size='small' stickyHeader className={tableStyles.table}>
                            <TableHead>
                                <TableRow sx={{ '& th': { bgcolor: 'action.hover !important' } }}>
                                    <TableCell>Sr.No.</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projectData?.project_cost_data?.length > 0 ? (
                                    projectData.project_cost_data.map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.dept_name}</TableCell>
                                            <TableCell>{row.cost_value}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} sx={{ textAlign: 'center' }}>No budget data found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>

            {openAgenda && (
                <AgendaGovernance
                    open={openAgenda}
                    handleClose={() => {
                        setOpenAgenda(false)
                        setSelectedRow(null)
                    }}
                    data={selectedRow}
                />
            )}
        </Grid>
    )
}

export default ProjectCharter

const ActivityRow = ({ row, index }: { row: any, index: number }) => {
    const [open, setOpen] = useState(false)
    const hasSubActivities = row.project_sub_activity_data?.length > 0

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset !important' }, bgcolor: open ? 'action.hover' : 'inherit' }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.activity_name}</TableCell>
                <TableCell>{row.milestone_name}</TableCell>
                <TableCell>{row.activity_start_date}</TableCell>
                <TableCell>{row.activity_end_date}</TableCell>
                <TableCell>{row.preceeding_activity_name || '-'}</TableCell>
                <TableCell>{row.next_activity_name || '-'}</TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {row.responsibility_person}
                        {hasSubActivities && (
                            <IconButton size='small' onClick={() => setOpen(!open)}>
                                <i className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
                            </IconButton>
                        )}
                    </Box>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={8} sx={{ py: 0, px: 10 }}>
                    <Collapse in={open} timeout='auto' unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Table size='small' className={tableStyles.table}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.selected' }}>
                                        <TableCell sx={{ minWidth: 80 }}>Sr.No.</TableCell>
                                        <TableCell>Sub activity</TableCell>
                                        <TableCell>Start</TableCell>
                                        <TableCell>Finish</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.project_sub_activity_data.map((subRow: any, subIndex: number) => (
                                        <TableRow key={subIndex}>
                                            <TableCell>{subRow.sub_activity_sr_no || `${index + 1}.${subIndex + 1}`}</TableCell>
                                            <TableCell>{subRow.sub_activity_name}</TableCell>
                                            <TableCell>{subRow.sb_actvity_strt_date}</TableCell>
                                            <TableCell>{subRow.sb_actvity_end_date}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}
