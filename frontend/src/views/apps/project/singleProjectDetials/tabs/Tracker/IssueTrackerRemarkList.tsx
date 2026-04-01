'use client'

import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Redux Imports
import { getSingleRowDataRequest, remarkIssueTrackerRequest } from '@/redux-store/slices/project/project.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

interface IssueTrackerRemarkListProps {
    open: boolean
    onClose: () => void
    issueData: any
}

const IssueTrackerRemarkList = ({ open, onClose, issueData }: IssueTrackerRemarkListProps) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [remarks, setRemarks] = useState<any[]>([])
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedRemark, setSelectedRemark] = useState<any>(null)

    const fetchRemarks = () => {
        if (!issueData?.id) return
        setLoading(true)
        dispatch(getSingleRowDataRequest({
            payload: {
                issue_id: issueData.id,
                projectDetails: 'IssueTrackerRemark'
            },
            callback: (res: any) => {
                setLoading(false)
                if (res?.status === 'success' || res?.status_code === 200) {
                    setRemarks(res.data?.IssueRemarks || [])
                }
            }
        }))
    }

    useEffect(() => {
        if (open && issueData?.id) {
            fetchRemarks()
        }
    }, [open, issueData, dispatch])
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

    const handleDeleteClick = (remark: any) => {
        setSelectedRemark(remark)
        setOpenDelete(true)
    }

    const handleConfirmDelete = () => {
        if (!selectedRemark) return

        const fd = new FormData()
        fd.append('issue_remark_id', selectedRemark.id.toString())
        fd.append('deleted_at', format(new Date(), 'yyyy-MM-dd'))

        dispatch(remarkIssueTrackerRequest({
            payload: fd,
            callback: (res: any) => {
                if (res?.status === 'success' || res?.status_code === 200) {
                    toast.success(res.message || 'Remark deleted successfully')
                    fetchRemarks()
                } else {
                    toast.error(res?.message || 'Error deleting remark')
                }
                setOpenDelete(false)
                setSelectedRemark(null)
            }
        }))
    }
    return (
        <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Issue History & Remarks
                <IconButton size='small' onClick={onClose}>
                    <i className='ri-close-line' />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table className={tableStyles.table} size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Sl.No.</TableCell>
                                    <TableCell>User Name</TableCell>
                                    <TableCell>Remark</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>File Name</TableCell>
                                    <TableCell>Update Date</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {remarks.length > 0 ? (
                                    remarks.map((remark: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{remark.issue_remark_user_name || '-'}</TableCell>
                                            <TableCell sx={{ minWidth: 200, whiteSpace: 'normal' }}>{remark.remark}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant='body2'
                                                    sx={{ color: getStatusColor(remark.status_name) }}
                                                >
                                                    {remark.status_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {remark.file_name ? (
                                                    <IconButton
                                                        size='small'
                                                        component='a'
                                                        href={remark.file_name}
                                                        target='_blank'
                                                        color='primary'
                                                    >
                                                        <i className='ri-download-line' />
                                                    </IconButton>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>{remark.created_at}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size='small'
                                                    onClick={() => handleDeleteClick(remark)}
                                                >
                                                    <i className='ri-delete-bin-7-line text-textSecondary' />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align='center'>No remarks found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' color='secondary' onClick={onClose}>
                    Cancel
                </Button>
            </DialogActions>

            {openDelete && (
                <ConfirmationPopup
                    open={openDelete}
                    setOpen={setOpenDelete}
                    title='Are you sure you want to delete this remark?'
                    subTitle="You won't be able to revert this!"
                    onConfirm={handleConfirmDelete}
                />
            )}
        </Dialog>
    )
}

export default IssueTrackerRemarkList
