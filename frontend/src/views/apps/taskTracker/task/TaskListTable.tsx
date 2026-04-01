
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import type { AppDispatch } from '@/redux-store'
import type { TaskType, TaskAssignData } from '@/redux-store/slices/taskTracker/taskTracker.types'
import { getTaskListRequest, deleteTaskRequest, getTaskDashboardRequest, exportPdfRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'
import type { DepartmentType } from '@/types/apps/departmentTypes'
import { getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'
import { getSelectModulesRequest, getPriorityListRequest } from '@/redux-store/slices/master/master.slice'

import tableStyles from '@core/styles/table.module.css'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import AddEditTask from './AddEditTask'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
import TaskStatusData from '../../dashboard/TaskStatusData'
import ChangeTaskStatusModal from './ChangeTaskStatusModal'
import { useModulePermission } from '@/hooks/useModulePermission'


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

const columnHelper = createColumnHelper<TaskType>()

const TaskListTable = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { data: session } = useSession()
    const { lang: locale } = useParams()
    const [data, setData] = useState<TaskType[]>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [totalCount, setTotalCount] = useState(0)

    const [addOpen, setAddOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<TaskType | undefined>(undefined)
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [openChangeStatus, setOpenChangeStatus] = useState(false)

    const tasksPermission = useModulePermission('Tasks')
    const tasksHistoriesPermission = useModulePermission('Task_histories')


    const [totalTaskStatusData, setTotalTaskStatusData] = useState<any[]>([])
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null)
    const openMenuAction = Boolean(anchorEl)

    // Filters
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [statuses, setStatuses] = useState<any[]>([])
    const [priorities, setPriorities] = useState<any[]>([])
    const [filterUnit, setFilterUnit] = useState((session?.user as any)?.unit_selected?.id || '')
    const [filterDept, setFilterDept] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterPriority, setFilterPriority] = useState('')

    useEffect(() => {
        if (session?.user) {
            const unitId = (session.user as any)?.unit_selected?.id
            if (unitId) setFilterUnit(String(unitId))
        }
    }, [session])
    const fetchTasks = () => {
        setLoading(true)
        dispatch(getTaskListRequest({
            payload: {
                search: globalFilter,
                unit_id: filterUnit || "",
                dept_id: filterDept || "",
                status_id: filterStatus || "",
                priority_id: filterPriority || "",
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

    const fetchTaskDashboard = () => {
        dispatch(getTaskDashboardRequest({
            payload: {
                unit_id: filterUnit || "",
                dept_id: filterDept || "",
            },
            callback: (response: any) => {
                const cardData = [
                    {
                        title: 'Total Task',
                        stats: response?.data?.task_data?.total || 0,
                        trendNumber: 18.2,
                        avatarIcon: 'ri-file-list-3-line',
                        color: 'primary'
                    },
                    {
                        title: 'Closed Task',
                        stats: response?.data?.task_data?.closed || 0,
                        trendNumber: -8.7,
                        avatarIcon: 'ri-check-double-line',
                        color: 'success'
                    },
                    {
                        title: 'WIP Task',
                        stats: response?.data?.task_data?.open || 0,
                        trendNumber: 4.3,
                        avatarIcon: 'ri-hourglass-line',
                        color: 'info'
                    },
                    {
                        title: 'Delayed Task',
                        stats: response?.data?.task_data?.delayed || 0,
                        trendNumber: 2.5,
                        avatarIcon: 'ri-alarm-warning-line',
                        color: 'error'
                    },
                    {
                        title: 'Closed With Delay',
                        stats: response?.data?.task_data?.closedWithDelay || 0,
                        trendNumber: 2.5,
                        avatarIcon: 'ri-calendar-check-line',
                        color: 'warning'
                    },
                    {
                        title: 'Hold Task',
                        stats: response?.data?.task_data?.onHold || 0,
                        trendNumber: 2.5,
                        avatarIcon: 'ri-pause-circle-line',
                        color: 'secondary'
                    }
                ]
                setTotalTaskStatusData(cardData)
            }
        }))
    }

    useEffect(() => {
        if (session) {
            fetchTasks()
            fetchTaskDashboard()
        }
    }, [dispatch, globalFilter, filterUnit, filterDept, filterStatus, filterPriority, pagination.pageIndex, pagination.pageSize, session])

    // Fetch Initial Data (Statuses)
    useEffect(() => {
        dispatch(getSelectModulesRequest({
            payload: {},
            callback: (res) => {
                if (res?.status === 'success') {
                    setStatuses(res?.data?.status || [])
                }
            }
        }))

        dispatch(getPriorityListRequest({
            payload: {},
            callback: (res) => {
                if (res?.status === 'success') {
                    setPriorities(res.data || [])
                }
            }
        }))
    }, [dispatch])

    // Filter Departments
    useEffect(() => {
        setFilterDept('')

        if (filterUnit) {
            dispatch(getDepartmentListRequest({
                payload: { unit_id: filterUnit },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setDepartments(response.data.filter((dept: DepartmentType) => String(dept.unit_id) === filterUnit))
                    } else {
                        setDepartments([])
                    }
                }
            }))
        } else {
            setDepartments([])
        }
    }, [filterUnit, dispatch])

    const handleCloseAddEdit = (refresh: boolean) => {
        setAddOpen(false)
        if (refresh) fetchTasks()
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: TaskType) => {
        setAnchorEl(event.currentTarget)
        setSelectedItem(row)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleDelete = (id: number) => {
        setDeleteId(id)
        setOpenDelete(true)
        handleMenuClose()
    }

    const handleEdit = () => {
        setAddOpen(true)
        handleMenuClose()
    }

    const handleOpenChangeStatus = () => {
        setOpenChangeStatus(true)
        handleMenuClose()
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteTaskRequest({
                payload: { task_id: deleteId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Deleted successfully')
                        fetchTasks()
                    } else {
                        toast.error(response?.message || 'Error deleting')
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
                module: 'task',
                search: globalFilter || '',
                department: filterDept || '',
                status: filterStatus || '',
                priority: filterPriority || '',
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
                            ? 'task_report.pdf'
                            : 'task_report.xlsx'
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

    const columns = useMemo<ColumnDef<TaskType, any>[]>(
        () => [
            columnHelper.accessor('id', {
                header: 'Sr.No.',
                cell: info => <Typography>{pagination.pageIndex * pagination.pageSize + info.row.index + 1}</Typography>
            }),
            columnHelper.accessor('priority_name', {
                header: 'Priority',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('task_name', {
                header: 'Task Name',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('event_name', {
                header: 'Event Name',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('dept_name', {
                header: 'Department',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('task_owaner_name', {
                header: 'Task Owner',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('task_assigns_data', {
                header: 'Co-Owner',
                cell: info => {
                    const assignees = info.getValue()
                    if (!assignees || assignees.length === 0) return <Typography className='p-2'>-</Typography>

                    return (
                        <div className='flex flex-col -mx-2.5 -my-2.5'>
                            {assignees.map((assignee: TaskAssignData, index: number) => (
                                <div
                                    key={index}
                                    className={classnames('px-2.5 py-1.5', {
                                        'border-be': index !== assignees.length - 1
                                    })}
                                >
                                    <Typography variant='body2'>{assignee.name}</Typography>
                                </div>
                            ))}
                        </div>
                    )
                }
            }),
            columnHelper.accessor('start_date', {
                header: 'Start',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('end_date', {
                header: 'Finish',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('completion_date', {
                header: 'Completion Date',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),

            columnHelper.accessor('status_name', {
                header: 'Status',
                cell: info => (
                    <Typography
                        variant='body2'
                        // className='font-bold'
                        sx={{ color: getStatusColor(info.getValue()) }}
                    >
                        {info.getValue()}
                    </Typography>
                )
            }),

            columnHelper.display({
                id: 'action',
                header: 'Action',
                cell: ({ row }) => (
                    <IconButton size='small' onClick={(e) => handleMenuOpen(e, row.original)}>
                        <i className='ri-more-fill'></i>
                    </IconButton>
                ),
                enableSorting: false
            })
        ],
        [tasksPermission, pagination.pageIndex, pagination.pageSize]
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
    if (tasksPermission && tasksPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Tasks List' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Tasks.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader title='Tasks List' action={

                    <Grid className='flex justify-end'>
                        {tasksPermission?.acc_create === 1 && (
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setSelectedItem(undefined)
                                    setAddOpen(true)
                                }}
                                fullWidth
                                className='sm:is-auto'
                            >
                                Add Task
                            </Button>
                        )}
                    </Grid>
                } />
                <Grid size={{ xs: 12 }} className='mb-4 p-2'>
                    <TaskStatusData data={totalTaskStatusData} />
                </Grid>

                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search Task'
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
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={filterPriority}
                                label='Priority'
                                onChange={e => setFilterPriority(e.target.value)}
                                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                            >
                                <MenuItem value=''>All</MenuItem>
                                {priorities.map(priority => (
                                    <MenuItem key={priority.id} value={String(priority.id)}>
                                        {priority.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid >
                        <Button
                            variant='outlined'
                            color='secondary'
                            fullWidth
                            className='sm:is-auto'
                            onClick={() => {
                                setGlobalFilter('')
                                setFilterDept('')
                                setFilterStatus('')
                                setFilterPriority('')
                            }}
                        >
                            Reset
                        </Button>

                    </Grid>
                    <Grid size={{ xs: 12, md: 'auto' }} sx={{ ml: 'auto' }}>
                        <Tooltip title="Download pdf/excel" placement="top" arrow>
                            <IconButton
                                color='primary'
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

                <div className={classnames('overflow-x-auto', tableStyles.tableContainer)}>
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
                        ) : table.getRowModel().rows.length === 0 ? (
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
            {addOpen && (
                <AddEditTask
                    open={addOpen}
                    handleClose={handleCloseAddEdit}
                    dataEdit={selectedItem}
                />
            )}
            {openDelete && (
                <ConfirmationPopup
                    open={openDelete}
                    setOpen={setOpenDelete}
                    title='Are you sure you want to delete this Task?'
                    subTitle="You won't be able to revert this!"
                    onConfirm={onConfirmDelete}
                />
            )}
            <Menu
                anchorEl={anchorEl}
                open={openMenuAction}
                onClose={handleMenuClose}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                {tasksPermission?.acc_edit === 1 && (
                    <MenuItem
                        onClick={() => {
                            handleEdit()
                        }}
                    >
                        <i className='ri-edit-box-line text-textSecondary' />
                        Edit
                    </MenuItem>
                )}
                {tasksPermission?.acc_delete === 1 && (
                    <MenuItem
                        onClick={() => {
                            if (selectedItem) handleDelete(selectedItem.id)
                        }}
                    >
                        <i className='ri-delete-bin-7-line text-textSecondary' />
                        Delete
                    </MenuItem>
                )}
                {tasksHistoriesPermission?.acc_edit === 1 && (
                    <MenuItem
                        onClick={handleOpenChangeStatus}
                    >
                        <i className='ri-checkbox-circle-line text-textSecondary' />
                        Change Status
                    </MenuItem>
                )}
                {tasksHistoriesPermission?.acc_view === 1 && (
                    <MenuItem
                        onClick={handleMenuClose}
                    >
                        <Link
                            href={getLocalizedUrl(`/apps/taskTracker/taskRemark/${selectedItem?.id}`, locale as Locale)}
                            className='flex items-center'
                        >
                            <i className='ri-eye-line text-textSecondary mr-2' />
                            Remarks
                        </Link>
                    </MenuItem>
                )}
            </Menu>
            {openChangeStatus && (
                <ChangeTaskStatusModal
                    open={openChangeStatus}
                    onClose={() => setOpenChangeStatus(false)}
                    taskId={selectedItem?.id || null}
                    statusId={selectedItem?.status_id || null}
                    statuses={statuses}
                    onSuccess={fetchTasks}
                />
            )}

        </>
    )
}

export default TaskListTable

