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
import type { SectionType } from '@/types/apps/sectionTypes'
import type { UnitsType } from '@/types/apps/unitTypes'
import type { DepartmentType } from '@/types/apps/departmentTypes'

// Component Imports
import AddEditSectionInfo from './AddEditSectionInfo'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
import { useModulePermission } from '@/hooks/useModulePermission'

// Third-party Imports
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Slice Imports
import { getSectionListRequest, deleteSectionRequest, getUnitListRequest, getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'
import { exportPdfRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'


type SectionTypeWithAction = SectionType & {
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
const columnHelper = createColumnHelper<SectionTypeWithAction>()

const SectionListTable = ({ tableData }: { tableData?: SectionType[] }) => {
    // Hooks
    const dispatch = useDispatch()
    const { lang: locale } = useParams()

    // States
    const [addSectionOpen, setAddSectionOpen] = useState(false)
    const [selectedSection, setSelectedSection] = useState<SectionType | undefined>(undefined)
    const [data, setData] = useState<SectionType[]>(tableData || [])
    const [globalFilter, setGlobalFilter] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [unitFilter, setUnitFilter] = useState('')
    const [units, setUnits] = useState<UnitsType[]>([])
    const [deptFilter, setDeptFilter] = useState('')
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null)

    // Delete Confirmation State
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const sectionsPermission = useModulePermission('Sections')

    useEffect(() => {
        fetchSectionData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, pagination.pageIndex, pagination.pageSize, globalFilter, unitFilter, deptFilter])

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

    useEffect(() => {
        if (unitFilter) {
            dispatch(getDepartmentListRequest({
                payload: { unit_id: unitFilter },
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
            setDeptFilter('')
        }
    }, [unitFilter, dispatch])

    const fetchSectionData = () => {
        setLoading(true)
        dispatch(getSectionListRequest({
            payload: {
                search: globalFilter,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                unit_id: unitFilter,
                dept_id: deptFilter
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

    const handleDelete = (sectionId: number) => {
        setDeleteId(sectionId)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteSectionRequest({
                payload: {
                    section_id: String(deleteId),
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'Section deleted successfully')
                        fetchSectionData()
                    } else {
                        toast.error(response?.message || 'Error deleting section')
                        console.error(error)
                    }
                }
            }))
        }
    }

    const handleDownload = (type: string) => {
        dispatch(exportPdfRequest({
            payload: {
                module: 'section',
                search: globalFilter,
                unit: unitFilter,
                department: deptFilter,
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
                            ? 'sections_list.pdf'
                            : 'sections_list_report.xlsx'
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

    const columns = useMemo<ColumnDef<SectionTypeWithAction, any>[]>(
        () => [
            columnHelper.display({
                id: 'sr_no',
                header: 'Sr. No.',
                cell: ({ row }) => (
                    <Typography>{pagination.pageIndex * pagination.pageSize + row.index + 1}</Typography>
                )
            }),
            columnHelper.accessor('section_name', {
                header: 'Section Name',
                cell: ({ row }) => (
                    <Typography color='text.primary' className='font-medium'>
                        {row.original.section_name}
                    </Typography>
                )
            }),
            columnHelper.accessor('dept_name', {
                header: 'Department Name',
                cell: ({ row }) => <Typography>{row.original.dept_name}</Typography>
            }),
            columnHelper.accessor('unit_name', {
                header: 'Unit Name',
                cell: ({ row }) => <Typography>{row.original.unit_name}</Typography>
            }),
            columnHelper.accessor('name', {
                header: 'Section Head',
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
                        {sectionsPermission?.acc_delete === 1 && (
                            <IconButton size='small' onClick={() => handleDelete(row.original.section_id)}>
                                <i className='ri-delete-bin-7-line text-textSecondary' />
                            </IconButton>
                        )}
                        {sectionsPermission?.acc_edit === 1 && (
                            <IconButton
                                size='small'
                                onClick={() => {
                                    setSelectedSection(row.original)
                                    setAddSectionOpen(true)
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
        [data, pagination, sectionsPermission]
    )

    const table = useReactTable({
        data: data as SectionTypeWithAction[],
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

    if (sectionsPermission && sectionsPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Sections' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Sections.</Typography>
                </Box>
            </Card>
        )
    }

    const handleCloseAddEdit = (refresh: boolean) => {
        setAddSectionOpen(false)
        if (refresh) fetchSectionData()
    }

    return (
        <>
            <Card>
                <CardHeader title='Sections' className='pbe-4' />
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 8 }} className='flex items-center gap-2'>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search section'
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
                        <FormControl className='min-is-[140px]' size='small'>
                            <InputLabel id='dept-filter-label'>Department</InputLabel>
                            <Select
                                labelId='dept-filter-label'
                                value={deptFilter}
                                onChange={(e) => {
                                    setDeptFilter(e.target.value)
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }))
                                }}
                                label='Select Dept'
                                disabled={!unitFilter}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 250,
                                        }
                                    }
                                }}
                            >
                                <MenuItem value=''>All Departments</MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept.dept_id} value={String(dept.dept_id)}>
                                        {dept.dept_name}
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
                                setDeptFilter('')
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
                        {sectionsPermission?.acc_create === 1 && (
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setSelectedSection(undefined)
                                    setAddSectionOpen(!addSectionOpen)
                                }}
                                className='max-sm:is-full'
                            >
                                Add Section
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
                title='Are you sure you want to delete this section?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
            <AddEditSectionInfo
                open={addSectionOpen}
                handleClose={handleCloseAddEdit}
                data={selectedSection}
            />
        </>
    )
}

export default SectionListTable
