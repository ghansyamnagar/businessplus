'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

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
import type { TextFieldProps } from '@mui/material/TextField'
import { getBigDataListRequest, deleteBigDataRequest } from '@/redux-store/slices/master/master.slice'
import { useDispatch } from 'react-redux'

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
import { toast } from 'react-toastify'

// Component Imports
import AddEditBigDataServicesInfo from './AddEditBigDataServicesInfo'
import type { BigDataServicesType } from './AddEditBigDataServicesInfo'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useModulePermission } from '@/hooks/useModulePermission'
// Style Imports
import tableStyles from '@core/styles/table.module.css'

type BigDataServicesTypeWithAction = BigDataServicesType & {
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

// Column Definitions
const columnHelper = createColumnHelper<BigDataServicesTypeWithAction>()

const BigDataServicesListTable = () => {
    // States
    const [addOpen, setAddOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<BigDataServicesType | undefined>(undefined)
    const [data, setData] = useState<BigDataServicesType[]>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)

    // Delete Confirmation State
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const bigDataPermission = useModulePermission('Big_data_services')

    useEffect(() => {
        fetchData()
    }, [pagination.pageIndex, pagination.pageSize, globalFilter])

    const fetchData = () => {
        setLoading(true)

        dispatch(
            getBigDataListRequest({
                payload: {
                    search: globalFilter,
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,

                },
                callback: (response: any) => {

                    if (response?.status === 'success') {
                        const list = response?.data || []

                        const formattedData = list.map((item: any) => ({
                            ...item,
                            image: item.file || null
                        }))

                        setData(formattedData)
                        setTotalCount(list.length)
                    } else {
                        toast.error(response?.message || 'Failed to fetch data')
                    }
                    setLoading(false)
                }
            })
        )
    }

    const handleDelete = (id: number) => {
        setDeleteId(id)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (!deleteId) return

        dispatch(
            deleteBigDataRequest({
                payload: { id: deleteId },
                callback: (response: any) => {

                    if (response?.status === 'success') {
                        toast.success('Big Data Services deleted successfully')
                        setOpenDelete(false)
                        setDeleteId(null)
                        fetchData()
                    } else {
                        toast.error(response?.message || 'Delete failed')
                    }
                }
            })
        )
    }



    const columns = useMemo<ColumnDef<BigDataServicesTypeWithAction, any>[]>(
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
            columnHelper.accessor('description', {
                header: 'Description',
                cell: ({ row }) => (
                    <Typography
                        color='text.primary'
                        className='font-medium'
                        sx={{ whiteSpace: 'pre-wrap', maxWidth: '400px' }}
                    >
                        {row.original.description}
                    </Typography>
                )
            }),
            columnHelper.accessor('file', {
                header: 'Files',
                cell: ({ row }) => {

                    const filePath = row.original?.file

                    if (!filePath) return <Typography>-</Typography>

                    const fileName = filePath.split('/').pop()

                    return (
                        <div className='flex flex-col gap-1'>
                            <a
                                href={filePath}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-1 text-primary hover:underline'
                            >
                                <i className='ri-file-line text-lg' />
                                <Typography variant='body2' color='inherit'>
                                    {fileName}
                                </Typography>
                            </a>
                        </div>
                    )
                }
            }),
            columnHelper.accessor('action', {
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center gap-0.5'>
                        {bigDataPermission?.acc_edit === 1 && (
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
                        {bigDataPermission?.acc_delete === 1 && (
                            <IconButton size='small' onClick={() => handleDelete(row.original.id)}>
                                <i className='ri-delete-bin-7-line text-textSecondary' />
                            </IconButton>
                        )}
                    </div>
                ),
                enableSorting: false
            })
        ],
        [pagination]
    )

    const table = useReactTable({
        data: data as BigDataServicesTypeWithAction[],
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
        setAddOpen(false)
        setSelectedItem(undefined)
        if (refresh) fetchData()
    }

    if (bigDataPermission && bigDataPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Big Data Services' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Big Data Services.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader title='Big Data Services' className='pbe-4' />
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 6 }} className='flex items-center gap-2'>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search Big Data Services'
                            className='max-is-[250px]'
                            fullWidth
                        />
                        <Button
                            variant='outlined'
                            color='secondary'
                            onClick={() => {
                                setGlobalFilter('')
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                        >
                            Reset
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} className='flex justify-end'>
                        {bigDataPermission?.acc_create === 1 && (
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setSelectedItem(undefined)
                                    setAddOpen(true)
                                }}
                                className='max-sm:is-full'
                            >
                                Add Big Data Services
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
                title='Are you sure you want to delete this Big Data Services?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
            <AddEditBigDataServicesInfo
                open={addOpen}
                handleClose={handleCloseAddEdit}
                data={selectedItem}
            />
        </>
    )
}

export default BigDataServicesListTable
