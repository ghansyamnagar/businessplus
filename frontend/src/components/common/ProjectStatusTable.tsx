'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getPaginationRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const StatusBadge = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'bgColor'
})<{ bgColor: string }>(({ bgColor }) => ({
    backgroundColor: bgColor,
    color: '#fff',
    borderRadius: '50px',
    padding: '2px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    minWidth: '40px',
    height: '20px'
}))

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)

    addMeta({ itemRank })

    return itemRank.passed
}

const columnHelper = createColumnHelper<any>()

interface ProjectStatusTableProps {
    /** Title shown in the card header */
    title?: string
    /** Label for the first data column, e.g. "Year" or "Department" */
    firstColumnLabel: string
    /** The data rows */
    data: any[]
    /** Whether to show a Total row at the bottom. Defaults to true */
    showTotal?: boolean
}

const ProjectStatusTable = ({ title, firstColumnLabel, data, showTotal = true }: ProjectStatusTableProps) => {

    const processedData = useMemo(() => {
        if (!data || data.length === 0) return []

        const rows = data.map((item: any, index: number) => ({
            srNo: index + 1,
            label: item.dept_name || item.year || '',
            total: item.total || 0,
            closed: item.closed || 0,
            wip: item.open || 0,
            delayed: item.delayed || 0,
            closedWithDelay: item.closedWithDelay || 0,
            onHold: item.onHold || 0
        }))

        // Add total row only if showTotal is true
        if (showTotal && rows.length > 0) {
            const total = rows.reduce(
                (acc, curr) => ({
                    total: acc.total + curr.total,
                    closed: acc.closed + curr.closed,
                    wip: acc.wip + curr.wip,
                    delayed: acc.delayed + curr.delayed,
                    closedWithDelay: acc.closedWithDelay + curr.closedWithDelay,
                    onHold: acc.onHold + curr.onHold
                }),
                { total: 0, closed: 0, wip: 0, delayed: 0, closedWithDelay: 0, onHold: 0 }
            )

            rows.push({
                srNo: '',
                label: 'Total',
                ...total
            } as any)
        }

        return rows
    }, [data, showTotal])

    const columns = useMemo<ColumnDef<any, any>[]>(
        () => [
            columnHelper.accessor('srNo', {
                header: 'Sr.No.',
                cell: ({ row }) => (
                    <Typography variant='body2' className='text-center'>
                        {row.original.srNo}
                    </Typography>
                )
            }),
            columnHelper.accessor('label', {
                header: firstColumnLabel,
                cell: ({ row }) => (
                    <Typography variant='body2' fontWeight={row.original.label === 'Total' ? 'bold' : 'medium'}>
                        {row.original.label}
                    </Typography>
                )
            }),
            columnHelper.accessor('total', {
                header: 'Total',
                cell: ({ row }) => (
                    <Typography className='text-center' fontWeight={row.original.label === 'Total' ? 'bold' : 'normal'}>
                        {row.original.total}
                    </Typography>
                )
            }),
            columnHelper.accessor('closed', {
                header: () => (
                    <div className='flex justify-center'>
                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#4caf50' }} />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className='flex justify-center'>
                        <StatusBadge bgColor='#4caf50'>{row.original.closed}</StatusBadge>
                    </div>
                )
            }),
            columnHelper.accessor('wip', {
                header: () => (
                    <div className='flex justify-center'>
                        <Box sx={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: '19px solid #ffd900' }} />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className='flex justify-center'>
                        <StatusBadge bgColor='#ffd900'>{row.original.wip}</StatusBadge>
                    </div>
                )
            }),
            columnHelper.accessor('delayed', {
                header: () => (
                    <div className='flex justify-center'>
                        <Box sx={{ width: 18, height: 18, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                            <i className='ri-close-line' style={{ fontSize: '16px', fontWeight: 'bold' }} />
                        </Box>
                    </div>
                ),
                cell: ({ row }) => (
                    <div className='flex justify-center'>
                        <StatusBadge bgColor='#f44336'>{row.original.delayed}</StatusBadge>
                    </div>
                )
            }),
            columnHelper.accessor('closedWithDelay', {
                header: () => (
                    <div className='flex justify-center'>
                        <Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: '#9fa6ad' }} />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className='flex justify-center'>
                        <StatusBadge bgColor='#9fa6ad'>{row.original.closedWithDelay}</StatusBadge>
                    </div>
                )
            }),
            columnHelper.accessor('onHold', {
                header: () => (
                    <div className='flex justify-center'>
                        <Box sx={{ width: 18, height: 18, border: '2px solid #7dabf5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7dabf5', fontWeight: 'bold', fontSize: '14px' }}>
                            H
                        </Box>
                    </div>
                ),
                cell: ({ row }) => (
                    <div className='flex justify-center'>
                        <StatusBadge bgColor='#7dabf5'>{row.original.onHold}</StatusBadge>
                    </div>
                )
            })
        ],
        [firstColumnLabel]
    )

    const table = useReactTable<any>({
        data: processedData,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: {
                pageSize: 50
            }
        }
    })

    return (
        <Card>
            {title && (
                <CardHeader
                    title={title}
                    titleTypographyProps={{ align: 'center', fontWeight: 'bold' }}
                />
            )}
            <CardContent>
                <div className='overflow-x-auto overflow-y-auto'>
                    <table className={classnames(tableStyles.table, 'border border-[#262b431f]')}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className='sticky top-0 z-10'>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={classnames('flex', {
                                                        'justify-center': header.id !== 'label',
                                                        'justify-start': header.id === 'label'
                                                    })}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        {table.getFilteredRowModel().rows.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                                        No data available
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr
                                        key={row.id}
                                        className={classnames({
                                            selected: row.getIsSelected()
                                        })}
                                        style={row.original.label === 'Total' ? { fontWeight: 'bold', backgroundColor: 'var(--mui-palette-action-hover)' } : undefined}
                                    >
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
            </CardContent>
        </Card>
    )
}

export default ProjectStatusTable
