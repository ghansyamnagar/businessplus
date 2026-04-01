'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// Third-party Imports
import { toast } from 'react-toastify'

// Redux Imports
import { useDispatch } from 'react-redux'
import {
    viewProfileJoinedGroupRequest,
    profileDeleteGroupRequest
} from '@/redux-store/slices/auth/auth.slice'

// Component Imports
import CreateGroupModal from './CreateGroupModal'
import EditGroupModal from './EditGroupModal'
import AddParticipantModal from './AddParticipantModal'

type GroupUser = {
    user_id: number
    name: string
}

type JoinedGroup = {
    id: number
    deleted_at: string | null
    created_at: string
    updated_at: string | null
    login_access_token: string
    admin_id: string
    group_name: string
    group_description: string
    company_id: number
    file: string
    users_id: GroupUser[]
}

const JoinedGroups = () => {
    const dispatch = useDispatch()

    const [groups, setGroups] = useState<JoinedGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [menuGroupId, setMenuGroupId] = useState<number | null>(null)
    const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editGroupId, setEditGroupId] = useState<number | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [addParticipantModalOpen, setAddParticipantModalOpen] = useState(false)
    const [addParticipantGroupId, setAddParticipantGroupId] = useState<number | null>(null)

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = () => {
        setLoading(true)

        dispatch(
            viewProfileJoinedGroupRequest({
                payload: {},
                callback: (response: any, error: any) => {
                    setLoading(false)

                    if (response && !error && response?.status === 'success') {
                        setGroups(response.data || [])
                    }
                }
            })
        )
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, groupId: number) => {
        setAnchorEl(event.currentTarget)
        setMenuGroupId(groupId)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setMenuGroupId(null)
    }

    const handleEditGroup = () => {
        setEditGroupId(menuGroupId)
        setEditModalOpen(true)
        handleMenuClose()
    }

    const handleDeleteGroup = () => {
        setDeleteGroupId(menuGroupId)
        setDeleteDialogOpen(true)
        handleMenuClose()
    }

    const confirmDeleteGroup = () => {
        if (!deleteGroupId) return

        setDeleting(true)

        dispatch(
            profileDeleteGroupRequest({
                payload: { group_id: deleteGroupId },
                callback: (response: any, error: any) => {
                    setDeleting(false)
                    setDeleteDialogOpen(false)
                    setDeleteGroupId(null)

                    if (response && !error) {
                        toast.success(response?.message || 'Group deleted successfully')
                        fetchGroups()
                    } else {
                        toast.error(error?.message || 'Failed to delete group')
                    }
                }
            })
        )
    }

    const handleAddParticipant = () => {
        setAddParticipantGroupId(menuGroupId)
        setAddParticipantModalOpen(true)
        handleMenuClose()
    }

    const toggleExpand = (groupId: number) => {
        setExpandedGroupId(expandedGroupId === groupId ? null : groupId)
    }

    const getInitials = (name: string) => {
        return name?.charAt(0)?.toUpperCase() || 'G'
    }

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={30} />
                    </Box>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardContent>
                    {/* Header */}
                    <div className='flex justify-between items-center mbe-4'>
                        <Typography variant='h6' className='flex items-center gap-2'>
                            <i className='ri-group-line text-xl' />
                            Joined Groups
                        </Typography>
                        <Button
                            variant='outlined'
                            size='small'
                            startIcon={<i className='ri-add-line' />}
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Create Group
                        </Button>
                    </div>

                    <Divider className='mbe-4' />

                    {groups.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <i className='ri-group-line text-4xl' style={{ opacity: 0.3 }} />
                            <Typography color='text.secondary' className='mbs-2'>
                                No groups joined yet
                            </Typography>
                        </Box>
                    ) : (
                        <div className='flex flex-col gap-3'>
                            {groups.map(group => (
                                <div key={group.id}>
                                    <div
                                        className='flex items-center gap-3 p-3 rounded-lg hover:bg-actionHover cursor-pointer transition-all'
                                        style={{ border: '1px solid var(--mui-palette-divider)' }}
                                    >
                                        {/* Avatar */}
                                        <Avatar
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                bgcolor: 'var(--mui-palette-primary-main)',
                                                fontSize: '1.1rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            {getInitials(group.group_name)}
                                        </Avatar>

                                        {/* Group Info */}
                                        <div
                                            className='flex-1 min-w-0 cursor-pointer'
                                            onClick={() => toggleExpand(group.id)}
                                        >
                                            <Typography className='font-medium truncate'>
                                                {group.group_name}
                                            </Typography>
                                            <Typography variant='body2' color='text.secondary'>
                                                {group.users_id?.length || 0} {group.users_id?.length === 1 ? 'person' : 'people'}
                                            </Typography>
                                        </div>

                                        {/* More menu */}
                                        <IconButton
                                            size='small'
                                            onClick={e => handleMenuOpen(e, group.id)}
                                        >
                                            <i className='ri-more-2-fill' />
                                        </IconButton>
                                    </div>

                                    {/* Expandable Members List */}
                                    <Collapse in={expandedGroupId === group.id}>
                                        <div className='pli-4 pbs-2 pbe-3'>
                                            {group.group_description && (
                                                <Typography variant='body2' color='text.secondary' className='mbe-2'>
                                                    {group.group_description}
                                                </Typography>
                                            )}
                                            <Typography variant='caption' color='text.disabled' className='uppercase mbe-2 block'>
                                                Members
                                            </Typography>
                                            <div className='flex flex-wrap gap-1'>
                                                {group.users_id?.map(user => (
                                                    <Chip
                                                        key={user.user_id}
                                                        avatar={
                                                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                                                {user.name?.charAt(0)?.toUpperCase()}
                                                            </Avatar>
                                                        }
                                                        label={user.name}
                                                        size='small'
                                                        variant='outlined'
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Context Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={handleEditGroup}>
                            <ListItemIcon>
                                <i className='ri-edit-line text-xl' />
                            </ListItemIcon>
                            <ListItemText>Edit Group</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDeleteGroup}>
                            <ListItemIcon>
                                <i className='ri-delete-bin-line text-xl' />
                            </ListItemIcon>
                            <ListItemText>Delete Group</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleAddParticipant}>
                            <ListItemIcon>
                                <i className='ri-user-add-line text-xl' />
                            </ListItemIcon>
                            <ListItemText>Add Participant</ListItemText>
                        </MenuItem>
                    </Menu>
                </CardContent>
            </Card>

            {/* Create Group Modal */}
            <CreateGroupModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={fetchGroups}
            />

            {/* Edit Group Modal */}
            <EditGroupModal
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false)
                    setEditGroupId(null)
                }}
                groupId={editGroupId}
                onSuccess={fetchGroups}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false)
                    setDeleteGroupId(null)
                }}
            >
                <DialogTitle>Delete Group</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this group? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant='outlined'
                        color='secondary'
                        onClick={() => {
                            setDeleteDialogOpen(false)
                            setDeleteGroupId(null)
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        color='error'
                        onClick={confirmDeleteGroup}
                        disabled={deleting}
                    >
                        {deleting ? <CircularProgress size={22} color='inherit' /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Participant Modal */}
            <AddParticipantModal
                open={addParticipantModalOpen}
                onClose={() => {
                    setAddParticipantModalOpen(false)
                    setAddParticipantGroupId(null)
                }}
                groupId={addParticipantGroupId}
                onSuccess={fetchGroups}
            />
        </>
    )
}

export default JoinedGroups
