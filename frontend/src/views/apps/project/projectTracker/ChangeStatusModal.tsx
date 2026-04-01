'use client'

import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

import type { AppDispatch } from '@/redux-store'
import { remarkProjectRequest } from '@/redux-store/slices/project/project.slice'

interface ChangeStatusModalProps {
    open: boolean
    onClose: () => void
    projectId: number | null
    currentStatusId?: number | null
    statuses: any[]
    onSuccess: () => void
}

const ChangeStatusModal = ({
    open,
    onClose,
    projectId,
    currentStatusId,
    statuses,
    onSuccess
}: ChangeStatusModalProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const [statusId, setStatusId] = useState('')
    const [remark, setRemark] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Pre-select the current status when the modal opens
    useEffect(() => {
        if (open && currentStatusId) {
            setStatusId(String(currentStatusId))
        }
    }, [open, currentStatusId])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target
        if (files && files.length > 0) {
            setSelectedFile(files[0])
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleClose = () => {
        setStatusId('')
        setRemark('')
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        onClose()
    }

    const handleSubmit = () => {
        if (!statusId) {
            toast.error('Please select a status')
            return
        }

        if (!projectId) {
            toast.error('Project ID is missing')
            return
        }

        setLoading(true)

        // Build FormData here so File objects don't get serialized by Redux
        const formData = new FormData()
        formData.append('project_id', String(projectId))
        formData.append('status_id', statusId)

        if (remark) {
            formData.append('remark', remark)
        }

        if (selectedFile) {
            formData.append('upload_id', selectedFile)
        }

        dispatch(remarkProjectRequest({
            payload: formData,
            callback: (res: any) => {
                setLoading(false)
                if (res?.status_code === 200 || res?.status === 'success') {
                    toast.success(res.message || 'Status updated successfully')
                    handleClose()
                    onSuccess()
                } else {
                    toast.error(res?.message || 'Error updating status')
                }
            }
        }))
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Change Project Status
                <IconButton size='small' onClick={handleClose}>
                    <i className='ri-close-line' />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <TextField
                        select
                        label='Status'
                        value={statusId}
                        onChange={(e) => setStatusId(e.target.value)}
                        fullWidth
                        required
                        SelectProps={{
                            MenuProps: {
                                PaperProps: { style: { maxHeight: 250 } }
                            }
                        }}
                    >
                        {statuses.map((status: any) => (
                            <MenuItem key={status.id} value={String(status.id)}>
                                {status.status_name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label='Remark'
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder='Add a remark (optional)'
                    />

                    <Box>
                        <Button
                            variant='outlined'
                            component='label'
                            startIcon={<i className='ri-upload-2-line' />}
                        >
                            Upload File
                            <input
                                type='file'
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </Button>
                        {selectedFile && (
                            <Chip
                                label={selectedFile.name}
                                onDelete={handleRemoveFile}
                                sx={{ ml: 2, mt: 1 }}
                                variant='outlined'
                                color='primary'
                            />
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant='outlined' color='secondary' onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant='contained' onClick={handleSubmit} disabled={loading}>
                    {loading ? <CircularProgress size={20} color='inherit' /> : 'Update Status'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChangeStatusModal
