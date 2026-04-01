'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
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
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'

// Third-party Imports
import { toast } from 'react-toastify'

// Redux Imports
import { useDispatch } from 'react-redux'
import {
    getUserDetailsRequest,
    getProfileUserByGroupIdRequest,
    addParticipantToGroupRequest
} from '@/redux-store/slices/auth/auth.slice'

type UserOption = {
    user_id: number
    name: string
    designation?: string
    email?: string
}

interface AddParticipantModalProps {
    open: boolean
    onClose: () => void
    groupId: number | null
    onSuccess: () => void
}

const AddParticipantModal = ({ open, onClose, groupId, onSuccess }: AddParticipantModalProps) => {
    const dispatch = useDispatch()

    // All available users
    const [allUsers, setAllUsers] = useState<UserOption[]>([])
    // Already joined users
    const [existingMembers, setExistingMembers] = useState<UserOption[]>([])
    // Selected user IDs (includes existing + newly selected)
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])

    const [loadingUsers, setLoadingUsers] = useState(false)
    const [loadingMembers, setLoadingMembers] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open && groupId) {
            setSelectedUserIds([])
            setExistingMembers([])
            fetchAllUsers()
            fetchExistingMembers()
        }
    }, [open, groupId])

    const fetchAllUsers = () => {
        setLoadingUsers(true)

        dispatch(
            getUserDetailsRequest({
                payload: {},
                callback: (response: any, error: any) => {
                    setLoadingUsers(false)

                    if (response && !error && response?.status === 'success') {
                        setAllUsers(response.data || [])
                    }
                }
            })
        )
    }

    const fetchExistingMembers = () => {
        if (!groupId) return

        setLoadingMembers(true)

        dispatch(
            getProfileUserByGroupIdRequest({
                payload: { group_id: groupId },
                callback: (response: any, error: any) => {
                    setLoadingMembers(false)

                    if (response && !error) {
                        const members = response.data || []

                        setExistingMembers(members)

                        // Pre-select existing members
                        setSelectedUserIds(members.map((m: UserOption) => m.user_id))
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
        if (!groupId) return

        if (selectedUserIds.length === 0) {
            toast.error('Please select at least one participant')
            return
        }

        // Build user_id array with { user_id, name }
        const userPayload = selectedUserIds.map(id => {
            const user = allUsers.find(u => u.user_id === id) || existingMembers.find(m => m.user_id === id)

            return { user_id: id, name: user?.name || '' }
        })

        setSaving(true)

        dispatch(
            addParticipantToGroupRequest({
                payload: {
                    group_id: groupId,
                    user_id: userPayload
                },
                callback: (response: any, error: any) => {
                    setSaving(false)

                    if (response && !error) {
                        toast.success(response?.message || 'Participants updated successfully')
                        onSuccess()
                        onClose()
                    } else {
                        toast.error(error?.message || 'Failed to update participants')
                    }
                }
            })
        )
    }

    const isExistingMember = (userId: number) => {
        return existingMembers.some(m => m.user_id === userId)
    }

    const isLoading = loadingUsers || loadingMembers

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle className='flex justify-between items-center'>
                Add Participant
                <IconButton size='small' onClick={onClose}>
                    <i className='ri-close-line text-2xl' />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <div className='flex flex-col gap-4 pt-2'>
                    {/* Existing Members */}
                    {/* {existingMembers.length > 0 && (
                        <div>
                            <Typography variant='caption' color='text.disabled' className='uppercase mbe-2 block'>
                                Current Members ({existingMembers.length})
                            </Typography>
                            <div className='flex flex-wrap gap-1'>
                                {existingMembers.map(member => (
                                    <Chip
                                        key={member.user_id}
                                        avatar={
                                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                                {member.name?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                        }
                                        label={member.name}
                                        size='small'
                                        color='primary'
                                        variant='tonal'
                                    />
                                ))}
                            </div>
                            <Divider className='mbs-3' />
                        </div>
                    )} */}

                    {/* Select Participants */}
                    <FormControl fullWidth>
                        <InputLabel>Select Participants</InputLabel>
                        <Select
                            multiple
                            value={selectedUserIds}
                            onChange={handleUserChange}
                            input={<OutlinedInput label='Select Participants' />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {(selected as number[]).map(id => {
                                        const user = allUsers.find(u => u.user_id === id) || existingMembers.find(m => m.user_id === id)
                                        const isMember = isExistingMember(id)

                                        return (
                                            <Chip
                                                key={id}
                                                label={user?.name || id}
                                                size='small'
                                                color={isMember ? 'primary' : 'default'}
                                                variant={isMember ? 'tonal' : 'outlined'}
                                                onDelete={
                                                    !isMember
                                                        ? () => setSelectedUserIds(prev => prev.filter(uid => uid !== id))
                                                        : undefined
                                                }
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
                            {isLoading ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} className='mr-2' />
                                    Loading users...
                                </MenuItem>
                            ) : (
                                allUsers.map(user => (
                                    <MenuItem key={user.user_id} value={user.user_id}>
                                        <Checkbox checked={selectedUserIds.includes(user.user_id)} />
                                        <ListItemText primary={user.name} />
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
                <Button variant='contained' onClick={handleSubmit} disabled={saving || isLoading}>
                    {saving ? <CircularProgress size={22} color='inherit' /> : 'Save Participants'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddParticipantModal
