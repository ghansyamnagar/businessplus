'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, minLength } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import TablePagination from '@mui/material/TablePagination'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Third-party Imports
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Slice Imports
import {
    viewStrengthRequest, addStrengthRequest, updateStrengthRequest, deleteStrengthRequest,
    viewWeaknessesRequest, addWeaknessesRequest, updateWeaknessesRequest, deleteWeaknessesRequest,
    viewOpportunitiesRequest, addOpportunitiesRequest, updateOpportunitiesRequest, deleteOpportunitiesRequest,
    viewThreatsRequest, addThreatsRequest, updateThreatsRequest, deleteThreatsRequest
} from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'

// Component Imports
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useSession } from 'next-auth/react'
import { useModulePermission } from '@/hooks/useModulePermission'
// ─── Tab Configuration ──────────────────────────────────────────────────────

type SwotCategory = 'strength' | 'weaknesses' | 'opportunities' | 'threats'

interface TabConfig {
    key: SwotCategory
    label: string
    idField: string
    nameField: string
    color: string
    viewAction: any
    addAction: any
    updateAction: any
    deleteAction: any
}

const SWOT_TABS: TabConfig[] = [
    {
        key: 'strength',
        label: 'Strength',
        idField: 'strength_id',
        nameField: 'strength',
        color: '#00bcd4',
        viewAction: viewStrengthRequest,
        addAction: addStrengthRequest,
        updateAction: updateStrengthRequest,
        deleteAction: deleteStrengthRequest
    },
    {
        key: 'weaknesses',
        label: 'Weaknesses',
        idField: 'weaknesses_id',
        nameField: 'weaknesses',
        color: '#ff9800',
        viewAction: viewWeaknessesRequest,
        addAction: addWeaknessesRequest,
        updateAction: updateWeaknessesRequest,
        deleteAction: deleteWeaknessesRequest
    },
    {
        key: 'opportunities',
        label: 'Opportunities',
        idField: 'opportunities_id',
        nameField: 'opportunities',
        color: '#4caf50',
        viewAction: viewOpportunitiesRequest,
        addAction: addOpportunitiesRequest,
        updateAction: updateOpportunitiesRequest,
        deleteAction: deleteOpportunitiesRequest
    },
    {
        key: 'threats',
        label: 'Threats',
        idField: 'threats_id',
        nameField: 'threats',
        color: '#f44336',
        viewAction: viewThreatsRequest,
        addAction: addThreatsRequest,
        updateAction: updateThreatsRequest,
        deleteAction: deleteThreatsRequest
    }
]

// ─── Add/Edit Modal Schema ──────────────────────────────────────────────────

const schema = object({
    name: pipe(string(), nonEmpty('This field is required'), minLength(1)),
    keywords: pipe(string(), nonEmpty('Keywords are required'), minLength(1))
})

type FormData = InferInput<typeof schema>

// ─── Add/Edit Modal ─────────────────────────────────────────────────────────

interface AddEditSwotModalProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    tabConfig: TabConfig
    editData?: any
    startDate: string
    endDate: string
}

const AddEditSwotModal = ({ open, handleClose, tabConfig, editData, startDate, endDate }: AddEditSwotModalProps) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)

    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: valibotResolver(schema),
        defaultValues: { name: '', keywords: '' }
    })



    useEffect(() => {
        if (!open) return

        if (editData) {
            reset({
                name: editData[tabConfig.nameField] || '',
                keywords: editData.keywords || ''
            })
        } else {
            reset({ name: '', keywords: '' })
        }
    }, [open, editData])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset({ name: '', keywords: '' })
    }

    const onSubmit: SubmitHandler<FormData> = (formData) => {
        setLoading(true)

        if (editData) {
            // Update
            const payload: any = {
                [tabConfig.nameField]: formData.name,
                keywords: formData.keywords,
                [tabConfig.idField]: editData[tabConfig.idField],
                start_date: startDate,
                end_date: endDate
            }

            dispatch(tabConfig.updateAction({
                payload,
                callback: (response: any, error: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || `${tabConfig.label} updated successfully`)
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || `Error updating ${tabConfig.label}`)
                    }
                    setLoading(false)
                }
            }))
        } else {
            // Add
            const payload: any = {
                [tabConfig.nameField]: formData.name,
                keywords: formData.keywords,
                start_date: startDate,
                end_date: endDate
            }

            dispatch(tabConfig.addAction({
                payload,
                callback: (response: any, error: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || `${tabConfig.label} added successfully`)
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || `Error adding ${tabConfig.label}`)
                    }
                    setLoading(false)
                }
            }))
        }
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={() => handleDialogClose(false)}
            maxWidth={false}
            scroll='body'
            PaperProps={{ className: 'max-is-[600px]' }}
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>
                    {editData ? 'Edit' : 'Add'} {tabConfig.label}
                </div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='name'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label={tabConfig.label}
                                        placeholder={`Enter ${tabConfig.label.toLowerCase()}`}
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='keywords'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Keywords'
                                        placeholder='Enter keywords'
                                        error={!!errors.keywords}
                                        helperText={errors.keywords?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[120px]'>
                        {loading ? <CircularProgress size={22} color='inherit' /> : editData ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' type='reset' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// ─── SWOT Table for Each Tab ────────────────────────────────────────────────

interface SwotTableProps {
    tabConfig: TabConfig
    startDate: string
    endDate: string
    permissions: any
}

const SwotTable = ({ tabConfig, startDate, endDate, permissions }: SwotTableProps) => {
    const dispatch = useDispatch()

    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searchFilter, setSearchFilter] = useState('')

    // Modal state
    const [addEditOpen, setAddEditOpen] = useState(false)
    const [editData, setEditData] = useState<any>(undefined)

    // Delete confirmation state
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    // Pagination state
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const fetchData = () => {
        setLoading(true)

        dispatch(tabConfig.viewAction({
            payload: {},
            callback: (response: any) => {
                if (response?.status === 'success') {
                    setData(response.data || [])
                }
                setLoading(false)
            }
        }))
    }

    useEffect(() => {
        fetchData()
    }, [startDate, endDate])

    const handleDelete = (id: number) => {
        setDeleteId(id)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(tabConfig.deleteAction({
                payload: { [tabConfig.idField]: deleteId },
                callback: (response: any, error: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || `${tabConfig.label} deleted successfully`)
                        fetchData()
                    } else {
                        toast.error(response?.message || `Error deleting ${tabConfig.label}`)
                    }
                }
            }))
        }
    }

    const handleCloseAddEdit = (refresh: boolean) => {
        setAddEditOpen(false)
        setEditData(undefined)
        if (refresh) fetchData()
    }

    // Filter data by search
    const filteredData = data.filter(item => {
        if (!searchFilter) return true
        const nameVal = (item[tabConfig.nameField] || '').toLowerCase()
        const keywordsVal = (item.keywords || '').toLowerCase()
        const search = searchFilter.toLowerCase()
        return nameVal.includes(search) || keywordsVal.includes(search)
    })

    // Paginated data
    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

    return (
        <>
            <Grid container spacing={4} className='p-3'>
                <Grid size={{ xs: 24, sm: 6 }} className='flex items-center justify-between gap-2 w-full'>
                    <TextField
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        placeholder='Search'
                        size='small'
                        className='max-is-[200px]'
                    />
                    {permissions?.acc_create === 1 && (
                        <Button
                            variant='contained'
                            onClick={() => {
                                setEditData(undefined)
                                setAddEditOpen(true)
                            }}
                        >
                            Add {tabConfig.label}
                        </Button>
                    )}
                </Grid>
            </Grid>
            <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                    <thead>
                        <tr>
                            <th>Sr.No.</th>
                            <th>{tabConfig.label}</th>
                            <th>Keywords</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    {loading ? (
                        <tbody>
                            <tr>
                                <td colSpan={4}>
                                    <Box p={4} textAlign='center'>
                                        <CircularProgress />
                                    </Box>
                                </td>
                            </tr>
                        </tbody>
                    ) : filteredData.length === 0 ? (
                        <tbody>
                            <tr>
                                <td colSpan={4} className='text-center'>
                                    No data available
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {paginatedData.map((item, index) => (
                                <tr key={item[tabConfig.idField]}>
                                    <td>
                                        <Typography>{page * rowsPerPage + index + 1}</Typography>
                                    </td>
                                    <td>
                                        <Typography color='text.primary' className='font-medium'>
                                            {item[tabConfig.nameField]}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Typography color='text.secondary'>
                                            {item.keywords}
                                        </Typography>
                                    </td>
                                    <td>
                                        <div className='flex items-center gap-0.5'>
                                            {permissions?.acc_edit === 1 && (
                                                <IconButton
                                                    size='small'
                                                    onClick={() => {
                                                        setEditData(item)
                                                        setAddEditOpen(true)
                                                    }}
                                                >
                                                    <i className='ri-edit-box-line text-textSecondary' />
                                                </IconButton>
                                            )}
                                            {permissions?.acc_delete === 1 && (
                                                <IconButton
                                                    size='small'
                                                    onClick={() => handleDelete(item[tabConfig.idField])}
                                                >
                                                    <i className='ri-delete-bin-7-line text-textSecondary' />
                                                </IconButton>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component='div'
                className='border-bs'
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                    inputProps: { 'aria-label': 'rows per page' }
                }}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={e => {
                    setRowsPerPage(parseInt(e.target.value, 10))
                    setPage(0)
                }}
            />

            <AddEditSwotModal
                open={addEditOpen}
                handleClose={handleCloseAddEdit}
                tabConfig={tabConfig}
                editData={editData}
                startDate={startDate}
                endDate={endDate}
            />

            <ConfirmationPopup
                open={openDelete}
                setOpen={setOpenDelete}
                title={`Are you sure you want to delete this ${tabConfig.label}?`}
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
        </>
    )
}

// ─── Main SWOT Component ────────────────────────────────────────────────────

const Swot = () => {
    const { data: session } = useSession();

    const selectedYear = (session?.user as any)?.userSelectedYear
    const [activeTab, setActiveTab] = useState<string>('strength')

    // Compute start_date and end_date for the current year
    const year = selectedYear || new Date().getFullYear()
    // const currentYear = new Date().getFullYear()
    const startDate = `01-01-${year}`
    const endDate = `31-12-${year}`

    const swotPermission = useModulePermission('Swot_analyses')

    if (swotPermission && swotPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='SWOT Analysis' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view SWOT Analysis.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader title='SWOT Analysis' className='pbe-4' />
            <Divider />
            <TabContext value={activeTab}>
                <TabList
                    onChange={(_, value) => setActiveTab(value)}
                    variant='scrollable'
                    scrollButtons='auto'
                    className='pli-4'
                >
                    {SWOT_TABS.map(tab => (
                        <Tab
                            key={tab.key}
                            label={tab.label}
                            value={tab.key}
                        />
                    ))}
                </TabList>
                <Divider />
                {SWOT_TABS.map(tab => (
                    <TabPanel key={tab.key} value={tab.key} className='p-0'>
                        <SwotTable
                            tabConfig={tab}
                            startDate={startDate}
                            endDate={endDate}
                            permissions={swotPermission}
                        />
                    </TabPanel>
                ))}
            </TabContext>
        </Card>
    )
}

export default Swot
