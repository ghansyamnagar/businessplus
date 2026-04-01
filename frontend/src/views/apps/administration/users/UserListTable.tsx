'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
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
import classnames from 'classnames'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { TextFieldProps } from '@mui/material/TextField'
import AddEditUserInfo from './AddEditUserInfo'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { getUserListRequest, deleteUserRequest, getUnitListRequest, getDepartmentListRequest, getSectionListRequest } from '@/redux-store/slices/user/user.slice'
import tableStyles from '@core/styles/table.module.css'
import type { UsersType } from '@/types/apps/userTypes'
import type { UnitsType } from '@/types/apps/unitTypes'
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { SectionType } from '@/types/apps/sectionTypes'
import Menu from '@mui/material/Menu'
import { exportPdfRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'
import Tooltip from '@mui/material/Tooltip'

type UserTypeWithAction = UsersType & {
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

const columnHelper = createColumnHelper<UserTypeWithAction>()

const UserListTable = ({ tableData }: { tableData?: UsersType[] }) => {
    const dispatch = useDispatch()
    const { lang: locale } = useParams()
    const [addUserOpen, setAddUserOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UsersType | undefined>(undefined)
    const [data, setData] = useState<UsersType[]>(tableData || [])
    const [globalFilter, setGlobalFilter] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })

    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const [units, setUnits] = useState<UnitsType[]>([])
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [sections, setSections] = useState<SectionType[]>([])
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null)

    const [filterUnit, setFilterUnit] = useState('')
    const [filterDept, setFilterDept] = useState('')
    const [filterSection, setFilterSection] = useState('')

    useEffect(() => {
        fetchUserData()
    }, [dispatch, pagination.pageIndex, pagination.pageSize, globalFilter, filterUnit, filterDept, filterSection])

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

    useEffect(() => {
        setFilterSection('')
        if (filterDept) {
            dispatch(getSectionListRequest({
                payload: { dept_id: filterDept },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setSections(response.data.filter((section: SectionType) => String(section.dept_id) === filterDept))
                    } else {
                        setSections([])
                    }
                }
            }))
        } else {
            setSections([])
        }
    }, [filterDept, dispatch])

    const fetchUserData = () => {
        setLoading(true)
        dispatch(getUserListRequest({
            payload: {
                search: globalFilter,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                unit_id: filterUnit,
                dept_id: filterDept,
                section_id: filterSection
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

    const handleDelete = (userId: number) => {
        setDeleteId(userId)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteUserRequest({
                payload: {
                    user_id: String(deleteId),
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'User deleted successfully')
                        fetchUserData()
                    } else {
                        toast.error(response?.message || 'Error deleting user')
                        console.error(error)
                    }
                }
            }))
        }
    }
    const handleDownload = (type: string) => {
        dispatch(exportPdfRequest({
            payload: {
                module: 'user',
                search: globalFilter,
                unit: filterUnit,
                department: filterDept,
                section: filterSection,
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
                            ? 'users_list.pdf'
                            : 'users_list_report.xlsx'
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

    const columns = useMemo<ColumnDef<UserTypeWithAction, any>[]>(
        () => [
            columnHelper.display({
                id: 'sr_no',
                header: 'Sr. No.',
                cell: ({ row }) => (
                    <Typography>{pagination.pageIndex * pagination.pageSize + row.index + 1}</Typography>
                )
            }),
            columnHelper.accessor('name', {
                header: 'Name',
                cell: ({ row }) => (
                    <Typography color='text.primary' className='font-medium'>
                        {row.original.name}
                    </Typography>
                )
            }),
            columnHelper.accessor('email', {
                header: 'Email',
                cell: ({ row }) => <Typography>{row.original.email}</Typography>
            }),
            columnHelper.accessor('gender', {
                header: 'Gender',
                cell: ({ row }) => <Typography className='capitalize'>{row.original.gender}</Typography>
            }),
            columnHelper.accessor('designation', {
                header: 'Designation',
                cell: ({ row }) => <Typography>{row.original.designation}</Typography>
            }),
            columnHelper.accessor('role_id', {
                header: 'Role',
                cell: ({ row }) => <Typography>{row.original.role_id}</Typography>
            }),
            columnHelper.accessor('mobile', {
                header: 'Mobile',
                cell: ({ row }) => <Typography>{row.original.mobile}</Typography>
            }),
            columnHelper.accessor('city', {
                header: 'City',
                cell: ({ row }) => <Typography>{row.original.city}</Typography>
            }),
            columnHelper.accessor('address', {
                header: 'Address',
                cell: ({ row }) => <Typography>{row.original.address}</Typography>
            }),
            columnHelper.accessor('action', {
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center gap-0.5'>
                        <IconButton size='small' onClick={() => handleDelete(row.original.user_id)}>
                            <i className='ri-delete-bin-7-line text-textSecondary' />
                        </IconButton>
                        <IconButton
                            size='small'
                            onClick={() => {
                                setSelectedUser(row.original)
                                setAddUserOpen(true)
                            }}
                        >
                            <i className='ri-edit-box-line text-textSecondary' />
                        </IconButton>
                    </div>
                ),
                enableSorting: false
            })
        ],
        [data, pagination]
    )

    const table = useReactTable({
        data: data as UserTypeWithAction[],
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

    const handleCloseAddEdit = (refresh: boolean) => {
        setAddUserOpen(false)
        if (refresh) fetchUserData()
    }

    return (
        <>
            <Card>
                <CardHeader title='Users' className='pbe-4' />
                <Divider />
                <Grid container spacing={4} className='p-4'>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Unit</InputLabel>
                            <Select
                                value={filterUnit}
                                label='Unit'
                                onChange={e => setFilterUnit(e.target.value)}
                                MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                            >
                                <MenuItem value=''>All</MenuItem>
                                {units.map(unit => (
                                    <MenuItem key={unit.id} value={String(unit.id)}>
                                        {unit.unit_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={filterDept}
                                label='Department'
                                onChange={e => setFilterDept(e.target.value)}
                                disabled={!filterUnit}
                                MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
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
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Section</InputLabel>
                            <Select
                                value={filterSection}
                                label='Section'
                                onChange={e => setFilterSection(e.target.value)}
                                disabled={!filterDept}
                                MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
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
                </Grid>
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 8 }} className='flex items-center gap-2'>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search user'
                            className='max-is-[250px]'
                            fullWidth
                        />
                        <Button
                            variant='outlined'
                            color='secondary'
                            onClick={() => {
                                setGlobalFilter('')
                                setFilterUnit('')
                                setFilterDept('')
                                setFilterSection('')
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                        >
                            Reset
                        </Button>
                        <Tooltip title="Download pdf/excel" placement='top' arrow>
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
                        <Button
                            variant='contained'
                            onClick={() => {
                                setSelectedUser(undefined)
                                setAddUserOpen(!addUserOpen)
                            }}
                            className='max-sm:is-full'
                        >
                            Add User
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
            <ConfirmationPopup
                open={openDelete}
                setOpen={setOpenDelete}
                title='Are you sure you want to delete this user?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
            <AddEditUserInfo
                open={addUserOpen}
                handleClose={handleCloseAddEdit}
                data={selectedUser}
            />
        </>
    )
}

export default UserListTable
