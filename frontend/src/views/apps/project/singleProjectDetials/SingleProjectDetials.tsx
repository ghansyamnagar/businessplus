'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import type { SyntheticEvent } from 'react'
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
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import ButtonGroup from '@mui/material/ButtonGroup'
import { format, parseISO, getYear, getMonth, isValid } from 'date-fns'
import { useSelector } from 'react-redux'
import type { ApexOptions } from 'apexcharts'
import { toast } from 'react-toastify'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import IconButton from '@mui/material/IconButton'
// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import ProjectDashboard from './tabs/ProjectDashboard'
import ProjectCharter from './tabs/ProjectCharter'
import ProjectMilestone from './tabs/ProjectMilestone'
import MajorActivityPlan from './tabs/MajorActivityPlan'
import SubMajorActivityPlan from './tabs/SubMajorActivityPlan'
import ResourcePlanning from './tabs/ResourcePlanning'
import RiskAccessmentLog from './tabs/RiskAccessmentLog'
import IssueTracker from './tabs/IssueTracker'
import GovernanceStructure from './tabs/GovernanceStructure'
import ProjectDeviations from './tabs/ProjectDeviations'
import ProjectDeliverables from './tabs/ProjectDeliverables'
import { usePDF } from "react-to-pdf";

// Style Imports
import tableStyles from '@core/styles/table.module.css'

import { viewSingleProjectRequest } from '@/redux-store/slices/project/project.slice'


const SingleProjectDetials = () => {
    const { projectId, lang } = useParams()
    const router = useRouter()
    const dispatch = useDispatch()
    const [projectDetialsData, setProjectDetialsData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('project-dashboard')
    const { toPDF, targetRef } = usePDF({
        filename: "ProjectDetails_Dashboard.pdf",
    });

    const handleChange = (event: SyntheticEvent, value: string) => {
        setActiveTab(value)
    }

    const TablePlaceholder = ({ title }: { title: string }) => (
        <Card>
            <CardHeader title={title} />
            <TableContainer>
                <Table className={tableStyles.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Sr. No</TableCell>
                            <TableCell>Details</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No data available for {title}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    )

    console.log('Project ID:', projectId)

    const fetchProjectDetails = () => {
        if (projectId) {
            setLoading(true)
            dispatch(viewSingleProjectRequest({
                payload: { project_id: projectId },
                callback: (res: any) => {
                    setLoading(false)
                    if (res?.status === 'success') {
                        console.log('Project details response:', res)
                        setProjectDetialsData(res.data)
                    } else {
                        toast.error(res?.message || 'Failed to fetch project details')
                    }
                }
            }))
        }
    }

    useEffect(() => {
        fetchProjectDetails()
    }, [projectId, dispatch])

    if (loading) {
        return (
            <Box className='flex justify-center items-center min-bs-[200px]'>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <>
            <Grid container spacing={6}>
                {projectDetialsData ? (
                    <Grid size={{ xs: 12 }}>
                        <TabContext value={activeTab}>
                            <Grid container spacing={6}>
                                <Grid size={{ xs: 12 }}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <IconButton onClick={() => router.push(`/${lang}/apps/project/projectTracker`)}>
                                                        <i className='ri-arrow-left-line' />
                                                    </IconButton>
                                                    <Typography variant='h5'>Project Details</Typography>
                                                </Box>
                                                {activeTab === 'project-dashboard' && (
                                                    <IconButton
                                                        onClick={() => {
                                                            setTimeout(() => {
                                                                toPDF()
                                                            }, 500)
                                                        }}
                                                        style={{ color: '#1976d2', fontSize: '20px' }}
                                                    >
                                                        <i className='ri-download-2-line' />
                                                    </IconButton>
                                                )}
                                            </Box>
                                            <CustomTabList onChange={handleChange} variant='scrollable' pill='true' scrollButtons='auto'>
                                                <Tab icon={<i className='ri-dashboard-line' />} value='project-dashboard' label='Project Dashboard' iconPosition='start' />
                                                <Tab icon={<i className='ri-file-list-3-line' />} value='project-charter' label='Project Charter' iconPosition='start' />
                                                {/* <Tab icon={<i className='ri-time-line' />} value='master-time-chart' label='Master Time chart' iconPosition='start' /> */}
                                                <Tab icon={<i className='ri-flag-line' />} value='project-milestone' label='Project Milestone' iconPosition='start' />
                                                <Tab icon={<i className='ri-calendar-todo-line' />} value='major-activity-plan' label='Major Activity Plan' iconPosition='start' />
                                                <Tab icon={<i className='ri-calendar-todo-fill' />} value='sub-activity-plan' label='Sub Activity Plan' iconPosition='start' />
                                                <Tab icon={<i className='ri-team-line' />} value='resource-planning' label='Resource Planning' iconPosition='start' />
                                                <Tab icon={<i className='ri-error-warning-line' />} value='risk-accessment-log' label='Risk Accessment Log' iconPosition='start' />
                                                <Tab icon={<i className='ri-bug-line' />} value='issue-tracker' label='Issue Tracker' iconPosition='start' />
                                                <Tab icon={<i className='ri-box-3-line' />} value='project-deliverables' label='Project Deliverables' iconPosition='start' />
                                                <Tab icon={<i className='ri-government-line' />} value='governance-structure' label='Governance Structure' iconPosition='start' />
                                                <Tab icon={<i className='ri-shuffle-line' />} value='project-deviations' label='Project Deviations' iconPosition='start' />
                                                {/* <Tab icon={<i className='ri-rss-line' />} value='project-feeds' label='Project Feeds' iconPosition='start' /> */}
                                            </CustomTabList>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TabPanel value='project-dashboard' className='p-0'>
                                        <ProjectDashboard projectData={projectDetialsData} onDownload={toPDF} />
                                    </TabPanel>
                                    <TabPanel value='project-charter' className='p-0'>
                                        <ProjectCharter projectData={projectDetialsData} />
                                    </TabPanel>
                                    {/* <TabPanel value='master-time-chart' className='p-0'>
                                    <TablePlaceholder title="Master Time chart" />
                                </TabPanel> */}
                                    <TabPanel value='project-milestone' className='p-0'>
                                        <ProjectMilestone projectData={projectDetialsData} refreshData={fetchProjectDetails} />
                                    </TabPanel>
                                    <TabPanel value='major-activity-plan' className='p-0'>
                                        <MajorActivityPlan projectData={projectDetialsData} refreshData={fetchProjectDetails} />
                                    </TabPanel>
                                    <TabPanel value='sub-activity-plan' className='p-0'>
                                        <SubMajorActivityPlan projectData={projectDetialsData} refreshData={fetchProjectDetails} />
                                    </TabPanel>
                                    <TabPanel value='resource-planning' className='p-0'>
                                        <ResourcePlanning projectData={projectDetialsData} refreshData={fetchProjectDetails} />
                                    </TabPanel>

                                    <TabPanel value='risk-accessment-log' className='p-0'>
                                        <RiskAccessmentLog projectData={projectDetialsData} refreshData={fetchProjectDetails} />
                                    </TabPanel>
                                    <TabPanel value='issue-tracker' className='p-0'>
                                        <IssueTracker projectData={projectDetialsData} refreshData={fetchProjectDetails} />
                                    </TabPanel>
                                    <TabPanel value='project-deliverables' className='p-0'>
                                        <ProjectDeliverables projectData={projectDetialsData} refreshData={fetchProjectDetails} />
                                    </TabPanel>
                                    <TabPanel value='governance-structure' className='p-0'>
                                        <GovernanceStructure projectData={projectDetialsData} refreshData={fetchProjectDetails} />
                                    </TabPanel>
                                    <TabPanel value='project-deviations' className='p-0'>
                                        <ProjectDeviations projectData={projectDetialsData} refreshData={fetchProjectDetails} />
                                    </TabPanel>
                                    <TabPanel value='project-feeds' className='p-0'>
                                        <TablePlaceholder title="Project Feeds" />
                                    </TabPanel>
                                </Grid>
                            </Grid>
                        </TabContext>
                    </Grid>
                ) : (
                    <Grid size={{ xs: 12 }}>
                        <Typography>No data found or loading...</Typography>
                    </Grid>
                )}
            </Grid>
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <div ref={targetRef} style={{ padding: "20px", width: "900px", background: "#fff" }}>

                    <h2 style={{ textAlign: "center" }}>Project Dashboard</h2>

                    <ProjectDashboard
                        projectData={projectDetialsData}
                        hideDownload={true}
                    />

                </div>
            </div>
        </>
    )
}

export default SingleProjectDetials

