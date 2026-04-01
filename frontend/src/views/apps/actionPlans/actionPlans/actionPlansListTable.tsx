
'use client'

// React Imports
import { useEffect, useState, useMemo, forwardRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Third-party Imports
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import classnames from 'classnames'
import { format } from 'date-fns'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Menu from '@mui/material/Menu'

// Type Imports
import type { AppDispatch } from '@/redux-store'
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { ActionPlanType } from '@/types/apps/actionPlanTypes'

// Slice Imports
import { getActionPlansListReq, deleteActionPlanReq } from '@/redux-store/slices/actionplans/actionplans.slice'
import { getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'
import { getStrategicObjectivesDashRequest, getStrObjStatusRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import { exportPdfRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'

// Component Imports
import AddEditActionPlan from './AddEditActionPlan'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import StraInitiActionTableStatus from '@/components/common/chart/StraInitiActionTableStatus'
import StraInitiActionLegendCaluculation from '@/components/common/StraInitiActionLegendCaluculation'
import CommentPopup from './CommentPopup'
import { Tooltip } from '@mui/material'
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const columnHelper = createColumnHelper<ActionPlanType>()

const ActionPlansListTable = () => {
    // eslint-disable-next-line react/display-name
    const PickersComponent = forwardRef((props: any, ref) => {
        return (
            <TextField
                inputRef={ref}
                fullWidth
                {...props}
                label={props.label || ''}
                error={props.error}
                helperText={props.helperText}
                size='small'
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position='end'>
                                <i className='ri-calendar-line text-textSecondary text-[18px]' />
                            </InputAdornment>
                        )
                    }
                }}
            />
        )
    })

    const { data: session } = useSession()
    const [openComment, setOpenComment] = useState(false)
    const [actionPlanId, setActionPlanId] = useState<number | null>(null)
    const { lang } = useParams()
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const [data, setData] = useState<ActionPlanType[]>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [strategicObjectivesDash, setStrategicObjectivesDash] = useState<any[]>([])
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [totalCount, setTotalCount] = useState(0)

    const [addOpen, setAddOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<ActionPlanType | undefined>(undefined)
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    // Filters
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [filterUnit, setFilterUnit] = useState((session?.user as any)?.unit_selected?.id || '')
    const [filterDept, setFilterDept] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [statuses, setStatuses] = useState<any[]>([])
    const [filterStartDate, setFilterStartDate] = useState('')
    const [filterEndDate, setFilterEndDate] = useState('')
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null)

    const selectedYear = (session?.user as any)?.userSelectedYear

    const actionPlanPermission = useModulePermission('Action_plans')
    const actionPlanSchedulesPermission = useModulePermission('Action_plan_schedules')

    useEffect(() => {
        if (session?.user) {
            const unitId = (session.user as any)?.unit_selected?.id
            if (unitId) setFilterUnit(String(unitId))
        }
    }, [session])

    const fetchActionPlans = () => {
        const payload: any = {
            search: globalFilter,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            deptIdFilter: filterDept || "",
            status_id: filterStatus || "",
            start_date: filterStartDate || "",
            end_date: filterEndDate || ""
        }

        setLoading(true)
        dispatch(getActionPlansListReq({
            payload,
            callback: (response: any) => {
                if (response?.data) {
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

    const fetchStrategicObjectivesDash = () => {
        dispatch(getStrategicObjectivesDashRequest({
            payload: {},
            callback: (response: any) => {
                setStrategicObjectivesDash(response?.data)
            }
        }))
    }

    useEffect(() => {
        fetchStrategicObjectivesDash()
    }, [dispatch, filterUnit, filterDept, selectedYear])

    useEffect(() => {
        fetchActionPlans()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, filterUnit, filterDept, filterStatus, filterStartDate, filterEndDate, globalFilter, pagination.pageIndex, pagination.pageSize, selectedYear])

    // Filter Departments List
    useEffect(() => {
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

    useEffect(() => {
        dispatch(getStrObjStatusRequest({
            payload: {},
            callback: (response: any) => {
                if (response?.status === 'success') {
                    setStatuses(response.data)
                }
            }
        }))
    }, [dispatch])

    const handleCloseAddEdit = (refresh: boolean) => {
        setAddOpen(false)
        if (refresh) fetchActionPlans()
    }

    const handleDelete = (id: number) => {
        setDeleteId(id)
        setOpenDelete(true)
    }
    const handleDownload = (type: string) => {
        dispatch(exportPdfRequest({
            payload: {
                module: 'action_plan',
                search: globalFilter,
                department: filterDept || '',
                status_id: filterStatus || '',
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
                            ? 'action_plan.pdf'
                            : 'action_plan_report.xlsx'
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

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteActionPlanReq({
                payload: { action_plan_id: deleteId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Deleted successfully')
                        fetchActionPlans()
                    } else {
                        toast.error(response?.message || 'Error deleting')
                    }
                    setOpenDelete(false)
                    setDeleteId(null)
                }
            }))
        }
    }

    const columns = useMemo<ColumnDef<ActionPlanType, any>[]>(
        () => [
            columnHelper.accessor('sr_no', {
                header: 'Sr.No.',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('initiatives_definition', {
                header: 'Related Initiative',
                cell: info => (
                    <div className='truncate max-w-[200px]' title={info.getValue()}>
                        {info.getValue()}
                    </div>
                )
            }),
            columnHelper.accessor('action_plan_definition', {
                header: 'Action Plan',
                cell: info => (
                    <div className='truncate max-w-[200px]' title={info.getValue()}>
                        {info.getValue()}
                    </div>
                )
            }),
            columnHelper.accessor('assign_action_plan_user', {
                header: 'Co-Owner',
                cell: info => {
                    const users = info.getValue()
                    if (!users || users.length === 0) return '-'
                    return (
                        <div className='truncate max-w-[150px]' title={users.map((u: any) => u.user_name).join(', ')}>
                            {users.map((u: any) => u.user_name).join(', ')}
                        </div>
                    )
                }
            }),
            columnHelper.accessor('dept_name', {
                header: 'Department',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('kpi_data', {
                header: 'Related KPI',
                cell: info => {
                    const kpiData = info.getValue()
                    if (!kpiData || kpiData.length === 0) return '-'
                    const validKpis = kpiData.filter((k: any) => k.kpi_name)
                    if (validKpis.length === 0) return '-'
                    const kpiNames = validKpis.map((k: any) => k.kpi_name).join(', ')
                    return (
                        <div className='truncate max-w-[150px]' title={kpiNames}>
                            {kpiNames}
                        </div>
                    )
                }
            }),



            columnHelper.accessor('target', {
                header: 'Target Value',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('start_date', {
                header: 'Start',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('end_date', {
                header: 'Finish',
                cell: info => info.getValue()
            }),

            // columnHelper.accessor('control_point', {
            //     header: 'Control Point',
            //     cell: info => info.getValue()
            // }),
            columnHelper.accessor('percentage', {
                header: 'Percentage',
                cell: info => info.getValue() + '%'
            }),
            columnHelper.accessor('status_name', {
                header: 'Status',
                cell: info => {
                    const statusName = info.getValue()

                    if (statusName === 'Green') {
                        return (
                            <div className='flex justify-center'>
                                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#4caf50' }} />
                            </div>
                        )
                    }

                    if (statusName === 'Yellow') {
                        return (
                            <div className='flex justify-center'>
                                <Box
                                    sx={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: '10px solid transparent',
                                        borderRight: '10px solid transparent',
                                        borderBottom: '18px solid #ffd900'
                                    }}
                                />
                            </div>
                        )
                    }

                    if (statusName === 'Red') {
                        return (
                            <div className='flex justify-center items-center'>
                                <div className='border-2 border-red-500 rounded-sm w-5 h-5 flex items-center justify-center'>
                                    <i className='ri-close-line text-red-500 font-bold' style={{ fontSize: '18px' }} />
                                </div>
                            </div>
                        )
                    }

                    if (statusName === 'Gray (Started)') {
                        return (
                            <div className='flex justify-center'>
                                <Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: '#9fa6ad' }} />
                            </div>
                        )
                    }
                    if (statusName === 'Open(Un Hold)') {
                        return (
                            <div className='flex justify-center'>
                                <Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: '#9fa6ad' }} />
                            </div>
                        )
                    }

                    return <div className='flex justify-center'>{statusName}</div>
                }
            }),

            // columnHelper.accessor('user_id', {
            //     header: 'Comment',
            //     cell: info => (
            //         <IconButton
            //             size='small'
            //             onClick={() => {
            //                 setActionPlanId(info.row.original.action_plan_id)
            //                 setOpenComment(true)
            //             }}
            //         >
            //             <i className='ri-message-2-line text-textSecondary' />
            //         </IconButton>
            //     )
            // }),
            columnHelper.accessor('user_id', {
                header: 'View',
                cell: info => (
                    <>
                        {actionPlanSchedulesPermission?.acc_view === 1 && (

                            <Tooltip title="View Details" arrow>
                                <IconButton size="small"
                                    onClick={() => {
                                        router.push(`/${lang}/apps/actionPlans/singleActionPlanDetials/${info.row.original.action_plan_id}`)
                                    }}
                                >
                                    <i className='ri-eye-line text-textSecondary' />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>

                )
            }),

            columnHelper.display({
                id: 'action',
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center gap-0.5'>
                        {actionPlanPermission?.acc_delete === 1 && (
                            <IconButton
                                size='small'
                                onClick={() => handleDelete(row.original.action_plan_id)}
                            >
                                <i className='ri-delete-bin-7-line text-textSecondary' />
                            </IconButton>
                        )}
                        {actionPlanPermission?.acc_edit === 1 && (
                            <IconButton
                                size='small'
                                onClick={() => {
                                    setSelectedItem(row.original)
                                    setAddOpen(true)
                                }}
                            >
                                <i className='ri-edit-box-line text-textSecondary' />
                            </IconButton>
                        )}
                    </div>
                ),
                enableSorting: false
            })
        ],
        [pagination.pageIndex, pagination.pageSize, actionPlanPermission]
    )

    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualFiltering: true,
        rowCount: totalCount,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            globalFilter,
            pagination
        },
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        filterFns: {
            fuzzy: () => false
        }
    })

    if (actionPlanPermission && actionPlanPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Action Plans List' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Action Plans.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader title='Action Plans List' className='pbe-4' />
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <StraInitiActionTableStatus strategicObjectivesDash={strategicObjectivesDash} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} className='flex justify-end'>
                        <StraInitiActionLegendCaluculation />
                    </Grid>
                </Grid>


                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search Action Plan'
                            fullWidth
                        />
                    </Grid>

                    {/* Department Filter */}
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

                    {/* Status Filter */}
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
                                    <MenuItem key={status.status_id} value={String(status.status_id)}>
                                        {status.status_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Start Date Filter */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <AppReactDatepicker
                            selectsStart
                            id='filter-start-date'
                            startDate={filterStartDate ? new Date(filterStartDate) : undefined}
                            endDate={filterEndDate ? new Date(filterEndDate) : undefined}
                            selected={filterStartDate ? new Date(filterStartDate) : null}
                            onChange={(date: Date | null) => setFilterStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                            placeholderText='YYYY-MM-DD'
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={50}
                            customInput={<PickersComponent label='Start Date' />}
                        />
                    </Grid>

                    {/* End Date Filter */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <AppReactDatepicker
                            selectsEnd
                            id='filter-end-date'
                            startDate={filterStartDate ? new Date(filterStartDate) : undefined}
                            endDate={filterEndDate ? new Date(filterEndDate) : undefined}
                            selected={filterEndDate ? new Date(filterEndDate) : null}
                            minDate={filterStartDate ? new Date(filterStartDate) : undefined}
                            onChange={(date: Date | null) => setFilterEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
                            placeholderText='YYYY-MM-DD'
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={50}
                            customInput={<PickersComponent label='End Date' />}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                        <Button
                            variant='outlined'
                            color='secondary'
                            fullWidth
                            onClick={() => {
                                setGlobalFilter('')
                                setFilterDept('')
                                setFilterStatus('')
                                setFilterStartDate('')
                                setFilterEndDate('')
                            }}
                        >
                            Reset
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }} className='flex justify-end items-center gap-3'>
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

                        {actionPlanPermission?.acc_create === 1 && (
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setSelectedItem(undefined)
                                    setAddOpen(true)
                                }}
                                className='sm:is-auto'
                            >
                                Add Action Plan
                            </Button>
                        )}
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
                                    .rows.map(row => (
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
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component='div'
                    className='border-bs'
                    count={totalCount}
                    rowsPerPage={pagination.pageSize}
                    page={pagination.pageIndex}
                    SelectProps={{
                        inputProps: { 'aria-label': 'rows per page' },
                        MenuProps: { PaperProps: { style: { maxHeight: 250 } } }
                    }}
                    onPageChange={(_, page) => {
                        table.setPageIndex(page)
                    }}
                    onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
                />
            </Card>
            <AddEditActionPlan
                open={addOpen}
                handleClose={handleCloseAddEdit}
                dataEdit={selectedItem}
                filterUnit={filterUnit}
            />
            <ConfirmationPopup
                open={openDelete}
                setOpen={setOpenDelete}
                title='Are you sure you want to delete this Action Plan?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
            <CommentPopup
                open={openComment}
                setOpen={setOpenComment}
                actionPlanId={actionPlanId}
            />
        </>
    )
}

export default ActionPlansListTable
