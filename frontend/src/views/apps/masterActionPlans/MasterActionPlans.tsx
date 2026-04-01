
'use client'

// React Imports
import { useEffect, useState, useMemo, forwardRef } from 'react'

// Third-party Imports
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import classnames from 'classnames'
import Collapse from '@mui/material/Collapse'
// import KeyboardArrowRight from '@mui/material/KeyboardArrowRight'
// import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { format } from 'date-fns'
import InputAdornment from '@mui/material/InputAdornment'
import type { AppDispatch } from '@/redux-store'
import type { DepartmentType } from '@/types/apps/departmentTypes'

import { departmentWiseStrategicObjectivesRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import { ChevronRight, Building2, Target, Lightbulb, ClipboardList, Activity } from "lucide-react";
import { getStrObjStatusRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'


const renderStatusIcon = (status: string) => {

    if (status === 'Green') {
        return (
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4caf50' }} />
        )
    }

    if (status === 'Yellow') {
        return (
            <Box
                sx={{
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '16px solid #ffd900'
                }}
            />
        )
    }

    if (status === 'Red') {
        return (
            <div className='border-2 border-red-500 rounded-sm w-4 h-4 flex items-center justify-center'>
                <i className='ri-close-line text-red-500' style={{ fontSize: '14px' }} />
            </div>
        )
    }

    if (status === 'Gray (Started)' || status === 'Open(Un Hold)' || status === 'Grey') {
        return (
            <Box sx={{ width: 16, height: 16, borderRadius: '3px', bgcolor: '#9fa6ad' }} />
        )
    }

    return null
}

const AccordionRow = ({
    isOpen,
    onClick,
    icon: Icon,
    label,
    title,
    colorTheme,
    borderColor,
    status,
    children,
    showArrow = true
}: any) => {

    const themeClasses: any = {
        slate: "border-slate-600",
        blue: "border-blue-500 ",
        emerald: "border-emerald-500 ",
        amber: "border-amber-500 "
    };

    return (
        <div className="flex flex-col mb-1">

            <button
                onClick={onClick}
                className={`w-full flex items-center p-3 rounded-lg  border-l-4 border-t border-r border-b border-t-gray-300 border-r-gray-300 border-b-gray-300 text-left transition bg-white ${themeClasses[colorTheme] || ""}`}
                style={{ borderLeftColor: borderColor }}
            >

                {/* <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white mr-3 shadow-sm">
                    <Icon size={16} />
                </div> */}

                <div className="flex-1">
                    {/* <p className="text-xs font-semibold uppercase text-gray-500">
                        {label}
                    </p> */}

                    <h4 className="text-sm font-normal">
                        {title}
                    </h4>
                </div>
                <Box className="flex items-center gap-7 mr-5">

                    {status && (
                        <>
                            <span
                                className="text-m text-black"
                            // style={{
                            //     color:
                            //         colorTheme === "blue"
                            //             ? "#2563eb"
                            //             : colorTheme === "emerald"
                            //                 ? "#059669"
                            //                 : colorTheme === "amber"
                            //                     ? "#ca8a04"
                            //                     : colorTheme === "slate"
                            //                         ? "#29daed"
                            //                         : "#374151"
                            // }}
                            >

                                {label}
                            </span>

                            {/* <span
                                className="w-4 h-4 rounded-m"
                                style={{
                                    backgroundColor: status.includes("Gray") ? "#9ca3af" :
                                        status.includes("Green") ? "#22c55e" :
                                            status.includes("Red") ? "#ef4444" :
                                                status.includes("Yellow") ? "#eab308" :
                                                    "#9ca3af"
                                }}
                            /> */}
                            {renderStatusIcon(status)}
                        </>
                    )}

                </Box>
                <div className="w-5 flex justify-end">
                    {showArrow && (
                        <ChevronRight
                            size={18}
                            className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                    )}
                </div>

            </button>

            {isOpen && (
                <div className="ml-6 mt-2 pl-4 border-gray-200">
                    {children}
                </div>
            )}

        </div>
    );
};

const MasterActionPlans = () => {
    const dispatch = useDispatch<AppDispatch>()

    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [openDept, setOpenDept] = useState<number | null>(null)
    const [openSO, setOpenSO] = useState<number | null>(null)
    const [openInit, setOpenInit] = useState<number | null>(null)
    const [openAction, setOpenAction] = useState<number | null>(null)
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [targetDate, setTargetDate] = useState('')
    const handleReset = () => {
        setDepartmentFilter('')
        setStatusFilter('')
        setTargetDate('')
    }
    const { data: session } = useSession()
    const selectedYear = (session?.user as any)?.userSelectedYear

    const [statuses, setStatuses] = useState<any[]>([])
    useEffect(() => {

        dispatch(
            getStrObjStatusRequest({
                payload: {},
                callback: (response: any) => {

                    if (response?.status === 'success') {
                        setStatuses(response.data)
                    }

                }
            })
        )

    }, [dispatch])


    const [expandAll, setExpandAll] = useState(false)

    const PickersComponent = forwardRef((props: any, ref) => {
        return (
            <TextField
                inputRef={ref}
                fullWidth
                {...props}
                label={props.label || ''}
                size="small"
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <i className="ri-calendar-line text-textSecondary text-[18px]" />
                            </InputAdornment>
                        )
                    }
                }}
            />
        )
    })


    useEffect(() => {
        if (!selectedYear) return
        setLoading(true)

        dispatch(
            departmentWiseStrategicObjectivesRequest({
                payload: {
                    year: selectedYear,
                    deptIdFilter: departmentFilter,
                    target_date: targetDate,
                    status_id: statusFilter
                },
                callback: (response: any) => {
                    setLoading(false)

                    if (response?.status === 'success') {
                        setData(response.data)
                    } else {
                        toast.error(response?.message || 'Failed to fetch data')
                    }
                }
            })
        )
    }, [dispatch, selectedYear, departmentFilter, targetDate, statusFilter])
    return (
        <>
            <Card>
                <CardHeader title='Strategic Objective List' className='pbe-4' />
                <Box className="flex justify-between items-center px-4 pb-3">

                    <Box className="flex items-center gap-3">

                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel id="department-label">Department</InputLabel>
                            <Select
                                label="Department"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >


                                {data?.map((dept: any) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.dept_name}
                                    </MenuItem>
                                ))}

                            </Select>
                        </FormControl>



                        <AppReactDatepicker
                            id="filter-target-date"
                            selected={targetDate ? new Date(targetDate) : null}
                            onChange={(date: Date | null) =>
                                setTargetDate(date ? format(date, 'yyyy-MM-dd') : '')
                            }
                            placeholderText="YYYY-MM-DD"
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={50}
                            customInput={<PickersComponent label="Target Date" />}
                        />


                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel id="status-label" >Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >

                                    {statuses?.map((status: any) => (
                                        <MenuItem key={status.status_id} value={status.status_id}>
                                            {status.status_name}
                                        </MenuItem>
                                    ))}

                                </Select>
                            </FormControl>
                        </Grid>


                        <Button
                            onClick={handleReset}
                            variant='outlined'
                            color='secondary'
                            // fullWidth
                            size="small"
                        >
                            Reset
                        </Button>
                    </Box>
                    <Box className="flex gap-2">

                        <Button
                            variant="outlined"
                            size="small"
                            color="secondary"
                            onClick={() => setExpandAll(true)}
                        >
                            Open All
                        </Button>

                        <Button
                            variant="outlined"
                            size="small"
                            color="secondary"
                            onClick={() => {
                                setExpandAll(false)
                                setOpenSO(null)
                                setOpenInit(null)
                                setOpenAction(null)
                            }}
                        >
                            Close All
                        </Button>

                    </Box>

                </Box>
                <Box className="flex flex-col gap-4 p-4">
                    {loading ? (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : (

                        data?.map((dept: any) =>
                            dept.strategic_objectives?.map((so: any) => (

                                <AccordionRow
                                    key={so.strategic_objectives_id}
                                    isOpen={expandAll || openSO === so.strategic_objectives_id}
                                    onClick={() =>
                                        setOpenSO(openSO === so.strategic_objectives_id ? null : so.strategic_objectives_id)
                                    }
                                    icon={Target}
                                    label="Strategic Objective"
                                    title={`${so.so_sno ?? ''}.  ${so.target}`}
                                    colorTheme="blue"
                                    status={so.status_name}
                                >

                                    {so.initiatives && so.initiatives.length > 0 ? (
                                        so.initiatives.map((init: any) => (


                                            <AccordionRow
                                                key={init.initiatives_id}
                                                isOpen={expandAll || openInit === init.initiatives_id}
                                                onClick={() =>
                                                    setOpenInit(openInit === init.initiatives_id ? null : init.initiatives_id)
                                                }
                                                icon={Lightbulb}
                                                label="Initiative"
                                                title={`${init.sr_no ? init.sr_no + ' ' : ''}.  ${init.definition}`}
                                                colorTheme="emerald"
                                                status={init.status_name}
                                            >

                                                {init.action_plans && init.action_plans.length > 0 ? (
                                                    init.action_plans.map((action: any, i: number) => (

                                                        <AccordionRow
                                                            key={`${action.action_plans_id}-${i}`}
                                                            isOpen={expandAll || openAction === action.action_plans_id}
                                                            onClick={() =>
                                                                setOpenAction(
                                                                    openAction === action.action_plans_id
                                                                        ? null
                                                                        : action.action_plans_id
                                                                )
                                                            }
                                                            icon={ClipboardList}
                                                            label="Action Plan"
                                                            title={`${action.sr_no ? action.sr_no + ' ' : ''}.  ${action.definition}`}
                                                            colorTheme="amber"
                                                            status={action.status_name}
                                                        >

                                                            {/* <div className="rounded-lg p-3 border mt-2"> */}

                                                            {action.kpis && action.kpis.length > 0 ? (
                                                                action.kpis.map((kpi: any, index: number) => (
                                                                    <AccordionRow
                                                                        key={kpi.kpi_id}
                                                                        isOpen={false}
                                                                        onClick={() => { }}
                                                                        icon={Activity}
                                                                        label="KPI"
                                                                        title={kpi.kpi_name}
                                                                        // colorTheme="blue"
                                                                        colorTheme="slate"
                                                                        borderColor="#29daed"
                                                                        status={kpi.status_name}
                                                                        showArrow={false}
                                                                    />

                                                                ))
                                                            ) : (
                                                                <div className="bg-white px-3 py-2 rounded border mb-1 text-sm text-gray-500">
                                                                    No KPI
                                                                </div>
                                                            )}

                                                            {/* </div> */}

                                                        </AccordionRow>
                                                    ))
                                                ) : (
                                                    <div className="bg-white px-3 py-2 rounded border mb-1 text-sm text-gray-500">
                                                        No Action Plan
                                                    </div>
                                                )}



                                            </AccordionRow>

                                        ))
                                    ) : (
                                        <div className="bg-white px-3 py-2 rounded border mb-1 text-sm text-gray-500">
                                            No Initiative
                                        </div>
                                    )}

                                </AccordionRow>

                            ))
                        )

                    )}

                </Box>
                <Divider />



            </Card >

        </>
    )
}

export default MasterActionPlans
