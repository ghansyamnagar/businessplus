'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'

import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import classnames from 'classnames'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'

import { getProjectRemarkListRequest, deleteProjectRemarkRequest } from '@/redux-store/slices/project/project.slice'
import tableStyles from '@core/styles/table.module.css'
import AddEditProjectRemark from '@/views/apps/project/projectRemark/AddEditProjectRemark'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
import { toast } from 'react-toastify'
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

const columnHelper = createColumnHelper<any>()

const ProjectRemarkListTable = () => {
    const { id } = useParams()
    const router = useRouter()

    const dispatch = useDispatch()
    const { data: session } = useSession()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [openAddEdit, setOpenAddEdit] = useState(false)
    const [selectedRemark, setSelectedRemark] = useState<any>(null)
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteData, setDeleteData] = useState<{ remarkId: number; userId: number } | null>(null)

    // Pagination & Search states
    const [globalFilter, setGlobalFilter] = useState('')
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [totalCount, setTotalCount] = useState(0)
    const projectHistoriesPermission = useModulePermission('Project_histories')
    const fetchRemarks = () => {
        setLoading(true)
        dispatch(getProjectRemarkListRequest({
            payload: {
                project_id: id,
                search: globalFilter,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize
            },
            callback: (res: any, err: any) => {
                setLoading(false)
                if (res && res.status === 'success') {
                    setData(res.data || [])
                    setTotalCount(res.total_count || res.data?.length || 0)
                } else {
                    setData([])
                    setTotalCount(0)
                }
            }
        }))
    }

    useEffect(() => {
        if (id) {
            fetchRemarks()
        }
    }, [id, globalFilter, pagination.pageIndex, pagination.pageSize])

    const handleDelete = (remarkId: number, userId: number) => {
        setDeleteData({ remarkId, userId })
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteData) {
            dispatch(deleteProjectRemarkRequest({
                payload: {
                    project_remark_id: deleteData.remarkId,
                    user_id: deleteData.userId,
                    project_user_id: 1
                },
                callback: (res: any, err: any) => {
                    if (res && res.status === 'success') {
                        toast.success('Remark deleted successfully')
                        fetchRemarks()
                    } else {
                        toast.error(err?.message || 'Failed to delete remark')
                    }
                    setOpenDelete(false)
                    setDeleteData(null)
                }
            }))
        }
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

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'Sr.No.',
            cell: info => <Typography>{pagination.pageIndex * pagination.pageSize + info.row.index + 1}</Typography>
        }),
        columnHelper.accessor('name', {
            header: 'User Name',
            cell: ({ row }) => <Typography>{row.original.name}</Typography>
        }),
        columnHelper.accessor('status_name', {
            header: 'Status',
            cell: info => (
                <Typography
                    variant='body2'
                    className='font-bold'
                    sx={{ color: getStatusColor(info.getValue()) }}
                >
                    {info.getValue()}
                </Typography>
            )
        }),
        columnHelper.accessor('remark', {
            header: 'Remark',
            cell: ({ row }) => <Typography>{row.original.remark}</Typography>
        }),
        columnHelper.accessor('updated_at', {
            header: 'Update Date',
            cell: ({ row }) => (
                <Typography>
                    {row.original.updated_at ? format(parseISO(row.original.updated_at), 'dd-MM-yyyy') : '-'}
                </Typography>
            )
        }),
        columnHelper.accessor('projects_remark_file_data', {
            header: 'Files',
            cell: ({ row }) => {
                const files = row.original.projects_remark_file_data
                if (!files || files.length === 0) return <Typography>-</Typography>

                return (
                    <div className='flex flex-col gap-1'>
                        {files.map((file: any, index: number) => (
                            <Link
                                key={index}
                                href={file.image_path}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-1 text-primary hover:underline'
                            >
                                <i className='ri-file-line text-lg' />
                                <Typography variant='body2' color='inherit'>
                                    {file.file_name}
                                </Typography>
                            </Link>
                        ))}
                    </div>
                )
            }
        }),
        columnHelper.display({
            id: 'action',
            header: 'Action',
            cell: ({ row }) => (
                <div className='flex items-center gap-0.5'>
                    {projectHistoriesPermission?.acc_edit === 1 && (
                        <IconButton size='small' onClick={() => {
                            setSelectedRemark(row.original)
                            setOpenAddEdit(true)
                        }}>
                            <i className='ri-edit-box-line text-textSecondary' />
                        </IconButton>
                    )}
                    {projectHistoriesPermission?.acc_delete === 1 && (
                        <IconButton size='small' onClick={() => handleDelete(row.original.project_remark_id, row.original.user_id)}>
                            <i className='ri-delete-bin-7-line text-textSecondary' />
                        </IconButton>
                    )}
                </div>
            )
        })
    ], [data, pagination.pageIndex, pagination.pageSize, projectHistoriesPermission])

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
        getFilteredRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    if (projectHistoriesPermission && projectHistoriesPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Project Remarks' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Project Remarks.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader
                    title={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <IconButton onClick={() => router.back()}>
                                <i className="ri-arrow-left-line" />
                            </IconButton>
                            <Typography variant="h6">Project Remarks</Typography>

                        </Box>
                    }
                />
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search Remark'
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 8 }} className='flex justify-end gap-2'>
                        <Button
                            variant='outlined'
                            color='secondary'
                            onClick={() => {
                                setGlobalFilter('')
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            className='sm:is-auto'
                        >
                            Reset
                        </Button>
                        {projectHistoriesPermission?.acc_create === 1 && (
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setSelectedRemark(null)
                                    setOpenAddEdit(true)
                                }}
                                className='sm:is-auto'
                            >
                                Add Remark
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
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length}>
                                        <Box p={4} textAlign='center'>
                                            <CircularProgress />
                                        </Box>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className='text-center'>No remarks found.</td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.slice(0, table.getState().pagination.pageSize).map(row => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
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

            <AddEditProjectRemark
                open={openAddEdit}
                handleClose={() => {
                    setOpenAddEdit(false)
                    setSelectedRemark(null)
                }}
                data={selectedRemark}
                projectId={id as string}
                refresh={fetchRemarks}
            />

            <ConfirmationPopup
                open={openDelete}
                setOpen={setOpenDelete}
                title='Are you sure you want to delete this remark?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
        </>
    )
}

export default ProjectRemarkListTable
