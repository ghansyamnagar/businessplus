'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Component Imports
import AddEditIssueTracker from './Tracker/AddEditIssueTracker'
import UpdateStatusIssueTracker from './Tracker/UpdateStatusIssueTracker'
import IssueTrackerRemarkList from './Tracker/IssueTrackerRemarkList'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Redux Imports
import { deleteSingleProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const IssueTracker = ({ projectData, refreshData }: { projectData: any, refreshData?: () => void }) => {
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedRow, setSelectedRow] = useState<any>(null)
    const [openAddEditPopup, setOpenAddEditPopup] = useState(false)
    const [openUpdateStatusPopup, setOpenUpdateStatusPopup] = useState(false)
    const [openRemarkListPopup, setOpenRemarkListPopup] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, row: any) => {
        setAnchorEl(event.currentTarget)
        setSelectedRow(row)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleAddIssue = () => {
        setSelectedRow(null)
        setOpenAddEditPopup(true)
    }

    const handleEditIssue = () => {
        setOpenAddEditPopup(true)
        handleClose()
    }

    const handleOpenChangeStatus = () => {
        setOpenUpdateStatusPopup(true)
        handleClose()
    }

    const handleOpenRemarkList = () => {
        setOpenRemarkListPopup(true)
        handleClose()
    }

    const handleUpdateStatusPopupClose = (refresh: boolean) => {
        setOpenUpdateStatusPopup(false)
        setSelectedRow(null)
        if (refresh && refreshData) {
            refreshData()
        }
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handlePopupClose = (refresh: boolean) => {
        setOpenAddEditPopup(false)
        setSelectedRow(null)
        if (refresh && refreshData) {
            refreshData()
        }
    }

    const handleConfirmDelete = () => {
        if (!selectedRow) return

        const payload = {
            project_id: projectData?.projectData?.[0]?.id,
            projectDetails: 'projectIssueTracker',
            issue_id: selectedRow.id,
            deleted_at: format(new Date(), 'yyyy-MM-dd')
        }

        dispatch(deleteSingleProjectRequest({
            payload: payload,
            callback: (res: any) => {
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Issue deleted successfully')
                    if (refreshData) refreshData()
                } else {
                    toast.error(res?.message || 'Failed to delete issue')
                }
                setOpenDelete(false)
                setSelectedRow(null)
            }
        }))
    }

    const issues = projectData?.projectIssueTracker || []

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'warning.main'
            case 'on hold': return 'info.main'
            case 'closed': return 'success.main'
            case 'delayed': return 'error.main'
            case 'closed with delay': return 'text.primary'
            default: return 'text.secondary'
        }
    }

    return (
        <>
            <Card>
                <CardHeader
                    title='Issue Tracker'
                    action={
                        <Button
                            variant='contained'
                            onClick={handleAddIssue}
                            fullWidth
                            className='sm:is-auto'
                        >
                            Enter New Issue
                        </Button>
                    }
                />
                <TableContainer>
                    <Table className={tableStyles.table} size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sl.No.</TableCell>
                                <TableCell>Issue Log Date</TableCell>
                                <TableCell>Issue Name</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Responsibility</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Target Closure Date</TableCell>
                                <TableCell>Revised Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {issues.length > 0 ? (
                                issues
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell>{row.issue_start_date}</TableCell>
                                            <TableCell sx={{ minWidth: 200, whiteSpace: 'normal' }}>{row.issue_task_name}</TableCell>
                                            <TableCell>{row.priority_name}</TableCell>
                                            <TableCell>{row.issue_task_owner_name}</TableCell>
                                            <TableCell>{row.dept_name}</TableCell>
                                            <TableCell>{row.issue_end_date}</TableCell>
                                            <TableCell>{row.issue_revised_date || 'NA'}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant='body2'
                                                    // className='font-bold'
                                                    sx={{ color: getStatusColor(row.status_name) }}
                                                >
                                                    {row.status_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size='small' onClick={(e) => handleClick(e, row)}>
                                                    <i className='ri-more-fill'></i>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className='text-center'>
                                        No issues found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component='div'
                    count={issues.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={handleEditIssue}>
                        <ListItemIcon>
                            <i className='ri-edit-box-line' />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setOpenDelete(true)
                        handleClose()
                    }}>
                        <ListItemIcon>
                            <i className='ri-delete-bin-7-line' />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleOpenChangeStatus}>
                        <ListItemIcon>
                            <i className='ri-checkbox-circle-line text-textSecondary' />
                        </ListItemIcon>
                        <ListItemText>Change Status</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleOpenRemarkList}>
                        <ListItemIcon>
                            <i className='ri-eye-line text-textSecondary' />
                        </ListItemIcon>
                        <ListItemText>Remarks / History</ListItemText>
                    </MenuItem>
                </Menu>
            </Card>

            {openAddEditPopup && (
                <AddEditIssueTracker
                    open={openAddEditPopup}
                    handleClose={handlePopupClose}
                    data={selectedRow}
                    projectData={projectData}
                />
            )}

            {openDelete && (
                <ConfirmationPopup
                    open={openDelete}
                    setOpen={setOpenDelete}
                    title='Are you sure you want to delete this issue?'
                    subTitle="You won't be able to revert this!"
                    onConfirm={handleConfirmDelete}
                />
            )}

            {openUpdateStatusPopup && (
                <UpdateStatusIssueTracker
                    open={openUpdateStatusPopup}
                    onClose={handleUpdateStatusPopupClose}
                    issueData={selectedRow}
                />
            )}

            {openRemarkListPopup && (
                <IssueTrackerRemarkList
                    open={openRemarkListPopup}
                    onClose={() => setOpenRemarkListPopup(false)}
                    issueData={selectedRow}
                />
            )}
        </>
    )
}

export default IssueTracker
