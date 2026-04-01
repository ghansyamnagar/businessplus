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

type DepartmentKpiData = {
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
const columnHelper = createColumnHelper<DepartmentKpiData>()

const DepartmentWiseKpi = () => {
    // States

    const departmentKpiData: DepartmentKpiData[] = [
        { id: 1, department: 'IT & Business Process', totalKpi: 1, onTrack: 0, warning: 0, critical: 0, unknown: 1 },
        { id: 2, department: 'Business development', totalKpi: 0, onTrack: 0, warning: 0, critical: 0, unknown: 0 },
        { id: 3, department: 'Quality', totalKpi: 0, onTrack: 0, warning: 0, critical: 0, unknown: 0 },
        { id: 4, department: 'Manufacturing operations', totalKpi: 0, onTrack: 0, warning: 0, critical: 0, unknown: 0 },
        { id: 5, department: 'Human Resources', totalKpi: 1, onTrack: 0, warning: 0, critical: 0, unknown: 1 },
        { id: 6, department: 'Sales & Marketing', totalKpi: 0, onTrack: 0, warning: 0, critical: 0, unknown: 0 },
        { id: 7, department: 'Finance', totalKpi: 1, onTrack: 0, warning: 0, critical: 0, unknown: 1 },
        { id: 7, department: 'Total', totalKpi: 3, onTrack: 0, warning: 0, critical: 0, unknown: 3 },
    ]

    const [data] = useState(() => [...departmentKpiData])

    const columns = useMemo<ColumnDef<DepartmentKpiData, any>[]>(
        () => [
            columnHelper.accessor('department', {
                header: 'Department',
                cell: ({ row }) => (
                    <Typography className='font-medium' color='text.primary'>
                        {row.original.department}
                    </Typography>
                )
            }),
            columnHelper.accessor('totalKpi', {
                header: 'Total KPI',
                cell: ({ row }) => (
                    <Typography className='text-center'>{row.original.totalKpi}</Typography>
                )
            }),
            columnHelper.accessor('onTrack', {
                header: () => (
                    <div className='flex justify-center'>
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#4caf50' }} />
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
                                borderBottom: '20px solid #ffd900',
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
                        <div className='border-2 border-red-500 rounded-sm w-5 h-5 flex items-center justify-center'>
                            <i className='ri-close-line text-red-500 font-bold' style={{ fontSize: '18px' }} />
                        </div>
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
                        <Box sx={{ width: 20, height: 20, borderRadius: '4px', bgcolor: '#9fa6ad' }} />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className='flex justify-center'>
                        <StatusBadge bgColor='#9fa6ad'>{row.original.unknown || 0}</StatusBadge>
                    </div>
                )
            }),
        ],
        []
    )

    const table = useReactTable<DepartmentKpiData>({
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
        <Card>
            <div className='overflow-x-auto h-[360px] overflow-y-auto'>
                <table className={tableStyles.table}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
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
            </div>
        </Card>
    )
}

export default DepartmentWiseKpi
