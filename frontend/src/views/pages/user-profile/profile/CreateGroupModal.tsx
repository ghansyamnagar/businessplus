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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'

// Third-party Imports
import { toast } from 'react-toastify'

// Redux Imports
import { useDispatch } from 'react-redux'
import { getUserDetailsRequest, createGroupRequest } from '@/redux-store/slices/auth/auth.slice'

type UserOption = {
    user_id: number
    name: string
    designation: string
    email: string
}

interface CreateGroupModalProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

const CreateGroupModal = ({ open, onClose, onSuccess }: CreateGroupModalProps) => {
    const dispatch = useDispatch()

    // Form states
    const [groupName, setGroupName] = useState('')
    const [groupDescription, setGroupDescription] = useState('')
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])

    // Data
    const [userOptions, setUserOptions] = useState<UserOption[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            // Reset form
            setGroupName('')
            setGroupDescription('')
            setSelectedUserIds([])

            // Fetch users
            fetchUsers()
        }
    }, [open])

    const fetchUsers = () => {
        setLoadingUsers(true)

        dispatch(
            getUserDetailsRequest({
                payload: {},
                callback: (response: any, error: any) => {
                    setLoadingUsers(false)

                    if (response && !error && response?.status === 'success') {
                        setUserOptions(response.data || [])
                    }
                }
            })
        )
    }

    const handleUserChange = (event: any) => {
        const value = event.target.value as number[]

        setSelectedUserIds(value)
    }

    const handleSubmit = () => {
        if (!groupName.trim()) {
            toast.error('Group name is required')
            return
        }

        if (selectedUserIds.length === 0) {
            toast.error('Please select at least one participant')
            return
        }

        setSaving(true)

        dispatch(
            createGroupRequest({
                payload: {
                    group_name: groupName,
                    group_description: groupDescription,
                    user_id: selectedUserIds
                },
                callback: (response: any, error: any) => {
                    setSaving(false)

                    if (response && !error) {
                        toast.success(response?.message || 'Group created successfully')
                        onSuccess()
                        onClose()
                    } else {
                        toast.error(error?.message || 'Failed to create group')
                    }
                }
            })
        )
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle className='flex justify-between items-center'>
                Create Group
                <IconButton size='small' onClick={onClose}>
                    <i className='ri-close-line text-2xl' />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <div className='flex flex-col gap-4 pt-2'>
                    {/* Group Name */}
                    <TextField
                        fullWidth
                        label='Group Name'
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        required
                        autoFocus
                    />

                    {/* Group Description */}
                    <TextField
                        fullWidth
                        label='Description'
                        value={groupDescription}
                        onChange={e => setGroupDescription(e.target.value)}
                        multiline
                        rows={3}
                    />

                    {/* Add Participants - Multi-Select */}
                    <FormControl fullWidth>
                        <InputLabel>Add Participants</InputLabel>
                        <Select
                            multiple
                            value={selectedUserIds}
                            onChange={handleUserChange}
                            input={<OutlinedInput label='Add Participants' />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {(selected as number[]).map(id => {
                                        const user = userOptions.find(u => u.user_id === id)

                                        return (
                                            <Chip
                                                key={id}
                                                label={user?.name || id}
                                                size='small'
                                                onDelete={() => {
                                                    setSelectedUserIds(prev => prev.filter(uid => uid !== id))
                                                }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                            />
                                        )
                                    })}
                                </Box>
                            )}
                            MenuProps={{
                                PaperProps: {
                                    style: { maxHeight: 300 }
                                }
                            }}
                        >
                            {loadingUsers ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} className='mr-2' />
                                    Loading users...
                                </MenuItem>
                            ) : (
                                userOptions.map(user => (
                                    <MenuItem key={user.user_id} value={user.user_id}>
                                        <Checkbox checked={selectedUserIds.includes(user.user_id)} />
                                        <ListItemText
                                            primary={user.name}
                                        // secondary={user.designation || user.email}
                                        />
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' color='secondary' onClick={onClose}>
                    Cancel
                </Button>
                <Button variant='contained' onClick={handleSubmit} disabled={saving}>
                    {saving ? <CircularProgress size={22} color='inherit' /> : 'Create Group'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CreateGroupModal
