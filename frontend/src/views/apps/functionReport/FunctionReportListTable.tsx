
'use client'

import { useEffect, useState, useMemo } from 'react'
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
import Tooltip from '@mui/material/Tooltip'

// Type Imports
import type { AppDispatch } from '@/redux-store'
import type { DepartmentType } from '@/types/apps/departmentTypes'

// Slice Imports
import { getFunctionReportListRequest, deleteFunctionReportRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import { getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'

// Component Imports
import AddEditFunctionReport from './AddEditFunctionReport'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<any>()

const FunctionReportListTable = () => {
    const { data: session } = useSession()
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { lang } = useParams()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const [addOpen, setAddOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any | undefined>(undefined)
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    // Filters
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [filterUnit, setFilterUnit] = useState((session?.user as any)?.unit_selected?.id || '')
    const [filterDept, setFilterDept] = useState('')
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })

    const selectedYear = (session?.user as any)?.userSelectedYear

    useEffect(() => {
        if (session?.user) {
            const unitId = (session.user as any)?.unit_selected?.id
            if (unitId) setFilterUnit(String(unitId))
        }
    }, [session])

    const allDeptIds = useMemo(() => {
        return departments.map(d => d.dept_id).join(',')
    }, [departments])

    const fetchFunctionReports = () => {
        if (!allDeptIds && !filterDept) return

        setLoading(true)
        dispatch(getFunctionReportListRequest({
            payload: {
                dept_id: filterDept || allDeptIds
            },
            callback: (response: any) => {
                if (response?.status === 'success') {
                    setData(response.data || [])
                } else {
                    setData([])
                }
                setLoading(false)
            }
        }))
    }

    useEffect(() => {
        fetchFunctionReports()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, filterUnit, filterDept, allDeptIds, selectedYear])

    // Fetch Departments List
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

    const handleCloseAddEdit = (refresh: boolean) => {
        setAddOpen(false)
        if (refresh) fetchFunctionReports()
    }

    const handleDelete = (id: number) => {
        setDeleteId(id)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteFunctionReportRequest({
                payload: {
                    login_access_token: (session?.user as any)?.accessToken,
                    quartupdatmanufacturs_id: deleteId
                },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Deleted successfully')
                        fetchFunctionReports()
                    } else {
                        toast.error(response?.message || 'Error deleting')
                    }
                    setOpenDelete(false)
                    setDeleteId(null)
                }
            }))
        }
    }

    const columns = useMemo<ColumnDef<any, any>[]>(
        () => [
            columnHelper.display({
                id: 'sr_no',
                header: 'Sr.No.',
                cell: ({ row }) => (pagination.pageIndex * pagination.pageSize) + row.index + 1
            }),
            columnHelper.accessor('year', {
                header: 'Financial Year',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('dept_name', {
                header: 'Department',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('quarterly', {
                header: 'Period',
                cell: info => info.getValue()
            }),

            // columnHelper.accessor('highlight', {
            //     header: 'Highlights',
            //     cell: info => (
            //         <Tooltip title={<div dangerouslySetInnerHTML={{ __html: info.getValue() }} />} arrow>
            //             <div className='truncate max-w-[150px]' dangerouslySetInnerHTML={{ __html: info.getValue() }} />
            //         </Tooltip>
            //     )
            // }),
            // columnHelper.accessor('majorgaps', {
            //     header: 'Major Gaps',
            //     cell: info => (
            //         <Tooltip title={<div dangerouslySetInnerHTML={{ __html: info.getValue() }} />} arrow>
            //             <div className='truncate max-w-[150px]' dangerouslySetInnerHTML={{ __html: info.getValue() }} />
            //         </Tooltip>
            //     )
            // }),
            // columnHelper.accessor('challenges', {
            //     header: 'Challenges',
            //     cell: info => (
            //         <Tooltip title={<div dangerouslySetInnerHTML={{ __html: info.getValue() }} />} arrow>
            //             <div className='truncate max-w-[150px]' dangerouslySetInnerHTML={{ __html: info.getValue() }} />
            //         </Tooltip>
            //     )
            // }),
            // columnHelper.accessor('priorities', {
            //     header: 'Priorities',
            //     cell: info => (
            //         <Tooltip title={<div dangerouslySetInnerHTML={{ __html: info.getValue() }} />} arrow>
            //             <div className='truncate max-w-[150px]' dangerouslySetInnerHTML={{ __html: info.getValue() }} />
            //         </Tooltip>
            //     )
            // }),
            columnHelper.accessor('remark', {
                header: 'Remarks',
                cell: info => info.getValue()
            }),
            columnHelper.display({
                id: 'view',
                header: 'View',
                cell: ({ row }) => (
                    <IconButton
                        size='small'
                        onClick={() => {
                            router.push(`/${lang}/apps/functionReport/view-qtly-summary/${row.original.dept_id}/${row.original.quartupdatmanufacturs_id}`)
                        }}
                    >
                        <i className='ri-eye-line text-textSecondary' />
                    </IconButton>
                )
            }),
            columnHelper.display({
                id: 'action',
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center gap-0.5'>
                        <IconButton
                            size='small'
                            onClick={() => handleDelete(row.original.quartupdatmanufacturs_id)}
                        >
                            <i className='ri-delete-bin-7-line text-textSecondary' />
                        </IconButton>
                        <IconButton
                            size='small'
                            onClick={() => {
                                setSelectedItem(row.original)
                                setAddOpen(true)
                            }}
                        >
                            <i className='ri-edit-box-line text-textSecondary' />
                        </IconButton>
                    </div>
                )
            })
        ],
        []
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            pagination
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        filterFns: {
            fuzzy: () => false
        }
    })

    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const YEARS = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - 5 + i))

    return (
        <>
            <Card>
                <CardHeader
                    title='Monthly Report'
                    action={
                        <Button
                            variant='contained'
                            onClick={() => {
                                setSelectedItem(undefined)
                                setAddOpen(true)
                            }}
                        >
                            Add Monthly Report
                        </Button>
                    }
                />
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    {/* Department Filter */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={filterDept}
                                label='Department'
                                onChange={e => {
                                    setFilterDept(e.target.value)
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }))
                                }}
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

                    <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                        <Button
                            variant='outlined'
                            color='secondary'
                            fullWidth
                            onClick={() => {
                                setFilterDept('')
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                        >
                            Reset
                        </Button>
                    </Grid>
                </Grid>

                <div className='overflow-x-auto'>
                    <table className={tableStyles.table}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
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
                    rowsPerPageOptions={[5, 10, 25]}
                    component='div'
                    count={table.getFilteredRowModel().rows.length}
                    rowsPerPage={pagination.pageSize}
                    page={pagination.pageIndex}
                    onPageChange={(_, page) => table.setPageIndex(page)}
                    onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
                />
            </Card>
            <AddEditFunctionReport
                open={addOpen}
                handleClose={handleCloseAddEdit}
                dataEdit={selectedItem}
                filterUnit={filterUnit}
            />
            <ConfirmationPopup
                open={openDelete}
                setOpen={setOpenDelete}
                title='Are you sure you want to delete this Report?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
        </>
    )
}

export default FunctionReportListTable
