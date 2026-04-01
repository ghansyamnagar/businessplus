'use client'

// React Imports
import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'

// MUI Imports
import Card from '@mui/material/Card'
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

export type DepartmentData = {
    id: number
    department: string
    totalKpi: number
    onTrack: number // Green
    warning: number // Yellow
    critical: number // Red
    unknown: number // Grey
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value)

    // Store the itemRank info
    addMeta({
        itemRank
    })

    // Return if the item should be filtered in/out
    return itemRank.passed
}

// Column Definitions
const columnHelper = createColumnHelper<any>()


interface DepartmentWiseDataProps {
    departmentData?: any[]
}

const DepartmentWiseData = ({ departmentData }: DepartmentWiseDataProps) => {
    // States
    const isTaskData = useMemo(() => departmentData && departmentData.length > 0 && (departmentData[0].hasOwnProperty('closed') || departmentData[0].hasOwnProperty('open')), [departmentData])

    const data = useMemo(() => {
        if (!departmentData) return []

        if (isTaskData) {
            const processData = departmentData.map((item: any) => ({
                id: item.dept_id,
                department: item.dept_name,
                totalKpi: item.total || 0,
                closed: item.closed || 0,
                wip: item.open || 0,
                delayed: item.delayed || 0,
                closedWithDelay: item.closedWithDelay || 0,
                onHold: item.onHold || 0
            }))

            const total = processData.reduce((acc, curr) => ({
                totalKpi: acc.totalKpi + (curr.totalKpi || 0),
                closed: acc.closed + (curr.closed || 0),
                wip: acc.wip + (curr.wip || 0),
                delayed: acc.delayed + (curr.delayed || 0),
                closedWithDelay: acc.closedWithDelay + (curr.closedWithDelay || 0),
                onHold: acc.onHold + (curr.onHold || 0)
            }), { totalKpi: 0, closed: 0, wip: 0, delayed: 0, closedWithDelay: 0, onHold: 0 })

            if (processData.length > 0) {
                processData.push({ id: 'total', department: 'Total', ...total })
            }
            return processData
        } else {
            const processData = departmentData.map((item: any) => ({
                id: item.dept_id,
                department: item.dept_name,
                totalKpi: item.all_total_kpi,
                onTrack: item.green,
                warning: item.yellow,
                critical: item.red,
                unknown: item.gray
            }))

            const total = processData.reduce((acc, curr) => ({
                totalKpi: acc.totalKpi + (curr.totalKpi || 0),
                onTrack: acc.onTrack + (curr.onTrack || 0),
                warning: acc.warning + (curr.warning || 0),
                critical: acc.critical + (curr.critical || 0),
                unknown: acc.unknown + (curr.unknown || 0)
            }), { totalKpi: 0, onTrack: 0, warning: 0, critical: 0, unknown: 0 })

            if (processData.length > 0) {
                processData.push({ id: 'total', department: 'Total', ...total })
            }
            return processData
        }
    }, [departmentData, isTaskData])

    const columns = useMemo<ColumnDef<any, any>[]>(
        () => {
            const baseColumns = [
                columnHelper.accessor('department', {
                    header: 'Department',
                    cell: ({ row }) => (
                        <Typography variant='body2' fontWeight='medium'>
                            {row.original.department}
                        </Typography>
                    )
                }),
                columnHelper.accessor('totalKpi', {
                    header: isTaskData ? 'Total Tasks' : 'Total KPI',
                    cell: ({ row }) => (
                        <Typography className='text-center'>{row.original.totalKpi}</Typography>
                    )
                })
            ]

            if (isTaskData) {
                return [
                    ...baseColumns,
                    columnHelper.accessor('closed', {
                        header: () => <div className='flex justify-center'><Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#4caf50' }} /></div>,
                        cell: ({ row }) => <div className='flex justify-center'><StatusBadge bgColor='#4caf50'>{row.original.closed || 0}</StatusBadge></div>
                    }),
                    columnHelper.accessor('wip', {
                        header: () => (
                            <div className='flex justify-center'>
                                <Box sx={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: '19px solid #ffd900' }} />
                            </div>
                        ),
                        cell: ({ row }) => <div className='flex justify-center'><StatusBadge bgColor='#ffd900'>{row.original.wip || 0}</StatusBadge></div>
                    }),
                    columnHelper.accessor('delayed', {
                        header: () => (
                            <div className='flex justify-center'>
                                <Box sx={{ width: 18, height: 18, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                                    <i className='ri-close-line' style={{ fontSize: '16px', fontWeight: 'bold' }} />
                                </Box>
                            </div>
                        ),
                        cell: ({ row }) => <div className='flex justify-center'><StatusBadge bgColor='#f44336'>{row.original.delayed || 0}</StatusBadge></div>
                    }),
                    columnHelper.accessor('closedWithDelay', {
                        header: () => <div className='flex justify-center'><Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: '#9fa6ad' }} /></div>,
                        cell: ({ row }) => <div className='flex justify-center'><StatusBadge bgColor='#9fa6ad'>{row.original.closedWithDelay || 0}</StatusBadge></div>
                    }),
                    columnHelper.accessor('onHold', {
                        header: () => (
                            <div className='flex justify-center'>
                                <Box sx={{ width: 18, height: 18, border: '2px solid #7dabf5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7dabf5', fontWeight: 'bold', fontSize: '14px' }}>
                                    H
                                </Box>
                            </div>
                        ),
                        cell: ({ row }) => <div className='flex justify-center'><StatusBadge bgColor='#7dabf5'>{row.original.onHold || 0}</StatusBadge></div>
                    })
                ]
            }

            return [
                ...baseColumns,
                columnHelper.accessor('onTrack', {
                    header: () => (
                        <div className='flex justify-center'>
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#4caf50' }} />
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className='flex justify-center'>
                            <StatusBadge bgColor='#4caf50'>{row.original.onTrack || 0}</StatusBadge>
                        </div>
                    )
                }),
                columnHelper.accessor('warning', {
                    header: () => (
                        <div className='flex justify-center'>
                            <Box
                                sx={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '10px solid transparent',
                                    borderRight: '10px solid transparent',
                                    borderBottom: '18px solid #ffd900',
                                }}
                            />
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className='flex justify-center'>
                            <StatusBadge bgColor='#ffd900'>{row.original.warning || 0}</StatusBadge>
                        </div>
                    )
                }),
                columnHelper.accessor('critical', {
                    header: () => (
                        <div className='flex justify-center items-center'>
                            <Box sx={{ width: 18, height: 18, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                                <i className='ri-close-line' style={{ fontSize: '16px', fontWeight: 'bold' }} />
                            </Box>
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className='flex justify-center'>
                            <StatusBadge bgColor='#f44336'>{row.original.critical || 0}</StatusBadge>
                        </div>
                    )
                }),
                columnHelper.accessor('unknown', {
                    header: () => (
                        <div className='flex justify-center'>
                            <Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: '#9fa6ad' }} />
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className='flex justify-center'>
                            <StatusBadge bgColor='#9fa6ad'>{row.original.unknown || 0}</StatusBadge>
                        </div>
                    )
                }),
            ]
        },
        [isTaskData]
    )

    const table = useReactTable<any>({
        data,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: {
                pageSize: 10
            }
        }
    })

    return (
        //  <div className='overflow-x-auto h-[450px] overflow-y-auto'>
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
                                                'justify-center': header.id !== 'department',
                                                'justify-start': header.id === 'department'
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
                        {table
                            .getRowModel()
                            .rows.map(row => {
                                return (
                                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })}
                    </tbody>
                )}
            </table>
        </div >

    )
}

export default DepartmentWiseData
