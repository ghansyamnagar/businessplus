'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Third-party Imports
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Slice Imports
import { getPermissionDataRequest, updateRoleModuleRequest } from '@/redux-store/slices/master/master.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type PermissionDataItem = {
    id: number
    role_id: number
    module_id: number
    acc_view: number
    acc_create: number
    acc_edit: number
    acc_delete: number
    name: string
    display_name: string
    Modules_Name: string
}

type EditPermissionModalProps = {
    open: boolean
    handleClose: (refresh: boolean) => void
    moduleId: number | null
    moduleName: string
}

const EditPermissionModal = ({ open, handleClose, moduleId, moduleName }: EditPermissionModalProps) => {
    const dispatch = useDispatch()

    const [permissions, setPermissions] = useState<PermissionDataItem[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Fetch permission data when modal opens
    useEffect(() => {
        if (!open || !moduleId) return

        setLoading(true)
        dispatch(getPermissionDataRequest({
            payload: { id: moduleId },
            callback: (response: any, error: any) => {
                if (response && response.status === 'success') {
                    setPermissions(response.data || [])
                } else {
                    toast.error(response?.message || 'Error fetching permission data')
                }
                setLoading(false)
            }
        }))
    }, [open, moduleId])

    const handleCheckboxChange = (index: number, field: 'acc_view' | 'acc_create' | 'acc_edit' | 'acc_delete') => {
        setPermissions(prev => {
            const updated = [...prev]
            updated[index] = {
                ...updated[index],
                [field]: updated[index][field] === 1 ? 0 : 1
            }
            return updated
        })
    }

    const handleSubmit = () => {
        setSaving(true)

        const modulePermissions = permissions.map(p => ({
            id: p.id,
            role_id: p.role_id,
            module_id: p.module_id,
            acc_view: p.acc_view,
            acc_create: p.acc_create,
            acc_edit: p.acc_edit,
            acc_delete: p.acc_delete
        }))

        dispatch(updateRoleModuleRequest({
            payload: { module_permissions: modulePermissions },
            callback: (response: any, error: any) => {
                if (response && response.status === 'success') {
                    toast.success(response.message || 'Permissions updated successfully')
                    handleClose(true)
                } else {
                    toast.error(response?.message || 'Error updating permissions')
                }
                setSaving(false)
            }
        }))
    }

    const handleDialogClose = () => {
        setPermissions([])
        handleClose(false)
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={handleDialogClose}
            maxWidth='md'
            scroll='body'
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>
                    Edit Permissions — {moduleName}
                </div>
            </DialogTitle>
            <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                <IconButton onClick={handleDialogClose} className='absolute block-start-4 inline-end-4'>
                    <i className='ri-close-line text-textSecondary' />
                </IconButton>

                {loading ? (
                    <Box p={4} textAlign='center'>
                        <CircularProgress />
                    </Box>
                ) : permissions.length === 0 ? (
                    <Box p={4} textAlign='center'>
                        <Typography color='text.secondary'>No permission data found</Typography>
                    </Box>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className={tableStyles.table}>
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th style={{ textAlign: 'center' }}>View</th>
                                    <th style={{ textAlign: 'center' }}>Create</th>
                                    <th style={{ textAlign: 'center' }}>Edit</th>
                                    <th style={{ textAlign: 'center' }}>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.map((perm, index) => (
                                    <tr key={perm.id}>
                                        <td>
                                            <div>
                                                <Typography className='font-medium' color='text.primary'>
                                                    {perm.display_name || perm.name}
                                                </Typography>
                                                {/* {perm.display_name && (
                                                    <Typography variant='body2' color='text.secondary'>
                                                        {perm.name}
                                                    </Typography>
                                                )} */}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Checkbox
                                                checked={perm.acc_view === 1}
                                                onChange={() => handleCheckboxChange(index, 'acc_view')}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Checkbox
                                                checked={perm.acc_create === 1}
                                                onChange={() => handleCheckboxChange(index, 'acc_create')}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Checkbox
                                                checked={perm.acc_edit === 1}
                                                onChange={() => handleCheckboxChange(index, 'acc_edit')}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Checkbox
                                                checked={perm.acc_delete === 1}
                                                onChange={() => handleCheckboxChange(index, 'acc_delete')}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DialogContent>
            <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={saving || loading || permissions.length === 0}
                    className='min-is-[120px]'
                >
                    {saving ? <CircularProgress size={22} color='inherit' /> : 'Update'}
                </Button>
                <Button variant='outlined' color='secondary' onClick={handleDialogClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EditPermissionModal
