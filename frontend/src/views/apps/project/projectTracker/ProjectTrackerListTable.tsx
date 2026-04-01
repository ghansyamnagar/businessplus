
'use client'

import { useEffect, useState, useMemo, type MouseEvent } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import classnames from 'classnames'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { exportPdfRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'
import type { AppDispatch } from '@/redux-store'
import type { ProjectType } from '@/redux-store/slices/project/project.types'
import { getProjectListRequest, deleteProjectRequest } from '@/redux-store/slices/project/project.slice'
import type { DepartmentType } from '@/types/apps/departmentTypes'
import { getDepartmentListRequest, getUserListRequest } from '@/redux-store/slices/user/user.slice'
import { getSelectModulesRequest } from '@/redux-store/slices/master/master.slice'

import tableStyles from '@core/styles/table.module.css'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
import { useModulePermission } from '@/hooks/useModulePermission'
import ChangeStatusModal from './ChangeStatusModal'

const DebouncedInput = ({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
} & Omit<any, 'onChange'>) => {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const columnHelper = createColumnHelper<ProjectType>()

const ProjectTrackerListTable = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { data: session } = useSession()
    const router = useRouter()
    const { lang } = useParams()
    const [data, setData] = useState<ProjectType[]>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [totalCount, setTotalCount] = useState(0)

    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    // Action menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [menuRow, setMenuRow] = useState<ProjectType | null>(null)
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null)
    const openMenu = Boolean(anchorEl)

    const handleMenuOpen = (event: MouseEvent<HTMLElement>, row: ProjectType) => {
        setAnchorEl(event.currentTarget)
        setMenuRow(row)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setMenuRow(null)
    }

    // Change Status modal state
    const [openChangeStatus, setOpenChangeStatus] = useState(false)
    const [changeStatusProjectId, setChangeStatusProjectId] = useState<number | null>(null)
    const [changeStatusCurrentId, setChangeStatusCurrentId] = useState<number | null>(null)

    // Filters
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [statuses, setStatuses] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [filterUnit, setFilterUnit] = useState((session?.user as any)?.unit_selected?.id || '')
    const [filterDept, setFilterDept] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [projectLeader, setProjectLeader] = useState('')

    const projectTrackerPermission = useModulePermission('Project_Trackers')
    const projectHistoriesPermission = useModulePermission('Project_histories')


    useEffect(() => {
        if (session?.user) {
            const unitId = (session.user as any)?.unit_selected?.id
            if (unitId) setFilterUnit(String(unitId))
        }
    }, [session])

    const fetchProjects = () => {
        setLoading(true)
        dispatch(getProjectListRequest({
            payload: {
                search: globalFilter,
                unit_id: filterUnit || "",
                dept_id: filterDept || "",
                status_id: filterStatus || "",
                start_date: startDate ? startDate.toISOString().split('T')[0] : "",
                end_date: endDate ? endDate.toISOString().split('T')[0] : "",
                project_leader: projectLeader || "",
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize
            },
            callback: (response: any) => {
                if (response?.status === 'success') {
                    setData(response.data)
                    setTotalCount(response.total_count || response.data.length)
                } else {
                    setData([])
                    setTotalCount(0)
                }
                setLoading(false)
            }
        }))
    }

    useEffect(() => {
        if (session) {
            fetchProjects()
        }
    }, [dispatch, globalFilter, filterUnit, filterDept, filterStatus, startDate, endDate, projectLeader, pagination.pageIndex, pagination.pageSize, session])

    // Fetch Initial Data (Statuses, Users)
    useEffect(() => {
        dispatch(getSelectModulesRequest({
            payload: {},
            callback: (res: any) => {
                if (res?.status === 'success') {
                    setStatuses(res?.data?.status || [])
                }
            }
        }))

        dispatch(getUserListRequest({
            payload: {},
            callback: (res: any) => {
                if (res?.status === 'success') {
                    setUsers(res.data || [])
                }
            }
        }))
    }, [dispatch])

    // Filter Departments
    useEffect(() => {
        if (filterUnit) {
            dispatch(getDepartmentListRequest({
                payload: { unit_id: filterUnit },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setDepartments(response.data)
                    } else {
                        setDepartments([])
                    }
                }
            }))
        } else {
            setDepartments([])
        }
    }, [filterUnit, dispatch])

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'warning.main'
            case 'closed': return 'success.main'
            case 'delayed': return 'error.main'
            default: return 'text.secondary'
        }
    }

    const handleDelete = (id: number) => {
        setDeleteId(id)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteProjectRequest({
                payload: { project_id: deleteId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Project deleted successfully')
                        fetchProjects()
                    } else {
                        toast.error(response?.message || 'Error deleting project')
                    }
                    setOpenDelete(false)
                    setDeleteId(null)
                }
            }))
        }
    }
    const handleDownload = (type: string) => {
        dispatch(exportPdfRequest({
            payload: {
                module: 'project',
                search: globalFilter || '',
                department: filterDept || '',
                leader: projectLeader || '',
                start_date: startDate ? startDate.toISOString().split('T')[0] : "",
                end_date: endDate ? endDate.toISOString().split('T')[0] : "",
                type: type
            },
            callback: (res, err) => {
                if (res) {
                    const blob = new Blob([res], {
                        type:
                            type === 'pdf'
                                ? 'application/pdf'
                                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    })

                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')

                    link.href = url
                    link.setAttribute(
                        'download',
                        type === 'pdf'
                            ? 'project_report.pdf'
                            : 'project_report.xlsx'
                    )

                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                } else {
                    toast.error(err?.message || 'Download failed')
                }
            }
        }))
    }

    const columns = useMemo<ColumnDef<ProjectType, any>[]>(
        () => [
            columnHelper.accessor('project_id', {
                header: 'Sr.No.',
                cell: info => <Typography>{pagination.pageIndex * pagination.pageSize + info.row.index + 1}</Typography>
            }),
            columnHelper.accessor('project_name', {
                header: 'Project Name',
                cell: info => <Typography color='text.primary' className='font-medium'>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('dept_name', {
                header: 'Department',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('leader_name', {
                header: 'Project Leader',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('start_date', {
                header: 'Start',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('end_date', {
                header: 'Finish',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),

            columnHelper.accessor('project_duration', {
                header: 'Total duration',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('project_cost', {
                header: 'Total project cost',
                cell: info => <Typography>{info.row.original.currency}{info.getValue()}</Typography>
            }),

            columnHelper.accessor('status_name', {
                header: 'Status',
                cell: info => {
                    const row = info.row.original
                    const isDraft = row.status_name?.toLowerCase() === 'draft' || (row.project_step_id && row.project_step_id < 5)
                    return (
                        <Typography
                            variant='body2'
                            className='font-bold'
                            sx={{
                                color: getStatusColor(info.getValue()),
                                ...(isDraft ? { cursor: 'pointer', textDecoration: 'underline', '&:hover': { opacity: 0.8 } } : {})
                            }}
                            onClick={() => {
                                if (isDraft) {
                                    router.push(`/${lang}/apps/project/newProject?edit=${row.project_id}&step=${row.project_step_id}`)
                                }
                            }}
                        >
                            {info.getValue()}
                        </Typography>
                    )
                }
            }),
            columnHelper.display({
                id: 'action',
                header: 'Action',
                cell: ({ row }) => (
                    <IconButton size='small' onClick={(e) => handleMenuOpen(e, row.original)}>
                        <i className='ri-more-2-fill text-textSecondary' />
                    </IconButton>
                ),
                enableSorting: false
            })
        ],
        [pagination.pageIndex, pagination.pageSize, projectTrackerPermission]
    )

    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualFiltering: true,
        rowCount: totalCount,
        filterFns: {
            fuzzy: () => false
        },
        state: {
            globalFilter,
            pagination
        },
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getCoreRowModel(), // manual filtering
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    if (projectTrackerPermission && projectTrackerPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Projects List' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Projects.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader title='Projects List' />
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search Project'
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={filterDept}
                                label='Department'
                                onChange={e => setFilterDept(e.target.value)}
                                disabled={!filterUnit}
                                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                            >
                                <MenuItem value=''>All</MenuItem>
                                {departments.map(dept => (
                                    <MenuItem key={dept.dept_id} value={String(dept.dept_id)}>
                                        {dept.dept_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label='Status'
                                onChange={e => setFilterStatus(e.target.value)}
                                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                            >
                                <MenuItem value=''>All</MenuItem>
                                {statuses.map(status => (
                                    <MenuItem key={status.id} value={String(status.id)}>
                                        {status.status_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Project Leader</InputLabel>
                            <Select
                                value={projectLeader}
                                label='Project Leader'
                                onChange={e => setProjectLeader(e.target.value)}
                                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                            >
                                <MenuItem value=''>All</MenuItem>
                                {users.map(user => (
                                    <MenuItem key={user.user_id} value={String(user.user_id)}>
                                        {user.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                        <AppReactDatepicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={50}
                            customInput={
                                <TextField
                                    fullWidth
                                    size='small'
                                    label='Start Date'
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    <i className='ri-calendar-line text-xs text-textSecondary' />
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />
                            }
                            placeholderText='Start Date'
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                        <AppReactDatepicker
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={50}
                            customInput={
                                <TextField
                                    fullWidth
                                    size='small'
                                    label='End Date'
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    <i className='ri-calendar-line text-xs text-textSecondary' />
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />
                            }
                            placeholderText='End Date'
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Button
                            variant='outlined'
                            color='secondary'
                            fullWidth
                            onClick={() => {
                                setGlobalFilter('')
                                setFilterDept('')
                                setFilterStatus('')
                                setStartDate(null)
                                setEndDate(null)
                                setProjectLeader('')
                            }}
                        >
                            Reset
                        </Button>
                    </Grid>
                    <Grid>
                        <Tooltip title="Download pdf/excel" placement="top" arrow>
                            <IconButton
                                color="primary"
                                onClick={(e) => setDownloadAnchorEl(e.currentTarget)}
                            >
                                <i className='ri-download-2-line' />
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={downloadAnchorEl}
                            open={Boolean(downloadAnchorEl)}
                            onClose={() => setDownloadAnchorEl(null)}
                        >
                            <MenuItem
                                onClick={() => {
                                    handleDownload('pdf')
                                    setDownloadAnchorEl(null)
                                }}
                            >
                                PDF
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    handleDownload('excel')
                                    setDownloadAnchorEl(null)
                                }}
                            >
                                Excel
                            </MenuItem>
                        </Menu>
                    </Grid>
                </Grid>

                <div className='overflow-x-auto'>
                    <table className={tableStyles.table}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={classnames({
                                                        'flex items-center': header.column.getIsSorted(),
                                                        'cursor-pointer select-none': header.column.getCanSort()
                                                    })}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: <i className='ri-arrow-up-s-line text-xl' />,
                                                        desc: <i className='ri-arrow-down-s-line text-xl' />
                                                    }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        {loading ? (
                            <tbody>
                                <tr>
                                    <td colSpan={table.getVisibleFlatColumns().length}>
                                        <Box p={4} textAlign='center'>
                                            <CircularProgress />
                                        </Box>
                                    </td>
                                </tr>
                            </tbody>
                        ) : data.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                                        No data available
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {table
                                    .getRowModel()
                                    .rows.slice(0, table.getState().pagination.pageSize)
                                    .map(row => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                            </tbody>
                        )}
                    </table>
                </div>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component='div'
                    count={totalCount}
                    rowsPerPage={pagination.pageSize}
                    page={pagination.pageIndex}
                    onPageChange={(_, page) => table.setPageIndex(page)}
                    onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
                />
            </Card>
            <ConfirmationPopup
                open={openDelete}
                setOpen={setOpenDelete}
                title='Are you sure you want to delete this Project?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { minWidth: 180 } } }}
            >
                {projectTrackerPermission?.acc_edit === 1 && (
                    <MenuItem onClick={() => { if (menuRow) router.push(`/${lang}/apps/project/newProject?edit=${menuRow.project_id}&step=${menuRow.project_step_id}`); handleMenuClose(); }}>
                        <ListItemIcon><i className='ri-edit-box-line' /></ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                )}
                {projectTrackerPermission?.acc_delete === 1 && (
                    <MenuItem onClick={() => { if (menuRow) handleDelete(menuRow.project_id); handleMenuClose(); }}>
                        <ListItemIcon><i className='ri-delete-bin-7-line' /></ListItemIcon>
                        <ListItemText>Remove</ListItemText>
                    </MenuItem>
                )}
                {projectHistoriesPermission?.acc_edit === 1 && (
                    <MenuItem onClick={() => { if (menuRow) { setChangeStatusProjectId(menuRow.project_id); setChangeStatusCurrentId(menuRow.status_id); setOpenChangeStatus(true); } handleMenuClose(); }}>
                        <ListItemIcon><i className='ri-exchange-line' /></ListItemIcon>
                        <ListItemText>Change Status</ListItemText>
                    </MenuItem>
                )}
                {projectHistoriesPermission?.acc_view === 1 && (
                    <MenuItem onClick={() => { if (menuRow) router.push(`/${lang}/apps/project/projectRemark/${menuRow.project_id}`); handleMenuClose(); }}>
                        <ListItemIcon><i className='ri-chat-3-line' /></ListItemIcon>
                        <ListItemText>Project Remarks</ListItemText>
                    </MenuItem>
                )}
                {projectTrackerPermission?.acc_view === 1 && (
                    <MenuItem onClick={() => { if (menuRow) router.push(`/${lang}/apps/project/singleProjectDetials/${menuRow.project_id}`); handleMenuClose(); }}>
                        <ListItemIcon><i className='ri-eye-line' /></ListItemIcon>
                        <ListItemText>View Details</ListItemText>
                    </MenuItem>
                )}
            </Menu>

            {/* Change Status Modal */}
            <ChangeStatusModal
                open={openChangeStatus}
                onClose={() => { setOpenChangeStatus(false); setChangeStatusProjectId(null); setChangeStatusCurrentId(null) }}
                projectId={changeStatusProjectId}
                currentStatusId={changeStatusCurrentId}
                statuses={statuses}
                onSuccess={fetchProjects}
            />
        </>
    )
}

export default ProjectTrackerListTable
