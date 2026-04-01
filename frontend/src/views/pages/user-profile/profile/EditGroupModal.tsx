'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Third-party Imports
import { toast } from 'react-toastify'

// Redux Imports
import { useDispatch } from 'react-redux'
import {
    getProfileGroupDetailsRequest,
    editProfileGroupUpdateRequest
} from '@/redux-store/slices/auth/auth.slice'

interface EditGroupModalProps {
    open: boolean
    onClose: () => void
    groupId: number | null
    onSuccess: () => void
}

const EditGroupModal = ({ open, onClose, groupId, onSuccess }: EditGroupModalProps) => {
    const dispatch = useDispatch()

    const [groupName, setGroupName] = useState('')
    const [groupDescription, setGroupDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open && groupId) {
            fetchGroupDetails()
        }
    }, [open, groupId])

    const fetchGroupDetails = () => {
        if (!groupId) return

        setLoading(true)

        dispatch(
            getProfileGroupDetailsRequest({
                payload: { group_id: groupId },
                callback: (response: any, error: any) => {
                    setLoading(false)

                    if (response && !error && response?.status === 'success') {
                        const data = response.data
                        setGroupName(data?.group_name || '')
                        setGroupDescription(data?.group_description || '')
                    } else {
                        toast.error(error?.message || 'Failed to load group details')
                    }
                }
            })
        )
    }

    const handleSubmit = () => {
        if (!groupName.trim()) {
            toast.error('Group name is required')
            return
        }

        if (!groupId) return

        setSaving(true)

        dispatch(
            editProfileGroupUpdateRequest({
                payload: {
                    id: groupId,
                    group_name: groupName,
                    group_description: groupDescription
                },
                callback: (response: any, error: any) => {
                    setSaving(false)

                    if (response && !error) {
                        toast.success(response?.message || 'Group updated successfully')
                        onSuccess()
                        onClose()
                    } else {
                        toast.error(error?.message || 'Failed to update group')
                    }
                }
            })
        )
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle className='flex justify-between items-center'>
                Edit Group
                <IconButton size='small' onClick={onClose}>
                    <i className='ri-close-line text-2xl' />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : (
                    <div className='flex flex-col gap-4 pt-2'>
                        <TextField
                            fullWidth
                            label='Group Name'
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            required
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label='Description'
                            value={groupDescription}
                            onChange={e => setGroupDescription(e.target.value)}
                            multiline
                            rows={3}
                        />
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' color='secondary' onClick={onClose}>
                    Cancel
                </Button>
                <Button variant='contained' onClick={handleSubmit} disabled={saving || loading}>
                    {saving ? <CircularProgress size={22} color='inherit' /> : 'Update Group'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EditGroupModal
