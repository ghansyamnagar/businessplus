'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

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

// MUI Imports
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
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
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
// Type Imports
import type { AppDispatch } from '@/redux-store'
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { SectionType } from '@/types/apps/sectionTypes'

// Slice Imports
import { getKpiTrackerRequest, deleteKpiTrackerRequest } from '@/redux-store/slices/kpiTracker/kpiTracker.slice'
import { getDepartmentListRequest, getSectionListRequest } from '@/redux-store/slices/user/user.slice'
import { exportPdfRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'

// Component Imports
import AddEditKpiTrackerInfo from './AddEditKpiTrackerInfo'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
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

type KpiTrackerData = {
    kpi_id?: number
    srNo: number
    kpi: string
    def: string
    owner: string
    department: string
    leadKpi: string
    trend: string
    uom: string
    yearEndTarget: string
    action: string

    // Full Object for Edit
    originalData?: any
}

const columnHelper = createColumnHelper<KpiTrackerData>()

const KpiTrackerListTable = () => {
    const { data: session } = useSession()


    const dispatch = useDispatch<AppDispatch>()
    const [data, setData] = useState<KpiTrackerData[]>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [loading, setLoading] = useState(false)

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [totalCount, setTotalCount] = useState(0)

    const [addKpiOpen, setAddKpiOpen] = useState(false)
    const [selectedKpi, setSelectedKpi] = useState<any | undefined>(undefined)
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null)


    // Filters
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [sections, setSections] = useState<SectionType[]>([])
    const [filterUnit, setFilterUnit] = useState((session?.user as any)?.unit_selected?.id || '')

    useEffect(() => {
        if (session?.user) {
            const unitId = (session.user as any)?.unit_selected?.id

            if (unitId) setFilterUnit(String(unitId))
        }
    }, [session])

    const [filterDept, setFilterDept] = useState('')
    const [filterSection, setFilterSection] = useState('')

    const selectedYear = (session?.user as any)?.userSelectedYear

    const kpiPermission = useModulePermission('Kpi_trackers')

    const fetchKpiData = () => {
        const payload = {
            search: globalFilter,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            unit_id: filterUnit || "",
            deptId: filterDept || "",
            section_id: filterSection || "",
        }

        setLoading(true)
        dispatch(getKpiTrackerRequest({
            payload,
            callback: (response: any) => {
                if (response?.data) {
                    const mappedData = response.data.map((item: any, index: number) => ({
                        kpi_id: item.kpi_id, // Store ID
                        srNo: (pagination.pageIndex * pagination.pageSize) + index + 1,
                        kpi: item.kpi_name,
                        def: item.kpi_definition,
                        owner: item.user_name,
                        department: item.dept_name,
                        leadKpi: item.lead_kpi ? 'Yes' : 'No',
                        trend: item.ideal_trend,
                        uom: item.u_o_m_name,
                        yearEndTarget: item.target_range_min || '-',
                        originalData: item // Keep full object for edit
                    }))

                    setData(mappedData)
                    setTotalCount(response.total_count || response.data.length)
                }
                setLoading(false)
            }
        }))
    }

    useEffect(() => {
        fetchKpiData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, filterUnit, filterDept, filterSection, globalFilter, pagination.pageIndex, pagination.pageSize, selectedYear])

    // Filter Departments
    useEffect(() => {
        setFilterDept('')
        setFilterSection('')

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

    // Fetch Sections when Department changes
    useEffect(() => {
        setFilterSection('')
        if (filterDept) {
            dispatch(getSectionListRequest({
                payload: { dept_id: filterDept },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        const filtered = response.data.filter((s: SectionType) => String(s.dept_id) === filterDept)
                        setSections(filtered)
                    } else {
                        setSections([])
                    }
                }
            }))
        } else {
            setSections([])
        }
    }, [filterDept, dispatch])

    const handleCloseAddEdit = (refresh: boolean) => {
        setAddKpiOpen(false)
        if (refresh) fetchKpiData()
    }

    const handleDelete = (id: number) => {
        setDeleteId(id)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteKpiTrackerRequest({
                payload: { kpi_id: deleteId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'KPI deleted successfully')
                        fetchKpiData()
                    } else {
                        toast.error(response?.message || 'Error deleting KPI')
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
                module: 'kpi',
                search: globalFilter,
                department: filterDept || '',
                section: filterSection || '',
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
                            ? 'kpi_report.pdf'
                            : 'kpi_report.xlsx'
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


    const columns = useMemo<ColumnDef<KpiTrackerData, any>[]>(
        () => [
            columnHelper.accessor('srNo', {
                header: 'Sr.No.',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('kpi', {
                header: 'KPI',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('def', {
                header: 'Def',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('owner', {
                header: 'Owner',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('department', {
                header: 'Department',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('leadKpi', {
                header: 'Lead KPI',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('trend', {
                header: 'Trend',
                cell: info => {
                    const trend = info.getValue()
                    return trend === 'positive' ? (
                        <i className='ri-arrow-up-line' style={{ color: '#4caf50', fontSize: '18px', fontWeight: 'bold' }} />
                    ) : (
                        <i className='ri-arrow-down-line' style={{ color: '#ff0000', fontSize: '18px', fontWeight: 'bold' }} />
                    )
                }
            }),
            columnHelper.accessor('uom', {
                header: 'UoM',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('yearEndTarget', {
                header: 'Year End Target',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('action', {
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center gap-0.5'>
                        {kpiPermission?.acc_delete === 1 && (
                            <IconButton
                                size='small'
                                onClick={() => handleDelete(row.original.kpi_id!)}
                            >
                                <i className='ri-delete-bin-7-line text-textSecondary' />
                            </IconButton>
                        )}
                        {kpiPermission?.acc_edit === 1 && (
                            <IconButton
                                size='small'
                                onClick={() => {
                                    setSelectedKpi(row.original.originalData)
                                    setAddKpiOpen(true)
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
        [pagination.pageIndex, pagination.pageSize, kpiPermission]
    )

    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualFiltering: true,
        rowCount: totalCount,
        state: {
            globalFilter,
            pagination
        },
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        filterFns: {
            fuzzy: () => false
        }
    })

    if (kpiPermission && kpiPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='KPI Tracker List' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view KPI Trackers.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader title='KPI Tracker List' className='pbe-4' />
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search KPI'
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
                            <InputLabel>Section</InputLabel>
                            <Select
                                value={filterSection}
                                label='Section'
                                onChange={e => setFilterSection(e.target.value)}
                                disabled={!filterDept}
                                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                            >
                                <MenuItem value=''>All</MenuItem>
                                {sections.map(section => (
                                    <MenuItem key={section.section_id} value={String(section.section_id)}>
                                        {section.section_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }} className='flex items-center gap-3'>
                        <Button
                            variant='outlined'
                            color='secondary'
                            className='max-is-[80px]'
                            fullWidth
                            onClick={() => {
                                setGlobalFilter('')
                                setFilterDept('')
                                setFilterSection('')
                            }}
                        >
                            Reset
                        </Button>
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
                    {kpiPermission?.acc_create === 1 && (
                        <Grid size={{ xs: 12, sm: 12, md: 3 }} className='flex justify-end'>
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setSelectedKpi(undefined)
                                    setAddKpiOpen(true)
                                }}
                                fullWidth
                                className='sm:is-auto'
                            >
                                Add KPI Tracker
                            </Button>
                        </Grid>
                    )}
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
                        ) : table.getFilteredRowModel().rows.length === 0 ? (
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
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component='div'
                    className='border-bs'
                    count={totalCount}
                    rowsPerPage={table.getState().pagination.pageSize}
                    page={table.getState().pagination.pageIndex}
                    SelectProps={{
                        inputProps: { 'aria-label': 'rows per page' }
                    }}
                    onPageChange={(_, page) => {
                        table.setPageIndex(page)
                    }}
                    onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
                />
            </Card>
            <AddEditKpiTrackerInfo
                open={addKpiOpen}
                handleClose={handleCloseAddEdit}
                dataEdit={selectedKpi}
                filterUnit={filterUnit}
            />
            <ConfirmationPopup
                open={openDelete}
                setOpen={setOpenDelete}
                title='Are you sure you want to delete this KPI?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
        </>
    )
}

export default KpiTrackerListTable
