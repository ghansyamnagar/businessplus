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
import type { TextFieldProps } from '@mui/material/TextField'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
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
import type { CompanyFaqType } from '@/types/apps/companyFaqTypes'

// Component Imports
import AddEditCompanyFaqInfo from './AddEditCompanyFaqInfo'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
import { useModulePermission } from '@/hooks/useModulePermission'

// Third-party Imports
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

// Slice Imports
import { getCompanyFaqListRequest, deleteCompanyFaqRequest } from '@/redux-store/slices/master/master.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'


type CompanyFaqTypeWithAction = CompanyFaqType & {
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
    }, [value])

    return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper<CompanyFaqTypeWithAction>()

const CompanyFaqListTable = () => {
    // Hooks
    const dispatch = useDispatch()
    const { lang: locale } = useParams()

    // States
    const [addFaqOpen, setAddFaqOpen] = useState(false)
    const [selectedFaq, setSelectedFaq] = useState<CompanyFaqType | undefined>(undefined)
    const [data, setData] = useState<CompanyFaqType[]>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [totalCount, setTotalCount] = useState(0)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [loading, setLoading] = useState(false)
    // Delete Confirmation State
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const faqPermission = useModulePermission('Faqs')

    useEffect(() => {
        fetchFaqData()
    }, [dispatch, pagination.pageIndex, pagination.pageSize, globalFilter])

    const fetchFaqData = () => {
        setLoading(true)
        dispatch(getCompanyFaqListRequest({
            payload: {
                search: globalFilter,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize
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

    const handleDelete = (id: number) => {
        setDeleteId(id)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteCompanyFaqRequest({
                payload: {
                    faq_id: deleteId,
                },
                callback: (response: any, error: any) => {
                    if (response && response.status === 'success') {
                        toast.success(response.message || 'FAQ deleted successfully')
                        fetchFaqData()
                    } else {
                        toast.error(response?.message || 'Error deleting FAQ')
                        console.error(error)
                    }
                }
            }))
        }
    }

    const columns = useMemo<ColumnDef<CompanyFaqTypeWithAction, any>[]>(
        () => [
            columnHelper.display({
                id: 'sr_no',
                header: 'Sr. No.',
                cell: ({ row }) => (
                    <Typography>{pagination.pageIndex * pagination.pageSize + row.index + 1}</Typography>
                )
            }),
            columnHelper.accessor('question', {
                header: 'Question',
                cell: ({ row }) => (
                    <Typography color='text.primary' className='font-medium'>
                        {row.original.question}
                    </Typography>
                )
            }),
            columnHelper.accessor('answer', {
                header: 'Answer',
                cell: ({ row }) => (
                    <Typography
                        color='text.primary'
                        className='font-medium'
                        sx={{ whiteSpace: 'pre-wrap', maxWidth: '400px' }}
                        dangerouslySetInnerHTML={{ __html: row.original.answer }}
                    />
                )
            }),
            columnHelper.accessor('action', {
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center gap-0.5'>
                        {faqPermission?.acc_delete === 1 && (
                            <IconButton size='small' onClick={() => handleDelete(row.original.faq_id)}>
                                <i className='ri-delete-bin-7-line text-textSecondary' />
                            </IconButton>
                        )}
                        {faqPermission?.acc_edit === 1 && (
                            <IconButton
                                size='small'
                                onClick={() => {
                                    setSelectedFaq(row.original)
                                    setAddFaqOpen(true)
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
        [pagination]
    )

    const table = useReactTable({
        data: data as CompanyFaqTypeWithAction[],
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
        setAddFaqOpen(false)
        if (refresh) fetchFaqData()
    }

    if (faqPermission && faqPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Company Faq' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Company Faq.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader title='Company Faq' className='pbe-4' />
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 6 }} className='flex items-center gap-2'>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search FAQ'
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
                        {faqPermission?.acc_create === 1 && (
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setSelectedFaq(undefined)
                                    setAddFaqOpen(true)
                                }}
                                className='max-sm:is-full'
                            >
                                Add Faq
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
                title='Are you sure you want to delete this FAQ?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
            <AddEditCompanyFaqInfo
                open={addFaqOpen}
                handleClose={handleCloseAddEdit}
                data={selectedFaq}
            />
        </>
    )
}

export default CompanyFaqListTable
