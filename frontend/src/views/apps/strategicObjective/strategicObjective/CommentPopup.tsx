
// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useDispatch } from 'react-redux'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Slice Imports
import { getStrategicObjectiveCommentsRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
    strategicObjectiveId: number | null
}

const columnHelper = createColumnHelper<any>()

const CommentPopup = ({ open, setOpen, strategicObjectiveId }: Props) => {
    const dispatch = useDispatch()
    const [comments, setComments] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && strategicObjectiveId) {
            setLoading(true)
            dispatch(getStrategicObjectiveCommentsRequest({
                payload: { str_obj_id: strategicObjectiveId },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setComments(response.data)
                    } else {
                        setComments([])
                    }
                    setLoading(false)
                }
            }))
        }
    }, [open, strategicObjectiveId, dispatch])

    const handleClose = () => {
        setOpen(false)
        setComments([])
    }

    const columns = useMemo<ColumnDef<any, any>[]>(
        () => [
            columnHelper.display({
                id: 'sl_no',
                header: 'Sr.No.',
                cell: info => info.row.index + 1
            }),
            columnHelper.accessor('created_at', {
                header: 'Month Date',
                cell: info => {
                    if (!info.getValue()) return '-'
                    const date = new Date(info.getValue())
                    // Format: "Month Date, Year" e.g., "Feb 18, 2026"
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                }
            }),
            columnHelper.accessor('name', {
                header: 'Name',
                cell: info => info.getValue()
            }),
            columnHelper.accessor('comment', {
                header: 'Comment',
                cell: info => info.getValue()
            })
        ],
        []
    )

    const table = useReactTable({
        data: comments || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        filterFns: {
            fuzzy: () => false
        }
    })

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={handleClose}
            maxWidth='md'
            scroll='body'
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>Strategic Objective Comments</div>
            </DialogTitle>
            <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
                    <i className='ri-close-line text-textSecondary' />
                </IconButton>

                {loading ? (
                    <div className='flex justify-center p-4'>
                        <CircularProgress />
                    </div>
                ) : comments?.length > 0 ? (
                    <div className='overflow-x-auto'>
                        <table className={tableStyles.table}>
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className='text-center p-4'>
                        <Typography>No comments found.</Typography>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default CommentPopup
