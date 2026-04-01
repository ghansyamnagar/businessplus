'use client'

import { Fragment, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

// MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import AddEditProjectDeliverables from './Deliverables/AddEditProjectDeliverables'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
import KpiMilestoneStatus from './Deliverables/KpiMilestoneStatus'

// Redux Imports
import { deleteSingleProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { CardHeader } from '@mui/material'

interface RowProps {
    row: any
    index: number
    page: number
    rowsPerPage: number
    handleEditKpi: (kpi: any) => void
    handleDeleteKpi: (kpiId: any) => void
    handleUpdateStatus: (milestone: any) => void
}

const Row = (props: RowProps) => {
    const { row, index, page, rowsPerPage, handleEditKpi, handleDeleteKpi, handleUpdateStatus } = props
    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const openMenu = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleCloseMenu = () => {
        setAnchorEl(null)
    }

    const handleEdit = () => {
        handleEditKpi(row)
        handleCloseMenu()
    }

    const handleDelete = () => {
        handleDeleteKpi(row.project_kpi_id)
        handleCloseMenu()
    }

    const getTrendIcon = (trend: string) => {
        if (trend?.toLowerCase() === 'positive') {
            return <i className='ri-arrow-up-line' style={{ color: '#4caf50', fontSize: '20px', fontWeight: 'bold' }} />
        }
        if (trend?.toLowerCase() === 'negative') {
            return <i className='ri-arrow-down-line' style={{ color: '#ff0000', fontSize: '20px', fontWeight: 'bold' }} />
        }
        return '-'
    }

    const renderStatusDisplay = (status: string) => {
        if (!status) return '-'

        if (status === 'Green') {
            return (
                <div className='flex justify-center items-center gap-2'>
                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#4caf50' }} />
                </div>
            )
        }

        if (status === 'Yellow') {
            return (
                <div className='flex justify-center items-center gap-2'>
                    <Box
                        sx={{
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: '16px solid #ffd900'
                        }}
                    />
                </div>
            )
        }

        if (status === 'Red') {
            return (
                <div className='flex justify-center items-center gap-2'>
                    <div className='border-2 border-red-500 rounded-sm  flex items-center justify-center'>
                        <i className='ri-close-line text-red-500 font-bold' style={{ fontSize: '16px' }} />
                    </div>
                </div>
            )
        }

        return <Typography variant='body2'>{status}</Typography>
    }

    const milestones = row.project_kpi_milestone_data || []

    return (
        <Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset !important' }, bgcolor: open ? 'action.hover' : 'inherit' }}>
                <TableCell>{row.project_kpi_id}</TableCell>
                <TableCell>{row.project_kpi_name}</TableCell>
                <TableCell>{row.dept_name}</TableCell>
                <TableCell>{row.uom_name}</TableCell>
                <TableCell>{row.project_kpi_def}</TableCell>
                <TableCell align='center'>
                    {getTrendIcon(row.project_kpi_trend)}
                </TableCell>
                <TableCell>{row.project_kpi_yr_targt}</TableCell>
                <TableCell>{row.project_kpi_freqency}</TableCell>
                <TableCell>{row.project_kpi_value}</TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size='small' onClick={handleClick}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <i className='ri-more-fill' />
                            </Box>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleCloseMenu}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem onClick={handleEdit}>
                                <i className='ri-edit-box-line ' />
                                Edit
                            </MenuItem>
                            <MenuItem onClick={handleDelete}>
                                <i className='ri-delete-bin-7-line ' />
                                Delete
                            </MenuItem>
                        </Menu>
                        <IconButton size='small' onClick={() => setOpen(!open)}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <i className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
                            </Box>
                        </IconButton>
                    </Box>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                    <Collapse in={open} timeout='auto' unmountOnExit>
                        <Box sx={{ margin: 2, display: 'flex', justifyContent: 'center' }}>
                            <Table size='small' aria-label='milestones' sx={{ width: '85%', border: '1px solid #e0e0e0' }}>
                                <TableHead sx={{ bgcolor: '#bdbdbd' }}>
                                    <TableRow>
                                        <TableCell>Sr.No.</TableCell>
                                        <TableCell>Project Milestone</TableCell>
                                        <TableCell>Target</TableCell>
                                        <TableCell>Actual</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Remark</TableCell>
                                        <TableCell>Solution</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {milestones.length > 0 ? (
                                        milestones.map((milestone: any, mIdx: number) => (
                                            <TableRow key={mIdx}>
                                                <TableCell component='th' scope='row'>
                                                    {milestone.project_kpi_sr_no}
                                                </TableCell>
                                                <TableCell align='center'>{milestone.milestone_name}</TableCell>
                                                <TableCell align='center'>{milestone.projct_kpi_dstrbt_vl}</TableCell>
                                                <TableCell align='center'>{milestone.project_kpi_actual || 0}</TableCell>
                                                <TableCell align='center'>
                                                    {renderStatusDisplay(milestone.project_kpi_status)}
                                                </TableCell>
                                                <TableCell align='center'>{milestone.project_kpi_reason || '-'}</TableCell>
                                                <TableCell align='center'>{milestone.project_kpi_solution || '-'}</TableCell>
                                                <TableCell align='center'>
                                                    <Button variant='text' size='small' color='primary' sx={{ textTransform: 'none' }} onClick={() => handleUpdateStatus(milestone)}>
                                                        Update Status
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align='center'>No milestones found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    )
}

const ProjectDeliverables = ({ projectData, refreshData }: { projectData: any, refreshData?: () => void }) => {
    const dispatch = useDispatch()
    const [openPopup, setOpenPopup] = useState(false)
    const [selectedKpi, setSelectedKpi] = useState<any>(null)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedKpiId, setSelectedKpiId] = useState<any>(null)
    const [openStatusPopup, setOpenStatusPopup] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<any>(null)

    const projectKpis = projectData?.project_kpi_data || []

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleAddKpi = () => {
        setSelectedKpi(null)
        setOpenPopup(true)
    }

    const handleEditKpi = (kpi: any) => {
        setSelectedKpi(kpi)
        setOpenPopup(true)
    }

    const handleDeleteKpi = (kpiId: any) => {
        setSelectedKpiId(kpiId)
        setOpenDelete(true)
    }

    const handleConfirmDelete = () => {
        if (!selectedKpiId) return

        const payload = {
            project_id: projectData?.projectData?.[0]?.id || projectData?.id,
            projectDetails: 'kpiProject',
            project_kpi_id: selectedKpiId,
            deleted_at: format(new Date(), 'yyyy-MM-dd'),
            //multi_kpi_mile_stone_id: []
        }

        dispatch(deleteSingleProjectRequest({
            payload,
            callback: (res: any) => {
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Deliverable deleted successfully')
                    if (refreshData) refreshData()
                } else {
                    toast.error(res?.message || 'Failed to delete deliverable')
                }
                setOpenDelete(false)
                setSelectedKpiId(null)
            }
        }))
    }

    const handleClosePopup = (refresh: boolean) => {
        setOpenPopup(false)
        setSelectedKpi(null)
        if (refresh && refreshData) {
            refreshData()
        }
    }

    return (
        <Fragment>
            <Card>
                <CardHeader
                    title='Project Deliverables'
                    action={
                        <Button
                            variant='contained'
                            onClick={handleAddKpi}
                            fullWidth
                            className='sm:is-auto'
                        >
                            Add Project Deliverables
                        </Button>
                    }
                />
                <TableContainer>
                    <Table className={tableStyles.table} sx={{ minWidth: 1200 }}>
                        <TableHead >
                            <TableRow>
                                <TableCell>Sr.No.</TableCell>
                                <TableCell>Deliverables</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>UOM</TableCell>
                                <TableCell>Definition</TableCell>
                                <TableCell>Ideal Trend</TableCell>
                                <TableCell>Year end target</TableCell>
                                <TableCell >Review Frequency</TableCell>
                                <TableCell >Project Target</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projectKpis.length > 0 ? (
                                projectKpis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, index: number) => (
                                    <Row
                                        key={index}
                                        row={row}
                                        index={index}
                                        page={page}
                                        rowsPerPage={rowsPerPage}
                                        handleEditKpi={handleEditKpi}
                                        handleDeleteKpi={handleDeleteKpi}
                                        handleUpdateStatus={(milestone) => {
                                            setSelectedMilestone(milestone)
                                            setOpenStatusPopup(true)
                                        }}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} align='center'>
                                        No project deliverables found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component='div'
                    count={projectKpis.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

            </Card>

            {openPopup && (
                <AddEditProjectDeliverables
                    open={openPopup}
                    handleClose={handleClosePopup}
                    kpiData={selectedKpi}
                    projectData={projectData}
                />
            )}

            {openDelete && (
                <ConfirmationPopup
                    open={openDelete}
                    setOpen={setOpenDelete}
                    title='Are you sure you want to delete this deliverable?'
                    subTitle="You won't be able to revert this!"
                    onConfirm={handleConfirmDelete}
                />
            )}

            {openStatusPopup && (
                <KpiMilestoneStatus
                    open={openStatusPopup}
                    handleClose={(refresh) => {
                        setOpenStatusPopup(false)
                        setSelectedMilestone(null)
                        if (refresh && refreshData) refreshData()
                    }}
                    data={selectedMilestone}
                    projectData={projectData}
                />
            )}
        </Fragment>
    )
}

export default ProjectDeliverables
