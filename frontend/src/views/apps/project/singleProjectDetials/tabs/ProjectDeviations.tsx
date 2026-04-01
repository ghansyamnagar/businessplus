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
import Tooltip from '@mui/material/Tooltip'

// Component Imports
import AddEditProjectDeviations from './Deviations/AddEditProjectDeviations'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Redux Imports
import { deleteSingleProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const ProjectDeviations = ({ projectData, refreshData }: { projectData: any, refreshData?: () => void }) => {
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedRow, setSelectedRow] = useState<any>(null)
    const [openAddEditPopup, setOpenAddEditPopup] = useState(false)
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

    const handleAddDeviation = () => {
        setSelectedRow(null)
        setOpenAddEditPopup(true)
    }

    const handleEditDeviation = () => {
        setOpenAddEditPopup(true)
        handleClose()
    }

    const handlePopupClose = (refresh: boolean) => {
        setOpenAddEditPopup(false)
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

    const handleConfirmDelete = () => {
        if (!selectedRow) return

        const payload = {
            project_id: projectData?.projectData?.[0]?.id,
            projectDetails: 'projectDeviation',
            deviation_id: selectedRow.id,
            deleted_at: format(new Date(), 'yyyy-MM-dd')
        }

        dispatch(deleteSingleProjectRequest({
            payload: payload,
            callback: (res: any) => {
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Deviation deleted successfully')
                    if (refreshData) refreshData()
                } else {
                    toast.error(res?.message || 'Failed to delete deviation')
                }
                setOpenDelete(false)
                setSelectedRow(null)
            }
        }))
    }

    const handleDownloadFile = (filePath: string) => {
        if (!filePath) return
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
        window.open(baseUrl + filePath, '_blank')
    }

    const deviations = projectData?.projectDeviation || []

    return (
        <>
            <Card>
                <CardHeader
                    title='Project Deviations'
                    action={
                        <Button
                            variant='contained'
                            onClick={handleAddDeviation}
                            fullWidth
                            className='sm:is-auto'
                        >
                            Add Project Deviations
                        </Button>
                    }
                />
                <TableContainer>
                    <Table className={tableStyles.table} size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sr. No.</TableCell>
                                <TableCell>Deviation</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Deviation from</TableCell>
                                <TableCell>Deviation to</TableCell>
                                <TableCell>Risk Level</TableCell>
                                <TableCell>Qty</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Approved by</TableCell>
                                <TableCell>File</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {deviations.length > 0 ? (
                                deviations
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>{row.deviation_name}</TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>{row.deviation_region}</TableCell>
                                            <TableCell>{row.deviation_start_date}</TableCell>
                                            <TableCell>{row.deviation_end_date}</TableCell>
                                            <TableCell>{row.risk_level_name || row.deviation_risk}</TableCell>
                                            <TableCell>{row.deviation_qty}</TableCell>
                                            <TableCell>{row.dept_name}</TableCell>
                                            <TableCell>{row.approve_user_name}</TableCell>
                                            <TableCell>
                                                {row.file_path ? (
                                                    <Tooltip title="View/Download File">
                                                        <IconButton
                                                            size='small'
                                                            color='primary'
                                                            onClick={() => handleDownloadFile(row.file_path)}
                                                        >
                                                            <i className='ri-file-download-line' />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    'NA'
                                                )}
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
                                    <TableCell colSpan={11} className='text-center'>
                                        No project deviations found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component='div'
                    count={deviations.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={handleEditDeviation}>
                        <ListItemIcon>
                            <i className='ri-edit-box-line text-textSecondary' />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setOpenDelete(true)
                        handleClose()
                    }}>
                        <ListItemIcon>
                            <i className='ri-delete-bin-7-line text-textSecondary' />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>
            </Card>

            {openAddEditPopup && (
                <AddEditProjectDeviations
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
                    title='Are you sure you want to delete this deviation?'
                    subTitle="You won't be able to revert this!"
                    onConfirm={handleConfirmDelete}
                />
            )}
        </>
    )
}

export default ProjectDeviations
