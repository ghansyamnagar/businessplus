'use client'

import { useEffect, useState, useMemo, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'

import AddEditActualAndTarget from './addEditActualAndTarget'

import type { AppDispatch } from '@/redux-store'
import type { DepartmentType } from '@/types/apps/departmentTypes'
import type { SectionType } from '@/types/apps/sectionTypes'

import { getKpiTrackersTrackRequest } from '@/redux-store/slices/kpiTracker/kpiTracker.slice'
import { getDepartmentListRequest, getSectionListRequest } from '@/redux-store/slices/user/user.slice'
import tableStyles from '@core/styles/table.module.css'
import { useModulePermission } from '@/hooks/useModulePermission'
import { useParams, useRouter } from 'next/navigation'

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const KpiDataListTable = () => {
    const { data: session } = useSession()
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    const { lang } = useParams()

    const [data, setData] = useState<any[]>([])
    const [filterUnit, setFilterUnit] = useState('')
    const [departments, setDepartments] = useState<DepartmentType[]>([])
    const [filterDept, setFilterDept] = useState('')
    const [sections, setSections] = useState<SectionType[]>([])
    const [filterSection, setFilterSection] = useState('')
    const [loading, setLoading] = useState(false)

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedKpiId, setSelectedKpiId] = useState<number | null>(null)
    const [selectedAction, setSelectedAction] = useState<'Target' | 'Actual'>('Actual')
    const [selectedKpiData, setSelectedKpiData] = useState<any>(null)

    const selectedYear = (session?.user as any)?.userSelectedYear

    const kpiTargetPermission = useModulePermission('Kpi_targets')
    const kpiActualPermission = useModulePermission('Kpi_actuals')

    const historicalYears = useMemo(() => {
        if (!selectedYear) return [0, 0, 0, 0]
        return [
            selectedYear - 4,
            selectedYear - 3,
            selectedYear - 2,
            selectedYear - 1,
        ]
    }, [selectedYear])

    const monthLabels = useMemo(() => {
        const yearSuffix = selectedYear ? ` ${String(selectedYear).slice(-2)}` : ''
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => m + yearSuffix)
    }, [selectedYear])

    useEffect(() => {
        if (session?.user) {
            const unitId = (session.user as any)?.unit_selected?.id
            if (unitId) setFilterUnit(String(unitId))
        }
    }, [session])

    useEffect(() => {
        if (filterUnit) {
            dispatch(getDepartmentListRequest({
                payload: { unit_id: filterUnit },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setDepartments(response.data.filter((d: DepartmentType) => String(d.unit_id) === filterUnit))
                    } else {
                        setDepartments([])
                    }
                }
            }))
        }
    }, [filterUnit, dispatch])

    useEffect(() => {
        setFilterSection('')
        if (filterDept) {
            dispatch(getSectionListRequest({
                payload: { dept_id: filterDept },
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        setSections(response.data.filter((s: SectionType) =>
                            String(s.unit_id) === filterUnit &&
                            (!filterDept || String(s.dept_id) === filterDept)
                        ))
                    } else {
                        setSections([])
                    }
                }
            }))
        } else {
            setSections([])
        }
    }, [filterDept, dispatch])

    const allDeptIds = useMemo(() => {
        return departments.map(d => d.dept_id).join(',')
    }, [departments])

    const fetchData = () => {
        if (!allDeptIds) return
        setLoading(true)
        dispatch(getKpiTrackersTrackRequest({
            payload: {
                dept_id: filterDept || allDeptIds
            },
            callback: (response: any) => {
                if (response?.status === 'Success' || response?.status === 'success') {
                    setData(response.data || [])
                } else {
                    setData([])
                }
                setLoading(false)
            }
        }))
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allDeptIds, filterDept, selectedYear, dispatch])

    const getCellStyle = (targetVal: any, actualVal: any, idealTrend: string): React.CSSProperties => {
        if (actualVal === null || actualVal === undefined) return {}
        const t = parseFloat(String(targetVal))
        const a = parseFloat(String(actualVal))
        if (isNaN(t) || isNaN(a) || t === 0) return {}

        let isGood = idealTrend === 'positive' ? a >= t : a <= t

        return {
            backgroundColor: isGood ? '#4caf50' : '#ff0000',
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 8px',
            display: 'inline-block',
            minWidth: '36px',
            fontWeight: 500
        }
    }

    const getYtdStyle = (kpistatus: number): React.CSSProperties => {
        let bgColor = '#ff0000'
        if (kpistatus >= 1) bgColor = '#4caf50'
        else if (kpistatus >= 0.8) bgColor = '#ffd900'

        return { backgroundColor: bgColor, color: '#fff', borderRadius: '12px', padding: '2px 8px', display: 'inline-block', minWidth: '36px', fontWeight: 600 }
    }

    const filteredData = useMemo(() => {
        let result = data
        if (filterDept) {
            result = result.filter((dept: any) => String(dept.id) === filterDept)
        }
        if (filterSection) {
            result = result.map((dept: any) => ({
                ...dept,
                add_kpis_data: dept.add_kpis_data?.filter((kpi: any) => String(kpi.section_id) === filterSection)
            }))
        }
        return result.filter((dept: any) => dept.add_kpis_data && dept.add_kpis_data.length > 0)
    }, [data, filterDept, filterSection])

    return (
        <Card>
            <CardHeader title='Key Performance Indicator Data' className='pbe-4' />
            <Divider />
            <Grid container spacing={4} className='p-3' alignItems='center'>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <FormControl fullWidth size='small'>
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={filterDept}
                            label='Department'
                            onChange={e => setFilterDept(e.target.value)}
                            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
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
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <FormControl fullWidth size='small'>
                        <InputLabel>Section</InputLabel>
                        <Select
                            value={filterSection}
                            label='Section'
                            onChange={e => setFilterSection(e.target.value)}
                            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
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
                <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                    <Button
                        variant='outlined'
                        color='secondary'
                        fullWidth
                        onClick={() => {
                            setFilterDept('')
                            setFilterSection('')
                        }}
                    >
                        Reset
                    </Button>
                </Grid>
            </Grid>

            {loading ? (
                <Box p={4} textAlign='center'>
                    <CircularProgress />
                </Box>
            ) : filteredData.length === 0 ? (
                <Box p={4} textAlign='center'>
                    <Typography>No data available</Typography>
                </Box>
            ) : (
                filteredData.map((dept: any) => (
                    <Box key={dept.id} sx={{ mb: 3 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: 2,
                                py: 2,
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            <Typography variant='subtitle1' fontWeight={700}>
                                Department: {dept.dept_name}
                            </Typography>
                            <Box onClick={() => { router.push(`/${lang}/apps/kpiTracker/kpiDataGraph/${dept.id}`); }}>
                                <Tooltip title={'View Graph'} arrow>
                                    <IconButton size='small'>
                                        <i className='ri-bar-chart-2-line text-textSecondary' />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        <div className='overflow-x-auto'>
                            <table className={tableStyles.dashboardTable} style={{ minWidth: '1800px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', minWidth: '140px' }}>KPI</th>
                                        <th style={{ minWidth: '30px' }}>Def</th>
                                        <th style={{ minWidth: '70px' }}>UoM</th>
                                        <th style={{ minWidth: '40px' }}>Trend</th>
                                        <th style={{ minWidth: '90px' }}>Section</th>
                                        <th style={{ minWidth: '40px' }}></th>
                                        {historicalYears.map(year => (
                                            <th key={`year-${year}`} style={{ minWidth: '35px' }}>{year}</th>
                                        ))}
                                        {monthLabels.map(m => (
                                            <th key={m} style={{ minWidth: '55px' }}>{m}</th>
                                        ))}
                                        <th style={{ minWidth: '50px' }}>YTD</th>
                                        <th style={{ minWidth: '55px' }}>YT {String(selectedYear || '').slice(-2)}</th>
                                        <th style={{ minWidth: '50px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dept.add_kpis_data.map((kpi: any) => {
                                        const currentTarget = kpi.kpi_targets?.find((t: any) => t.target_year === selectedYear)
                                        const currentActual = kpi.kpi_actuals?.find((a: any) => a.actual_year === selectedYear)

                                        const getYearTarget = (year: number) => {
                                            const t = kpi.kpi_targets?.find((t: any) => t.target_year === year)
                                            return t?.has_kpi_target ? t.avg || 0 : 0
                                        }

                                        const getYearActual = (year: number) => {
                                            const a = kpi.kpi_actuals?.find((a: any) => a.actual_year === year)
                                            return a?.has_kpi_actual ? a.avg || 0 : 0
                                        }

                                        return (
                                            <Fragment key={kpi.kpi_id}>
                                                <tr key={`${kpi.kpi_id}-target`}>
                                                    <td rowSpan={2} style={{ textAlign: 'left', fontWeight: 600, verticalAlign: 'middle' }}>
                                                        <Tooltip title={kpi.kpi_definition || ''} arrow>
                                                            <span>{kpi.kpi_name}</span>
                                                        </Tooltip>
                                                    </td>
                                                    <td rowSpan={2} style={{ verticalAlign: 'middle' }}>
                                                        <Tooltip title={kpi.kpi_definition || ''} arrow>
                                                            <IconButton size='small'>
                                                                <i className='ri-file-text-line' style={{ fontSize: '14px' }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </td>
                                                    <td rowSpan={2} style={{ fontSize: '12px', verticalAlign: 'middle' }}>
                                                        {kpi.unit_of_measurement}
                                                    </td>
                                                    <td rowSpan={2} style={{ verticalAlign: 'middle' }}>
                                                        {kpi.ideal_trend === 'positive' ? (
                                                            <i className='ri-arrow-up-line' style={{ color: '#4caf50', fontSize: '16px', fontWeight: 'bold' }} />
                                                        ) : (
                                                            <i className='ri-arrow-down-line' style={{ color: '#ff0000', fontSize: '16px', fontWeight: 'bold' }} />
                                                        )}
                                                    </td>
                                                    <td rowSpan={2} style={{ fontSize: '12px', verticalAlign: 'middle' }}>
                                                        {kpi.section_name}
                                                    </td>
                                                    <td style={{ fontWeight: 600, fontSize: '12px' }}>Target</td>
                                                    {historicalYears.map((year: any) => (
                                                        <td key={`t-${kpi.kpi_id}-${year}`}>{getYearTarget(year)}</td>
                                                    ))}
                                                    {MONTHS.map(month => (
                                                        <td key={`${kpi.kpi_id}-t-${month}`}>
                                                            {currentTarget?.[month] !== null && currentTarget?.[month] !== undefined ? currentTarget[month] : '-'}
                                                        </td>
                                                    ))}
                                                    <td style={{ fontWeight: 600 }}>
                                                        {currentTarget?.ytd || '-'}
                                                    </td>
                                                    <td style={{ fontWeight: 600 }}>
                                                        {currentTarget?.year_end || currentTarget?.avg || '-'}
                                                    </td>
                                                    <td style={{ verticalAlign: 'middle' }}>
                                                        {kpiTargetPermission?.acc_edit === 1 && (
                                                            <Tooltip title="Edit Target" arrow>
                                                                <IconButton
                                                                    size='small' className='p-0'
                                                                    onClick={() => {
                                                                        setSelectedKpiId(kpi.kpi_id)
                                                                        setSelectedAction('Target')
                                                                        setSelectedKpiData(kpi)
                                                                        setEditDialogOpen(true)
                                                                    }}
                                                                >
                                                                    <i className='ri-edit-box-line text-textSecondary' style={{ fontSize: '18px' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr key={`${kpi.kpi_id}-actual`} style={{ backgroundColor: '#fafafa' }}>
                                                    <td style={{ fontWeight: 600, fontSize: '12px' }}>Actual</td>
                                                    {historicalYears.map(year => (
                                                        <td key={`a-${kpi.kpi_id}-${year}`}>{getYearActual(year)}</td>
                                                    ))}
                                                    {MONTHS.map(month => {
                                                        const targetVal = currentTarget?.[month]
                                                        const actualVal = currentActual?.[month]
                                                        const style = getCellStyle(targetVal, actualVal, kpi.ideal_trend)

                                                        return (
                                                            <td key={`${kpi.kpi_id}-a-${month}`}>
                                                                {actualVal !== null && actualVal !== undefined ? (
                                                                    <span style={style}>{actualVal}</span>
                                                                ) : '-'}
                                                            </td>
                                                        )
                                                    })}
                                                    <td>
                                                        <span style={getYtdStyle(kpi.kpistatus)}>
                                                            {currentActual?.ytd || '-'}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 600 }}>
                                                        {currentActual?.avg || '-'}
                                                    </td>
                                                    <td style={{ verticalAlign: 'middle' }}>
                                                        {kpiActualPermission?.acc_edit === 1 && (
                                                            <Tooltip title="Edit Actual" arrow>
                                                                <IconButton
                                                                    size='small' className='p-0'
                                                                    onClick={() => {
                                                                        setSelectedKpiId(kpi.kpi_id)
                                                                        setSelectedAction('Actual')
                                                                        setSelectedKpiData(kpi)
                                                                        setEditDialogOpen(true)
                                                                    }}
                                                                >
                                                                    <i className='ri-edit-box-line text-textSecondary' style={{ fontSize: '18px' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </td>
                                                </tr>
                                            </Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Box>
                ))
            )}
            {editDialogOpen && selectedKpiId && (
                <AddEditActualAndTarget
                    open={editDialogOpen}
                    kpiId={selectedKpiId}
                    selectedYear={selectedYear}
                    action={selectedAction}
                    kpiData={selectedKpiData}
                    handleClose={(refresh) => {
                        setEditDialogOpen(false)
                        if (refresh) fetchData()
                    }}
                />
            )}
        </Card>
    )
}

export default KpiDataListTable
