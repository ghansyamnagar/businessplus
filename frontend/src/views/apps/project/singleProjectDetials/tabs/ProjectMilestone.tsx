import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'

// Component Imports
import UpdateMilestoneStatus from './Milestone/UpdateMilestoneStatus'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const ProjectMilestone = ({ projectData, refreshData }: { projectData: any, refreshData?: () => void }) => {
    // States
    const [openPopup, setOpenPopup] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<any>(null)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const milestones = projectData?.project_milestone_data || []

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleUpdateStatus = (milestone: any) => {
        setSelectedMilestone(milestone)
        setOpenPopup(true)
    }

    const handleClosePopup = (refresh: boolean) => {
        setOpenPopup(false)
        setSelectedMilestone(null)
        if (refresh && refreshData) {
            refreshData()
        }
    }

    const projectDetails = projectData?.projectData?.[0] || {}

    return (
        <>
            <Card>
                <CardHeader title='Milestone Status' />
                <TableContainer>
                    <Table className={tableStyles.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sr.No.</TableCell>
                                <TableCell>Milestone Name</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>Symbol</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Actual Date</TableCell>
                                <TableCell>Comments</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {milestones.length > 0 ? (
                                milestones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{row.milestone_name}</TableCell>
                                        <TableCell>{row.mile_stone_date}</TableCell>
                                        <TableCell>Symbol</TableCell>
                                        <TableCell>{row.description}</TableCell>
                                        <TableCell>{row.actual_date || '-'}</TableCell>
                                        <TableCell>{row.comment || '-'}</TableCell>
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
                                        <TableCell>
                                            <Button
                                                variant='text'
                                                size='small'
                                                onClick={() => handleUpdateStatus(row)}
                                            >
                                                Update Status
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={9} className='text-center'>No milestones found</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component='div'
                    count={milestones.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>

            {openPopup && (
                <UpdateMilestoneStatus
                    open={openPopup}
                    handleClose={handleClosePopup}
                    milestoneData={selectedMilestone}
                    projectDetails={projectDetails}
                />
            )}
        </>
    )
}

export default ProjectMilestone
