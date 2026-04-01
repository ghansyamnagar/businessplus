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
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import TablePagination from '@mui/material/TablePagination'

import AddEditGovernance from './Governance/AddEditGovernance'
import AgendaGovernance from './Governance/AgendaGovernance'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Redux Imports
import { deleteSingleProjectRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

interface GovernanceStructureProps {
    projectData: any
    refreshData?: () => void
}

const GovernanceStructure = ({ projectData, refreshData }: GovernanceStructureProps) => {
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedRow, setSelectedRow] = useState<any>(null)
    const [openAddEdit, setOpenAddEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [openAgenda, setOpenAgenda] = useState(false)
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

    const handleAddGovernance = () => {
        setSelectedRow(null)
        setOpenAddEdit(true)
    }

    const handleEdit = () => {
        setOpenAddEdit(true)
        handleClose()
    }

    const handleDelete = () => {
        setOpenDelete(true)
        handleClose()
    }

    const handleOpenAgenda = (row: any) => {
        setSelectedRow(row)
        setOpenAgenda(true)
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handlePopupClose = (refresh: boolean) => {
        setOpenAddEdit(false)
        setSelectedRow(null)
        if (refresh && refreshData) {
            refreshData()
        }
    }

    const handleConfirmDelete = () => {
        if (!selectedRow) return

        const payload = {
            project_id: projectData?.projectData?.[0]?.id,
            projectDetails: 'governanceProject',
            project_gov_id: selectedRow.id,
            project_gov_memebers_id: selectedRow.id,
            deleted_at: format(new Date(), 'yyyy-MM-dd')
        }

        dispatch(deleteSingleProjectRequest({
            payload: payload,
            callback: (res: any) => {
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Governance deleted successfully')
                    if (refreshData) refreshData()
                } else {
                    toast.error(res?.message || 'Error deleting governance')
                }
                setOpenDelete(false)
                setSelectedRow(null)
            }
        }))
    }

    const goverances = projectData?.project_goverances || []

    const getDurationLabel = (duration: string) => {
        switch (duration) {
            case 'one_hour': return '1 Hour'
            case 'half_hour': return '30 Minute'
            case 'two_hour': return '2 Hour'
            default: return duration
        }
    }


    // console.log()
    return (
        <Card>
            <CardHeader
                title='Governance Structure'
                action={
                    <Button variant='contained' className='sm:is-auto' onClick={handleAddGovernance}>
                        Add Governance
                    </Button>
                }
            />
            <TableContainer>
                <Table className={tableStyles.table} size='small'>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell>Sr.No.</TableCell>
                            <TableCell>Meeting Name</TableCell>
                            <TableCell>Chair Person</TableCell>
                            <TableCell>Co-chair Person</TableCell>
                            <TableCell>Member</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Meeting Shedule</TableCell>
                            <TableCell>Meeting days</TableCell>
                            <TableCell>Meeting duration</TableCell>
                            <TableCell>Venue</TableCell>
                            <TableCell>Agenda</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {goverances.length > 0 ? (
                            goverances
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{row.meeting_name}</TableCell>
                                        <TableCell>{row.chair_person_name}</TableCell>
                                        <TableCell>{row.co_chair_person_name}</TableCell>
                                        <TableCell sx={{ minWidth: 200 }}>
                                            {row.gov_members?.map((m: any) => m.member_name).join(', ')}
                                        </TableCell>
                                        <TableCell>{row.gov_frequency}</TableCell>
                                        <TableCell>{row.meeting_shedule}</TableCell>
                                        <TableCell>{row.meeting_day}</TableCell>
                                        <TableCell>{getDurationLabel(row.gov_duration)}</TableCell>
                                        <TableCell>{row.gov_venue}</TableCell>
                                        <TableCell>
                                            <Tooltip title={row.agenda || 'No Agenda'}>
                                                <IconButton size='small' onClick={() => handleOpenAgenda(row)}>
                                                    <i className='ri-file-list-2-line text-textSecondary' />
                                                </IconButton>
                                            </Tooltip>
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
                                <TableCell colSpan={12} align='center'>No Governance Structure found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component='div'
                count={goverances.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon><i className='ri-edit-box-line text-textSecondary' /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <ListItemIcon><i className='ri-delete-bin-7-line text-textSecondary' /></ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            {openAddEdit && (
                <AddEditGovernance
                    open={openAddEdit}
                    handleClose={handlePopupClose}
                    data={selectedRow}
                    projectData={projectData}
                />
            )}

            {openDelete && (
                <ConfirmationPopup
                    open={openDelete}
                    setOpen={setOpenDelete}
                    title='Are you sure you want to delete this governance?'
                    subTitle="You won't be able to revert this!"
                    onConfirm={handleConfirmDelete}
                />
            )}

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
        </Card>
    )
}

export default GovernanceStructure
