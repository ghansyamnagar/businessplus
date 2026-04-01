
'use client'

// React Imports
import React from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Style Imports
// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

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

const StraInitiActionTableStatus = ({ strategicObjectivesDash }: any) => {
    const { lang: locale } = useParams()
    const data = strategicObjectivesDash?.strategic_objectives ? strategicObjectivesDash : null

    const renderBadge = (value: number, color: string) => {
        return (
            <div className='flex justify-center'>
                <StatusBadge bgColor={color}>{value || 0}</StatusBadge>
            </div>
        )
    }

    const rows = [
        { name: 'Strategic Objectives', key: 'strategic_objectives', url: '/apps/strategicObjective/strategicObjective' },
        { name: 'Initiatives', key: 'initiatives', url: '/apps/initiatives/initiatives' },
        { name: 'Action Plan', key: 'action_plans', url: '/apps/actionPlans/actionPlans' }
    ]

    return (
        // <div className='overflow-x-auto p-4 is-full'>
        <div className='overflow-x-auto p-3 max-is-[600px]'>
            <table className={tableStyles.table} >
                <thead>
                    <tr>
                        <th className='text-left pl-3'>Name</th>
                        <th className='text-center'>Total</th>
                        <th className='text-center'>
                            <div className='flex justify-center'>
                                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#4caf50' }} />
                            </div>
                        </th>
                        <th className='text-center'>
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
                        </th>
                        <th className='text-center'>
                            <div className='flex justify-center items-center'>
                                <div className='border-2 border-red-500 rounded-sm w-5 h-5 flex items-center justify-center'>
                                    <i className='ri-close-line text-red-500 font-bold' style={{ fontSize: '18px' }} />
                                </div>
                            </div>
                        </th>
                        <th className='text-center'>
                            <div className='flex justify-center'>
                                <Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: '#9fa6ad' }} />
                            </div>
                        </th>
                        <th className='text-center'>
                            <div className='flex justify-center'>
                                <Box sx={{ width: 18, height: 18, paddingTop: "2px", borderRadius: '4px', bgcolor: '#4b89dc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>H</Box>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const rowData = data ? data[row.key] : {}
                        return (
                            <tr key={row.key}>
                                <td className='pl-3 max-w-[125px]'>
                                    <Link href={getLocalizedUrl(row.url, locale as Locale)} className='no-underline'>
                                        <Typography variant='body2' fontWeight='medium' color='primary' className='hover:underline cursor-pointer'>
                                            {row.name}
                                        </Typography>
                                    </Link>
                                </td>
                                <td className='text-center'>
                                    <Typography variant='body2' fontWeight='bold'>
                                        {rowData?.total || 0}
                                    </Typography>
                                </td>
                                <td>{renderBadge(rowData?.green, '#4caf50')}</td>
                                <td>{renderBadge(rowData?.yellow, '#ffd900')}</td>
                                <td>{renderBadge(rowData?.red, '#f44336')}</td>
                                <td>{renderBadge(rowData?.gray, '#9fa6ad')}</td>
                                <td>{renderBadge(rowData?.blue, '#4b89dc')}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default StraInitiActionTableStatus
