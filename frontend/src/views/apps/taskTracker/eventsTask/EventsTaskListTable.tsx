
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
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
import Divider from '@mui/material/Divider'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'


import type { AppDispatch } from '@/redux-store'
import type { EventsTaskType } from '@/redux-store/slices/taskTracker/taskTracker.types'
import { getEventsTaskListRequest, deleteEventsTaskRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'
import { exportPdfRequest } from '@/redux-store/slices/taskTracker/taskTracker.slice'

import tableStyles from '@core/styles/table.module.css'
import AddEditEventsTask from './AddEditEventsTask'
import ConfirmationPopup from '@/components/dialogs/confirmation-popup'
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

const columnHelper = createColumnHelper<EventsTaskType>()

const EventsTaksListTable = () => {
    const dispatch = useDispatch<AppDispatch>()
    const [data, setData] = useState<EventsTaskType[]>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [totalCount, setTotalCount] = useState(0)

    const [addOpen, setAddOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<EventsTaskType | undefined>(undefined)
    const [openDelete, setOpenDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null)

    const eventsPermission = useModulePermission('Events')

    const fetchEvents = () => {
        setLoading(true)
        dispatch(getEventsTaskListRequest({
            payload: {
                search: globalFilter,
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

    useEffect(() => {
        fetchEvents()
    }, [dispatch, globalFilter])

    const handleCloseAddEdit = (refresh: boolean) => {
        setAddOpen(false)
        if (refresh) fetchEvents()
    }

    const handleDelete = (id: number) => {
        setDeleteId(id)
        setOpenDelete(true)
    }

    const onConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteEventsTaskRequest({
                payload: { events_id: deleteId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Deleted successfully')
                        fetchEvents()
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
                module: 'event',
                search: globalFilter,
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
                            ? 'event_list.pdf'
                            : 'event_list_report.xlsx'
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


    const columns = useMemo<ColumnDef<EventsTaskType, any>[]>(
        () => [
            columnHelper.accessor('id', {
                header: 'Sr.No.',
                cell: info => info.row.index + 1
            }),
            columnHelper.accessor('event_name', {
                header: 'Event Name',
                cell: info => <Typography color='text.primary'>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('event_area', {
                header: 'Event Area',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('event_objective', {
                header: 'Objective',
                cell: info => <Typography>{info.getValue()}</Typography>
            }),
            columnHelper.accessor('event_description', {
                header: 'Description',
                cell: info => <Typography className='truncate max-w-[200px]' title={info.getValue()}>{info.getValue()}</Typography>
            }),
            columnHelper.display({
                id: 'action',
                header: 'Action',
                cell: ({ row }) => (
                    <div className='flex items-center gap-0.5'>
                        {eventsPermission?.acc_delete === 1 && (
                            <IconButton
                                size='small'
                                onClick={() => handleDelete(row.original.id)}
                            >
                                <i className='ri-delete-bin-7-line text-textSecondary' />
                            </IconButton>
                        )}
                        {eventsPermission?.acc_edit === 1 && (
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
        [eventsPermission]
    )

    const table = useReactTable({
        data,
        columns,
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

    if (eventsPermission && eventsPermission.acc_view !== 1) {
        return (
            <Card>
                <CardHeader title='Events List' className='pbe-4' />
                <Divider />
                <Box p={5} textAlign='center'>
                    <Typography color='error'>You do not have permission to view Events.</Typography>
                </Box>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader title='Events List' />
                <Divider />
                <Grid container spacing={4} className='p-3'>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => {
                                setGlobalFilter(String(value))
                                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                            }}
                            placeholder='Search Event'
                            fullWidth
                            className='max-is-[250px]'
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} className='flex justify-end gap-2'>
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

                        {eventsPermission?.acc_create === 1 && (
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setSelectedItem(undefined)
                                    setAddOpen(true)
                                }}
                            >
                                Add Event
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
                    rowsPerPageOptions={[10, 25, 50]}
                    component='div'
                    count={totalCount}
                    rowsPerPage={pagination.pageSize}
                    page={pagination.pageIndex}
                    onPageChange={(_, page) => table.setPageIndex(page)}
                    onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
                />
            </Card>
            <AddEditEventsTask
                open={addOpen}
                handleClose={handleCloseAddEdit}
                dataEdit={selectedItem}
            />
            <ConfirmationPopup
                open={openDelete}
                setOpen={setOpenDelete}
                title='Are you sure you want to delete this Event?'
                subTitle="You won't be able to revert this!"
                onConfirm={onConfirmDelete}
            />
        </>
    )
}

export default EventsTaksListTable
