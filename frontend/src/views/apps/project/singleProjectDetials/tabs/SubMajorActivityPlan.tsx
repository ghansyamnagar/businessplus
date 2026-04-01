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

// Component Imports
import AddEditSubMajorActiviy from './Activity/AddEditSubMajorActiviy'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Redux Imports
import { deleteSingleProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const SubMajorActivityPlan = ({ projectData, refreshData }: { projectData: any, refreshData?: () => void }) => {
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedRow, setSelectedRow] = useState<any>(null)
    const [openActivityPopup, setOpenActivityPopup] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

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
            projectDetails: 'projectSubActivity',
            project_sub_actvity_id: selectedRow.project_sub_actvity_id,
            deleted_at: format(new Date(), 'yyyy-MM-dd')
        }

        dispatch(deleteSingleProjectRequest({
            payload: payload,
            callback: (res: any) => {
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Sub-activity deleted successfully')
                    if (refreshData) refreshData()
                } else {
                    toast.error(res?.message || 'Failed to delete sub-activity')
                }
                setOpenDelete(false)
                setSelectedRow(null)
            }
        }))
    }

    // Process sub-activity data from major activities
    const subActivityData = projectData?.project_majr_activity_data?.reduce((acc: any[], major: any) => {
        const subActivities = (major.project_sub_activity_data || []).map((sub: any) => ({
            ...sub,
            activity_name: major.activity_name, // Include major activity name for display
            activity_start_date: major.activity_start_date, // Useful for validation in popup
            activity_end_date: major.activity_end_date
        }))
        return [...acc, ...subActivities]
    }, []) || []

    return (
        <>
            <Card>
                <CardHeader
                    title='Sub Activity Plan'
                    action={
                        <Button
                            variant='contained'
                            onClick={handleAddActivity}
                            fullWidth
                            className='sm:is-auto'
                        >
                            Add Sub Activity
                        </Button>
                    }
                />
                <TableContainer>
                    <Table className={tableStyles.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sr.No.</TableCell>
                                <TableCell>Activity</TableCell>
                                <TableCell>Sub activity</TableCell>
                                <TableCell>Start</TableCell>
                                <TableCell>Finish</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {subActivityData.length > 0 ? (
                                subActivityData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{row.activity_name}</TableCell>
                                        <TableCell>{row.sub_activity_name}</TableCell>
                                        <TableCell>{row.sb_actvity_strt_date}</TableCell>
                                        <TableCell>{row.sb_actvity_end_date}</TableCell>
                                        <TableCell>
                                            <IconButton size='small' onClick={(e) => handleClick(e, row)}>
                                                <i className='ri-more-fill'></i>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className='text-center'>
                                        No sub-activities found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component='div'
                    count={subActivityData.length}
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
                <AddEditSubMajorActiviy
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
                    title='Are you sure you want to delete this sub-activity?'
                    subTitle="You won't be able to revert this!"
                    onConfirm={handleConfirmDelete}
                />
            )}
        </>
    )
}

export default SubMajorActivityPlan
