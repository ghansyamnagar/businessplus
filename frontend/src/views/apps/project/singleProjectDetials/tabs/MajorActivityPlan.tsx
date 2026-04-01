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
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

// Component Imports
import AddEditMajorActiviy from './Activity/AddEditMajorActiviy'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Redux Imports
import { deleteSingleProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const MajorActivityPlan = ({ projectData, refreshData }: { projectData: any, refreshData?: () => void }) => {
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedRow, setSelectedRow] = useState<any>(null)
    const [openActivityPopup, setOpenActivityPopup] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const activities = projectData?.project_majr_activity_data || []

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, row: any) => {
        setAnchorEl(event.currentTarget)
        setSelectedRow(row)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleAddActivity = () => {
        setSelectedRow(null)
        setOpenActivityPopup(true)
    }

    const handleEditActivity = () => {
        setOpenActivityPopup(true)
        handleClose()
    }

    const handlePopupClose = (refresh: boolean) => {
        setOpenActivityPopup(false)
        setSelectedRow(null)
        if (refresh && refreshData) {
            refreshData()
        }
    }

    const handleConfirmDelete = () => {
        if (!selectedRow) return

        const payload = {
            project_id: projectData.projectData[0].id,
            projectDetails: 'projectActivity',
            project_activity_id: selectedRow.project_activity_id,
            deleted_at: format(new Date(), 'yyyy-MM-dd')
        }

        dispatch(deleteSingleProjectRequest({
            payload: payload,
            callback: (res: any) => {
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Activity deleted successfully')
                    if (refreshData) refreshData()
                } else {
                    toast.error(res?.message || 'Failed to delete activity')
                }
                setOpenDelete(false)
                setSelectedRow(null)
            }
        }))
    }

    return (
        <>
            <Card>
                <CardHeader
                    title='Major Activity Plan'
                    action={
                        <Button
                            variant='contained'
                            onClick={handleAddActivity}
                            fullWidth
                            className='sm:is-auto'
                        >
                            Add Activity
                        </Button>
                    }
                />
                <TableContainer>
                    <Table className={tableStyles.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sr.No.</TableCell>
                                <TableCell>Activity</TableCell>
                                <TableCell>Linked milestone</TableCell>
                                <TableCell>Start</TableCell>
                                <TableCell>Finish</TableCell>
                                <TableCell>Preceeding activity</TableCell>
                                <TableCell>Next activity</TableCell>
                                <TableCell>Responsibility</TableCell>
                                <TableCell>Other Responsibility</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activities.length > 0 ? (
                                activities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{row.activity_name}</TableCell>
                                        <TableCell>{row.milestone_name}</TableCell>
                                        <TableCell>{row.activity_start_date}</TableCell>
                                        <TableCell>{row.activity_end_date}</TableCell>
                                        <TableCell>{row.preceeding_activity_name || '-'}</TableCell>
                                        <TableCell>{row.next_activity_name || '-'}</TableCell>
                                        <TableCell>{row.responsibility_person}</TableCell>
                                        <TableCell>{row.other_responsibility || '-'}</TableCell>
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
                                        No major activities found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component='div'
                    count={activities.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={handleEditActivity}>
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
                </Menu>
            </Card>

            {openActivityPopup && (
                <AddEditMajorActiviy
                    open={openActivityPopup}
                    handleClose={handlePopupClose}
                    data={selectedRow}
                    projectData={projectData}
                />
            )}

            {openDelete && (
                <ConfirmationPopup
                    open={openDelete}
                    setOpen={setOpenDelete}
                    title='Are you sure you want to delete this activity?'
                    subTitle="You won't be able to revert this!"
                    onConfirm={handleConfirmDelete}
                />
            )}
        </>
    )
}

export default MajorActivityPlan
