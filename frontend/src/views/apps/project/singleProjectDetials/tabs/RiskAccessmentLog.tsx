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
import AddEditRiskAccessmentLog from './RiskAccessment/AddEditRiskAccessmentLog'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Redux Imports
import { deleteSingleProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const RiskAccessmentLog = ({ projectData, refreshData }: { projectData: any, refreshData?: () => void }) => {
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedRow, setSelectedRow] = useState<any>(null)
    const [openAddEditPopup, setOpenAddEditPopup] = useState(false)
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

    const handleAddRiskAccessment = () => {
        setSelectedRow(null)
        setOpenAddEditPopup(true)
    }

    const handleEditRiskAccessment = () => {
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

    const handleConfirmDelete = () => {
        if (!selectedRow) return

        const payload = {
            project_id: projectData?.projectData?.[0]?.id,
            projectDetails: 'RiskAccessmentLog',
            id: selectedRow.id,
            deleted_at: format(new Date(), 'yyyy-MM-dd')
        }

        dispatch(deleteSingleProjectRequest({
            payload: payload,
            callback: (res: any) => {
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Risk log deleted successfully')
                    if (refreshData) refreshData()
                } else {
                    toast.error(res?.message || 'Failed to delete risk log')
                }
                setOpenDelete(false)
                setSelectedRow(null)
            }
        }))
    }

    const risks = projectData?.RiskAccessmentLog || []

    return (
        <>
            <Card>
                <CardHeader
                    title='Risk Accessment Log'
                    action={
                        <Button
                            variant='contained'
                            onClick={handleAddRiskAccessment}
                            fullWidth
                            className='sm:is-auto'
                        >
                            Add Risk Accessment Log
                        </Button>
                    }
                />
                <TableContainer>
                    <Table className={tableStyles.table} size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sr.No.</TableCell>
                                <TableCell>Risk Item</TableCell>
                                <TableCell>Time Required</TableCell>
                                <TableCell>Risk Level</TableCell>
                                <TableCell>Responsibility</TableCell>
                                <TableCell>Mitigation Plan</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {risks.length > 0 ? (
                                risks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell sx={{ minWidth: 200, whiteSpace: 'normal' }}>{row.risk_item}</TableCell>
                                        <TableCell>{row.risk_time_required}</TableCell>
                                        <TableCell>{row.risk_level_name}</TableCell>
                                        <TableCell>{row.risk_responsibility_name}</TableCell>
                                        <TableCell sx={{ minWidth: 250, whiteSpace: 'normal' }}>{row.risk_mtiqation_plan}</TableCell>
                                        <TableCell>
                                            <IconButton size='small' onClick={(e) => handleClick(e, row)}>
                                                <i className='ri-more-fill'></i>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className='text-center'>
                                        No risk logs found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component='div'
                    count={risks.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={handleEditRiskAccessment}>
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

            {openAddEditPopup && (
                <AddEditRiskAccessmentLog
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
                    title='Are you sure you want to delete this risk log?'
                    subTitle="You won't be able to revert this!"
                    onConfirm={handleConfirmDelete}
                />
            )}
        </>
    )
}

export default RiskAccessmentLog
