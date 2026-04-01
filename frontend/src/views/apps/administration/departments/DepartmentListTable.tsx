'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import type { TextFieldProps } from '@mui/material/TextField'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'
// Third-party Imports
import classnames from 'classnames'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Type Imports
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { UnitsType } from '@/types/apps/unitTypes'

// Component Imports
import AddEditDepartmentInfo from './AddEditDepartmentInfo'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
import { useModulePermission } from '@/hooks/useModulePermission'

// Third-party Imports
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Slice Imports
import { getDepartmentListRequest, deleteDepartmentRequest, getUnitListRequest } from '@/redux-store/slices/user/user.slice'
import { exportPdfRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'


type DepartmentTypeWithAction = DepartmentType & {
    action?: string
}


const DebouncedInput = ({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
    // States
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

// Column Definitions
const columnHelper = createColumnHelper<DepartmentTypeWithAction>()

const DepartmentListTable = ({ tableData }: { tableData?: DepartmentType[] }) => {
    // Hooks
    const dispatch = useDispatch()
    const { lang: locale } = useParams()

    // States
    const [addDepartmentOpen, setAddDepartmentOpen] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType | undefined>(undefined)
    const [data, setData] = useState<DepartmentType[]>(tableData || [])
    const [globalFilter, setGlobalFilter] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [unitFilter, setUnitFilter] = useState('')
    const [units, setUnits] = useState<UnitsType[]>([])
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null)

    // Delete Confirmation State
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const departmentsPermission = useModulePermission('Departments')

    useEffect(() => {
        fetchDepartmentData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, pagination.pageIndex, pagination.pageSize, globalFilter, unitFilter])

    useEffect(() => {
        dispatch(getUnitListRequest({
            payload: {},
            callback: (response: any) => {
                if (response?.status === 'success') {
                    setUnits(response.data)
                }
            }
        }))
    }, [dispatch])

    const fetchDepartmentData = () => {
        setLoading(true)
        dispatch(getDepartmentListRequest({
            payload: {
                search: globalFilter,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                unit_id: unitFilter
            },
            callback: (response: any, error: any) => {
                if (response && response.status === 'success') {
                    setData(response.data)
                    setTotalCount(response.total_count || response.data.length)
                }
                setLoading(false)
            }
        }))
    }

    const handleDelete = (deptId: number) => {
        setDeleteId(deptId)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteDepartmentRequest({
                payload: {
                    dept_id: String(deleteId),
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'Department deleted successfully')
                        fetchDepartmentData()
                    } else {
                        toast.error(response?.message || 'Error deleting department')
                        console.error(error)
                    }
                }
            }))
        }
    }

    const handleDownload = (type: string) => {
        dispatch(exportPdfRequest({
            payload: {
                module: 'department',
                search: globalFilter,
                unit: unitFilter,
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
                            ? 'department_list.pdf'
                            : 'department_list_report.xlsx'
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

    const columns = useMemo<ColumnDef<DepartmentTypeWithAction, any>[]>(
        () => [
            columnHelper.display({
                id: 'sr_no',
                header: 'Sr. No.',
                cell: ({ row }) => (
                    <Typography>{pagination.pageIndex * pagination.pageSize + row.index + 1}</Typography>
                )
            }),
            columnHelper.accessor('dept_name', {
                header: 'Department Name',
                cell: ({ row }) => (
                    <Typography color='text.primary' className='font-medium'>
                        {row.original.dept_name}
                    </Typography>
                )
            }),
            columnHelper.accessor('unit_name', {
                header: 'Unit Name',
                cell: ({ row }) => <Typography>{row.original.unit_name}</Typography>
            }),
            columnHelper.accessor('name', {
                header: 'Department Head',
                cell: ({ row }) => <Typography>{row.original.name}</Typography>
            }),
            columnHelper.accessor('email', {
                header: 'Email',
                cell: ({ row }) => <Typography>{row.original.email}</Typography>
            }),
            columnHelper.accessor('action', {
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center gap-0.5'>
                        {departmentsPermission?.acc_delete === 1 && (
                            <IconButton size='small' onClick={() => handleDelete(row.original.dept_id)}>
                                <i className='ri-delete-bin-7-line text-textSecondary' />
                            </IconButton>
                        )}
                        {departmentsPermission?.acc_edit === 1 && (
                            <IconButton
                                size='small'
                                onClick={() => {
                                    setSelectedDepartment(row.original)
                                    setAddDepartmentOpen(true)
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
        [data, pagination, departmentsPermission]
    )

    const table = useReactTable({
        data: data as DepartmentTypeWithAction[],
        columns,
        filterFns: {
            fuzzy: () => false
        },
        state: {
            globalFilter,
            pagination
        },
        manualPagination: true,
        manualFiltering: true,
        rowCount: totalCount,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    })

    if (departmentsPermission && departmentsPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Departments' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Departments.</Typography>
                </Box>
            </Card>
        )
    }

    const handleCloseAddEdit = (refresh: boolean) => {
        setAddDepartmentOpen(false)
        if (refresh) fetchDepartmentData()
    }

    return (
        <>
            <Card>
                <CardHeader title='Departments' className='pbe-4' />
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 8 }} className='flex items-center gap-2'>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search department'
                            className='max-is-[250px]'
                            fullWidth
                        />
                        <FormControl className='min-is-[140px]' size='small'>
                            <InputLabel id='unit-filter-label'>Select Unit</InputLabel>
                            <Select
                                labelId='unit-filter-label'
                                value={unitFilter}
                                onChange={(e) => {
                                    setUnitFilter(e.target.value)
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }))
                                }}
                                label='Select Unit'
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 250,
                                        }
                                    }
                                }}
                            >
                                <MenuItem value=''>All Units</MenuItem>
                                {units.map((unit) => (
                                    <MenuItem key={unit.id} value={String(unit.id)}>
                                        {unit.unit_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant='outlined'
                            color='secondary'
                            onClick={() => {
                                setGlobalFilter('')
                                setUnitFilter('')
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
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
                    <Grid size={{ xs: 12, sm: 4 }} className='flex justify-end'>
                        {departmentsPermission?.acc_create === 1 && (
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setSelectedDepartment(undefined)
                                    setAddDepartmentOpen(!addDepartmentOpen)
                                }}
                                className='max-sm:is-full'
                            >
                                Add Department
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
                                                <>
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
                                                </>
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
                                    .map(row => {
                                        return (
                                            <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                                ))}
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        )}
                    </table>
                </div>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
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
            <ConfirmationPopup
                open={openDelete}
                setOpen={setOpenDelete}
                title='Are you sure you want to delete this department?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
            <AddEditDepartmentInfo
                open={addDepartmentOpen}
                handleClose={handleCloseAddEdit}
                data={selectedDepartment}
            />
        </>
    )
}

export default DepartmentListTable
