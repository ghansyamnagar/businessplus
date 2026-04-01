
'use client'

import { useEffect, useState, useMemo, useRef, useCallback, type ChangeEvent } from 'react'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'
import { format, parse, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useRouter } from 'next/navigation'


import type { AppDispatch } from '@/redux-store'
import { addProjectRequest, viewSingleProjectRequest } from '@/redux-store/slices/project/project.slice'
import { getDepartmentListRequest, getUserListRequest, getSingleUserDetailsRequest } from '@/redux-store/slices/user/user.slice'
import { getSelectModulesRequest, getUomListRequest } from '@/redux-store/slices/master/master.slice'

import StepProjectDetails from './components/StepProjectDetails'
import StepProjectTeam from './components/StepProjectTeam'
import StepMilestones from './components/StepMilestones'
import StepGovernance from './components/StepGovernance'
import StepBudget from './components/StepBudget'

const steps = [
    'Add New Project',
    'Project Team',
    'Project Milestones',
    'Project Governance',
    'Project Budget'
]

const MenuProps = {
    PaperProps: {
        className: 'max-bs-[250px]'
    }
}

interface NewProjectProps {
    editProjectId?: number | null
    editStepId?: number | null
}

const NewProject = ({ editProjectId = null, editStepId = null }: NewProjectProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const { data: session } = useSession()
    const router = useRouter()
    // Determine initial step:
    // - step_id 5 means all steps completed → open step 0 (first step) for full edit
    // - step_id 1-4 means that step is done → open the next step (step_id value as 0-indexed)
    // - no step_id → start at 0
    const getInitialStep = () => {
        if (!editStepId) return 0
        if (editStepId >= 5) return 0     // All steps done → open first step
        return editStepId                  // step_id N → open step N (0-indexed, which is the next step)
    }

    const [activeStep, setActiveStep] = useState(getInitialStep())
    const [projectId, setProjectId] = useState<number | null>(editProjectId)
    const [maxStepReached, setMaxStepReached] = useState(editStepId ? (editStepId >= 5 ? 4 : editStepId) : 0)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(false)
    const [selectedTeamMembers, setSelectedTeamMembers] = useState<any[]>([])
    const isEditMode = !!editProjectId

    // Logo state
    const [imgSrc, setImgSrc] = useState<string>('')
    const [leaderImgSrc, setLeaderImgSrc] = useState<string>('')
    const [coLeaderImgSrc, setCoLeaderImgSrc] = useState<string>('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const leaderFileInputRef = useRef<HTMLInputElement>(null)
    const coLeaderFileInputRef = useRef<HTMLInputElement>(null)

    const handleFileInputChange = (file: ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader()
        const { files } = file.target
        if (files && files.length !== 0) {
            reader.onload = () => setImgSrc(reader.result as string)
            reader.readAsDataURL(files[0])
            setSelectedFile(files[0])
        }
        // Reset input value so the same file can be re-selected
        file.target.value = ''
    }

    const handleLeaderFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader()
        const { files } = e.target
        if (files && files.length !== 0) {
            reader.onload = () => setLeaderImgSrc(reader.result as string)
            reader.readAsDataURL(files[0])
        }
    }

    const handleCoLeaderFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader()
        const { files } = e.target
        if (files && files.length !== 0) {
            reader.onload = () => setCoLeaderImgSrc(reader.result as string)
            reader.readAsDataURL(files[0])
        }
    }

    // Data for dropdowns
    const [departments, setDepartments] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [uoms, setUoms] = useState<any[]>([])

    const defaultStep1 = {
        project_name: '',
        department_id: '',
        project_mission: '',
        key_objective: '',
        start_date: '',
        end_date: '',
        image_id: null
    }

    const { control, handleSubmit, watch, setValue, reset, trigger, getValues, clearErrors, formState: { errors } } = useForm({
        defaultValues: {
            ...defaultStep1,
            // Team
            user_id: '',
            leader_dept_id: '',
            email: '',
            mobile: '',
            co_leader_user_id: '',
            co_leader_dept_id: '',
            co_leader_email: '',
            co_leader_mobile: '',
            company_user: [{ user_id: '', department_id: '', email: '', mobile: '' }],
            external_user: [],
            // Milestones
            mile_stone: [{ milestone_name: '', mile_stone_date: '', symbol: 'ri-star-line', description: '' }],
            // Governance
            govMeting: [{
                meeting_name: '',
                chair_person: '',
                co_chair_person: '',
                gov_member: [],
                gov_frequency: 'Monthly',
                meeting_day: '',
                meeting_shedule: '',
                gov_venue: '',
                gov_duration: 'one_hour',
                agenda: ''
            }],
            // Budget
            total_pro_cost: '',
            currency: '$',
            allocation_dept: [{ dept_id: '', allocation_dstrbt_vl: '' }]
        }
    })

    const { fields: companyUserFields, append: appendCompanyUser, remove: removeCompanyUser } = useFieldArray({ control, name: 'company_user' })
    const { fields: externalUserFields, append: appendExternalUser, remove: removeExternalUser } = useFieldArray({ control, name: 'external_user' })
    const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({ control, name: 'mile_stone' })
    const { fields: govFields, append: appendGov, remove: removeGov } = useFieldArray({ control, name: 'govMeting' })
    const { fields: budgetFields, append: appendBudget, remove: removeBudget } = useFieldArray({ control, name: 'allocation_dept' })

    const watchedStartDate = watch('start_date')
    const watchedEndDate = watch('end_date')
    const watchedLeaderId = watch('user_id')
    const watchedCoLeaderId = watch('co_leader_user_id')
    const watchedCompanyUsers = watch('company_user')

    // Compute selected user IDs to prevent duplicate selection
    const selectedUserIds = useMemo(() => {
        const ids = new Set<string>()
        if (watchedLeaderId) ids.add(String(watchedLeaderId))
        if (watchedCoLeaderId) ids.add(String(watchedCoLeaderId))
        if (watchedCompanyUsers) {
            watchedCompanyUsers.forEach((cu: any) => {
                if (cu.user_id) ids.add(String(cu.user_id))
            })
        }
        return ids
    }, [watchedLeaderId, watchedCoLeaderId, watchedCompanyUsers])

    // Filtered user lists for each dropdown (exclude already selected, but keep own current value)
    const leaderUsers = useMemo(() => {
        return users.map((u: any) => ({
            ...u,
            disabled: selectedUserIds.has(String(u.user_id)) && String(u.user_id) !== String(watchedLeaderId)
        }))
    }, [users, selectedUserIds, watchedLeaderId])

    const coLeaderUsers = useMemo(() => {
        return users.map((u: any) => ({
            ...u,
            disabled: selectedUserIds.has(String(u.user_id)) && String(u.user_id) !== String(watchedCoLeaderId)
        }))
    }, [users, selectedUserIds, watchedCoLeaderId])

    const getTeamMemberUsers = (currentIndex: number) => {
        const currentUserId = watchedCompanyUsers?.[currentIndex]?.user_id
        return users.map((u: any) => ({
            ...u,
            disabled: selectedUserIds.has(String(u.user_id)) && String(u.user_id) !== String(currentUserId)
        }))
    }

    const projectDuration = useMemo(() => {
        if (!watchedStartDate || !watchedEndDate) return ''
        const start = watchedStartDate.includes('/') ? parse(watchedStartDate, 'dd/MM/yyyy', new Date()) : parse(watchedStartDate, 'yyyy-MM-dd', new Date())
        const end = watchedEndDate.includes('/') ? parse(watchedEndDate, 'dd/MM/yyyy', new Date()) : parse(watchedEndDate, 'yyyy-MM-dd', new Date())

        const years = differenceInYears(end, start)
        const months = differenceInMonths(end, start) % 12
        const days = differenceInDays(end, start) % 30 // Rough estimation

        return `${years} Year ${months} Month ${days} Days`
    }, [watchedStartDate, watchedEndDate])

    // Budget allocation tracking
    const watchedTotalCost = watch('total_pro_cost')
    const watchedAllocations = watch('allocation_dept')

    const totalAllocated = useMemo(() => {
        if (!watchedAllocations) return 0
        return watchedAllocations.reduce((sum: number, item: any) => {
            return sum + (Number(item.allocation_dstrbt_vl) || 0)
        }, 0)
    }, [watchedAllocations])

    const remainingBudget = useMemo(() => {
        const total = Number(watchedTotalCost) || 0
        return total - totalAllocated
    }, [watchedTotalCost, totalAllocated])

    const handleStartDateChange = (date: Date | null, onChange: (value: string) => void) => {
        const dateString = date ? format(date, 'yyyy-MM-dd') : ''
        onChange(dateString)

        if (date && watchedEndDate) {
            const parsedEndDate = watchedEndDate.includes('/')
                ? parse(watchedEndDate, 'dd/MM/yyyy', new Date())
                : parse(watchedEndDate, 'yyyy-MM-dd', new Date())

            if (date > parsedEndDate) {
                setValue('end_date', dateString)
            }
        }
    }

    useEffect(() => {
        dispatch(getUserListRequest({
            payload: {},
            callback: (res: any) => res?.status === 'success' && setUsers(res.data || [])
        }))
        dispatch(getUomListRequest({
            payload: {},
            callback: (res: any) => res?.status === 'success' && setUoms(res.data || [])
        }))
        if (session) {
            const unit_id = (session.user as any)?.unit_selected?.id
            if (unit_id) {
                dispatch(getDepartmentListRequest({
                    payload: { unit_id },
                    callback: (res: any) => res?.status === 'success' && setDepartments(res.data || [])
                }))
            }
        }
    }, [dispatch, session])

    // ─── Edit Mode: Fetch project data and populate form ───────────────
    useEffect(() => {
        if (!editProjectId || !session) return
        setFetchLoading(true)
        dispatch(viewSingleProjectRequest({
            payload: { project_id: editProjectId },
            callback: (res: any) => {
                setFetchLoading(false)
                if (res?.status === 'success' && res.data) {
                    const d = res.data
                    const proj = d.projectData?.[0]
                    if (proj) {
                        // Step 1 — Project Details
                        setValue('project_name', proj.project_name || '')
                        setValue('department_id', String(proj.department_id) || '')
                        setValue('project_mission', proj.project_mission || '')
                        setValue('key_objective', proj.key_objective || '')
                        setValue('start_date', proj.start_date || '')
                        setValue('end_date', proj.end_date || '')
                        if (proj.project_logo) setImgSrc(proj.project_logo)

                        // Budget fields from projectData
                        setValue('currency', proj.currency || '$')
                        setValue('total_pro_cost', proj.project_cost ? String(proj.project_cost) : '')
                    }

                    // Step 2 — Team Members
                    const members = d.project_member_data || []
                    const leader = members.find((m: any) => m.project_leader === 1)
                    const coLeader = members.find((m: any) => m.project_leader === 2)
                    const companyMembers = members.filter((m: any) => m.project_leader === 0)

                    if (leader) {
                        setValue('user_id', String(leader.user_id))
                        setValue('email', leader.email || '')
                        setValue('mobile', leader.mobile || '')
                        // Set leader department from multi_dept_id (separately from project's department_id)
                        const leaderDepts = leader.multi_dept_id ? String(leader.multi_dept_id).split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') : []
                        setValue('leader_dept_id', leaderDepts.length === 1 ? leaderDepts[0] : '0')
                        if (leader.file_name) setLeaderImgSrc(leader.file_name)
                    }
                    if (coLeader) {
                        setValue('co_leader_user_id', String(coLeader.user_id))
                        setValue('co_leader_email', coLeader.email || '')
                        setValue('co_leader_mobile', coLeader.mobile || '')
                        const coLeaderDepts = coLeader.multi_dept_id ? String(coLeader.multi_dept_id).split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') : []
                        setValue('co_leader_dept_id', coLeaderDepts.length === 1 ? coLeaderDepts[0] : '0')
                        if (coLeader.file_name) setCoLeaderImgSrc(coLeader.file_name)
                    }
                    if (companyMembers.length > 0) {
                        setValue('company_user', companyMembers.map((m: any) => {
                            const mDepts = m.multi_dept_id ? String(m.multi_dept_id).split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') : []
                            return {
                                user_id: String(m.user_id),
                                department_id: mDepts.length === 1 ? mDepts[0] : '0',
                                email: m.email || '',
                                mobile: m.mobile || ''
                            }
                        }))
                    }

                    // External users
                    const extMembers = d.project_ex_member_data || []
                    if (extMembers.length > 0) {
                        setValue('external_user', extMembers.map((m: any) => ({
                            ex_membar_name: m.ex_membar_name || '',
                            company_name: m.company_name || '',
                            email_id: m.email_id || '',
                            phone_number: m.phone_number || ''
                        })))
                    }

                    // Build selectedTeamMembers for governance dropdowns
                    setSelectedTeamMembers(members.map((m: any) => ({
                        user_id: m.user_id,
                        name: m.name
                    })))

                    // Step 3 — Milestones
                    const milestones = d.project_milestone_data || []
                    if (milestones.length > 0) {
                        setValue('mile_stone', milestones.map((m: any) => {
                            // Convert dd-MM-yyyy to yyyy-MM-dd
                            let dateVal = m.mile_stone_date || ''
                            if (dateVal && dateVal.includes('-') && dateVal.split('-')[0].length <= 2) {
                                try {
                                    dateVal = format(parse(dateVal, 'dd-MM-yyyy', new Date()), 'yyyy-MM-dd')
                                } catch { }
                            }
                            return {
                                milestone_name: m.milestone_name || '',
                                mile_stone_date: dateVal,
                                symbol: m.symbol || 'star',
                                description: m.description || ''
                            }
                        }))
                    }

                    // Step 4 — Governance
                    const govs = d.project_goverances || []
                    if (govs.length > 0) {
                        setValue('govMeting', govs.map((g: any) => ({
                            meeting_name: g.meeting_name || '',
                            chair_person: String(g.chair_person) || '',
                            co_chair_person: String(g.co_chair_person) || '',
                            gov_member: g.member_id ? g.member_id.split(',').map((id: string) => id.trim()) : [],
                            gov_frequency: g.gov_frequency || 'Monthly',
                            meeting_day: g.meeting_day || '',
                            meeting_shedule: g.meeting_shedule || '',
                            gov_venue: g.gov_venue || '',
                            gov_duration: g.gov_duration || 'one_hour',
                            agenda: g.agenda || ''
                        })))
                    }

                    // Step 5 — Budget Allocations
                    const budgets = d.project_budget_tracking || []
                    if (budgets.length > 0) {
                        setValue('allocation_dept', budgets.map((b: any) => ({
                            dept_id: String(b.dept_id),
                            allocation_dstrbt_vl: String(b.allocation_dstrbt_vl)
                        })))
                    }
                } else {
                    toast.error(res?.message || 'Error fetching project data')
                }
            }
        }))
    }, [editProjectId, session, dispatch])

    const handleUserChange = (userId: any, type: string, index?: number) => {
        if (type === 'leader') {
            dispatch(getSingleUserDetailsRequest({
                payload: { user_id: userId },
                callback: (res: any) => {
                    if (res?.status === 'success' && res.data) {
                        const userData = res.data[0] || res.data
                        setValue('email', userData.email || '')
                        setValue('mobile', userData.mobile || '')

                        // Handle multi_dept_id correctly
                        let deptId = '0'
                        if (userData.multi_dept_id) {
                            let deptArr: string[] = []
                            if (Array.isArray(userData.multi_dept_id)) {
                                deptArr = userData.multi_dept_id.map(String)
                            } else if (typeof userData.multi_dept_id === 'string' || typeof userData.multi_dept_id === 'number') {
                                deptArr = String(userData.multi_dept_id).split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                            }
                            if (deptArr.length === 1) {
                                deptId = deptArr[0]
                            }
                        }
                        setValue('leader_dept_id', String(deptId))
                        setLeaderImgSrc(userData.profile_picture || '')
                        console.log('User detailing fetched:', userData)
                    }
                }
            }))
        } else if (type === 'co_leader') {
            dispatch(getSingleUserDetailsRequest({
                payload: { user_id: userId },
                callback: (res: any) => {
                    if (res?.status === 'success' && res.data) {
                        const userData = res.data[0] || res.data
                        setValue('co_leader_email', userData.email || '')
                        setValue('co_leader_mobile', userData.mobile || '')

                        // Handle multi_dept_id correctly
                        let deptId = '0'
                        if (userData.multi_dept_id) {
                            let deptArr: string[] = []
                            if (Array.isArray(userData.multi_dept_id)) {
                                deptArr = userData.multi_dept_id.map(String)
                            } else if (typeof userData.multi_dept_id === 'string' || typeof userData.multi_dept_id === 'number') {
                                deptArr = String(userData.multi_dept_id).split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                            }
                            if (deptArr.length === 1) {
                                deptId = deptArr[0]
                            }
                        }
                        setValue('co_leader_dept_id', String(deptId))
                        setCoLeaderImgSrc(userData.profile_picture || '')
                    }
                }
            }))
        } else {
            const user = users.find(u => String(u.user_id) === String(userId))

            // console.log('ggggggggggggggggggggggggggg', user)
            if (user) {
                if (type === 'member' && index !== undefined) {
                    setValue(`company_user.${index}.email` as any, user.email || '')
                    setValue(`company_user.${index}.mobile` as any, user.mobile || '')

                    let deptId = '0'
                    if (user.multi_dept_id) {
                        let deptArr: string[] = []
                        if (Array.isArray(user.multi_dept_id)) {
                            deptArr = user.multi_dept_id.map(String)
                        } else if (typeof user.multi_dept_id === 'string' || typeof user.multi_dept_id === 'number') {
                            deptArr = String(user.multi_dept_id).split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                        }
                        if (deptArr.length === 1) {
                            deptId = deptArr[0]
                        }
                    }
                    setValue(`company_user.${index}.department_id` as any, deptId)
                }
            }
        }
    }

    // Define which fields to validate per step
    const getStepFields = (): string[] => {
        if (activeStep === 0) {
            return ['project_name', 'department_id', 'project_mission', 'key_objective', 'start_date', 'end_date']
        } else if (activeStep === 1) {
            const fields: string[] = ['user_id', 'co_leader_user_id']
            const companyUsers = getValues('company_user') || []
            companyUsers.forEach((_: any, i: number) => {
                if (i === 0) fields.push(`company_user.${i}.user_id`)
            })
            return fields
        } else if (activeStep === 2) {
            const fields: string[] = []
            const milestones = getValues('mile_stone') || []
            milestones.forEach((_: any, i: number) => {
                fields.push(`mile_stone.${i}.milestone_name`, `mile_stone.${i}.mile_stone_date`)
            })
            return fields
        } else if (activeStep === 3) {
            const fields: string[] = []
            const govMeetings = getValues('govMeting') || []
            govMeetings.forEach((g: any, i: number) => {
                fields.push(
                    `govMeting.${i}.meeting_name`,
                    `govMeting.${i}.chair_person`,
                    `govMeting.${i}.co_chair_person`,
                    `govMeting.${i}.gov_member`,
                    `govMeting.${i}.gov_frequency`,
                    `govMeting.${i}.gov_venue`,
                    `govMeting.${i}.gov_duration`,
                    `govMeting.${i}.agenda`
                )
                const freq = g.gov_frequency
                if (freq === 'Weekly' || freq === 'Monthly') {
                    fields.push(`govMeting.${i}.meeting_day`)
                }
                if (freq === 'Monthly') {
                    fields.push(`govMeting.${i}.meeting_shedule`)
                }
            })
            return fields
        } else if (activeStep === 4) {
            const fields: string[] = ['total_pro_cost', 'currency']
            const allocations = getValues('allocation_dept') || []
            allocations.forEach((_: any, i: number) => {
                fields.push(`allocation_dept.${i}.dept_id`, `allocation_dept.${i}.allocation_dstrbt_vl`)
            })
            return fields
        }
        return []
    }

    const handleStepSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')
        const fields = getStepFields()
        // Clear ALL previous errors so stale errors from other steps don't interfere
        clearErrors()
        // Small delay to ensure Controllers are fully mounted with their rules
        await new Promise(resolve => setTimeout(resolve, 0))
        const isValid = await trigger(fields as any)
        if (!isValid) return

        // Step 5: check allocation does not exceed total cost
        if (activeStep === 4) {
            const totalCost = Number(getValues('total_pro_cost')) || 0
            const allocations = getValues('allocation_dept') || []
            const totalAlloc = allocations.reduce((sum: number, item: any) => sum + (Number(item.allocation_dstrbt_vl) || 0), 0)
            if (totalAlloc > totalCost) {
                setErrorMessage(`Total allocation (${totalAlloc}) exceeds total project cost (${totalCost})`)
                return
            }
        }

        onSubmit(getValues())
    }

    const onSubmit = (data: any) => {
        //setLoading(true)
        let stepPayload: any = {}
        // In edit mode with all steps completed (step_id >= 5), always send 5
        // to avoid breaking the workflow. Otherwise use activeStep + 1.
        let projectStepId = (isEditMode && editStepId && editStepId >= 5) ? 5 : activeStep + 1
        let projectDetails = ''

        if (activeStep === 0) {
            projectDetails = 'project'
            stepPayload = {
                project_name: data.project_name,
                department_id: Number(data.department_id),
                project_logo: imgSrc || '',
                image_id: data.image_id || null,
                project_mission: data.project_mission,
                key_objective: data.key_objective,
                start_date: data.start_date ? format(parse(data.start_date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : '',
                end_date: data.end_date ? format(parse(data.end_date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : '',
                project_duration: projectDuration
            }
        } else if (activeStep === 1) {
            projectDetails = 'projectTeam'
            stepPayload = {
                user_id: Number(data.user_id),
                project_leader_id: '',
                project_leader: 1,
                department_id: Number(data.leader_dept_id) || 0,
                pro_leader_logo: leaderImgSrc || '',
                pro_leader_logo_id: '',
                pro_co_leader: [
                    {
                        project_id: projectId,
                        user_id: Number(data.co_leader_user_id),
                        project_co_leader_id: '',
                        project_leader: 2,
                        department_id: Number(data.co_leader_dept_id) || 0,
                        mobile: data.co_leader_mobile || '',
                        pro_co_leader_logo: coLeaderImgSrc || '',
                        pro_co_leader_logo_id: ''
                    }
                ],
                company_user: data.company_user.map((cu: any) => ({
                    project_id: projectId,
                    project_leader: 0,
                    user_id: Number(cu.user_id),
                    project_company_user_id: '',
                    department_id: Number(cu.department_id) || 0,
                    mobile: cu.mobile || '',
                    company_user_logo: '',
                    company_user_logo_id: ''
                })),
                external_user: data.external_user || []
            }
        } else if (activeStep === 2) {
            projectDetails = 'projectKeyDates'
            stepPayload = {
                mile_stone: data.mile_stone.map((m: any) => ({
                    project_id: projectId,
                    project_milestone_id: '',
                    milestone_name: m.milestone_name,
                    mile_stone_date: m.mile_stone_date ? format(parse(m.mile_stone_date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : '',
                    description: m.description || '',
                    symbol: m.symbol || 'star'
                }))
            }
        } else if (activeStep === 3) {
            projectDetails = 'governanceProject'
            stepPayload = {
                govMeting: data.govMeting.map((g: any) => ({
                    project_id: projectId,
                    project_gov_id: '',
                    project_gov_memebers_id: '',
                    meeting_name: g.meeting_name,
                    chair_person: String(g.chair_person),
                    co_chair_person: String(g.co_chair_person),
                    gov_member: Array.isArray(g.gov_member) ? g.gov_member.join(',') : g.gov_member,
                    gov_frequency: g.gov_frequency,
                    meeting_day: g.meeting_day || '',
                    meeting_shedule: g.meeting_shedule || '',
                    gov_venue: g.gov_venue || '',
                    gov_duration: g.gov_duration,
                    agenda: g.agenda || ''
                }))
            }
        } else if (activeStep === 4) {
            projectDetails = 'budgetTrackProject'
            stepPayload = {
                total_pro_cost: String(data.total_pro_cost),
                currency: data.currency,
                allocation_dept: data.allocation_dept.map((ad: any) => ({
                    dept_id: Number(ad.dept_id),
                    project_budget_id: '',
                    allocation_dstrbt_vl: String(ad.allocation_dstrbt_vl),
                    project_id: projectId
                }))
            }
        }
        setLoading(true)
        dispatch(addProjectRequest({
            payload: {
                ...stepPayload,
                project_id: projectId,
                project_step_id: projectStepId,
                projectDetails: projectDetails
            },
            callback: (res: any) => {
                setLoading(false)
                if (res?.status_code === 200 || res?.status === 'success') {
                    if (activeStep === 0) {
                        setProjectId(res.data?.project_id || res.data)
                        // Save image_id from response so it's sent on re-submission
                        if (res.data?.image_id) {
                            setValue('image_id', res.data.image_id)
                        }
                    }
                    if (activeStep === 1 && Array.isArray(res.data)) {
                        setSelectedTeamMembers(res.data)
                    }
                    toast.success(res.message || 'Saved successfully')
                    if (activeStep < steps.length - 1) {
                        const nextStep = activeStep + 1
                        setActiveStep(nextStep)
                        setMaxStepReached(prev => Math.max(prev, nextStep))
                    } else {
                        // Finish
                        window.location.href = '/apps/project/projectTracker'
                    }
                } else {
                    setErrorMessage(res?.message || 'Error saving data')
                }
            }
        }))
    }

    if (fetchLoading) {
        return (
            <Card>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader
                title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <IconButton onClick={() => router.back()}>
                            <i className="ri-arrow-left-line" />
                        </IconButton>

                        <Typography variant="h6">
                            {isEditMode ? `Edit Project - ${steps[activeStep]}` : steps[activeStep]}
                        </Typography>
                    </Box>
                }
            />
            <Divider />
            <CardContent>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((label, index) => (
                        <Step key={label} completed={index < activeStep || (isEditMode && index <= maxStepReached && index !== activeStep)}>
                            <StepLabel
                                sx={{
                                    ...(isEditMode && index <= maxStepReached ? {
                                        cursor: 'pointer',
                                        '& .MuiStepLabel-label.Mui-disabled': { color: 'text.primary', opacity: 1 },
                                        '& .MuiStepIcon-root.Mui-disabled': { color: 'primary.main', opacity: 1 },
                                        '& .MuiStepIcon-text.Mui-disabled': { fill: 'white' }
                                    } : {})
                                }}
                                onClick={() => { if (isEditMode && index <= maxStepReached) setActiveStep(index) }}
                            >
                                {label}
                            </StepLabel>
                            <StepContent>
                                <form onSubmit={handleStepSubmit}>
                                    <Grid container spacing={5}>
                                        {activeStep === 0 && (
                                            <StepProjectDetails
                                                control={control}
                                                errors={errors}
                                                departments={departments}
                                                MenuProps={MenuProps}
                                                imgSrc={imgSrc}
                                                setImgSrc={setImgSrc}
                                                setSelectedFile={setSelectedFile}
                                                watchedStartDate={watchedStartDate}
                                                watchedEndDate={watchedEndDate}
                                                projectDuration={projectDuration}
                                                handleStartDateChange={handleStartDateChange}
                                                setValue={setValue}
                                            />
                                        )}

                                        {activeStep === 1 && (
                                            <StepProjectTeam
                                                control={control}
                                                errors={errors}
                                                departments={departments}
                                                MenuProps={MenuProps}
                                                leaderUsers={leaderUsers}
                                                coLeaderUsers={coLeaderUsers}
                                                getTeamMemberUsers={getTeamMemberUsers}
                                                handleUserChange={handleUserChange}
                                                leaderImgSrc={leaderImgSrc}
                                                coLeaderImgSrc={coLeaderImgSrc}
                                                leaderFileInputRef={leaderFileInputRef}
                                                coLeaderFileInputRef={coLeaderFileInputRef}
                                                handleLeaderFileChange={handleLeaderFileChange}
                                                handleCoLeaderFileChange={handleCoLeaderFileChange}
                                                companyUserFields={companyUserFields}
                                                appendCompanyUser={appendCompanyUser}
                                                removeCompanyUser={removeCompanyUser}
                                                externalUserFields={externalUserFields}
                                                appendExternalUser={appendExternalUser}
                                                removeExternalUser={removeExternalUser}
                                            />
                                        )}

                                        {activeStep === 2 && (
                                            <StepMilestones
                                                control={control}
                                                MenuProps={MenuProps}
                                                milestoneFields={milestoneFields}
                                                appendMilestone={appendMilestone}
                                                removeMilestone={removeMilestone}
                                                watchedStartDate={watchedStartDate}
                                                watchedEndDate={watchedEndDate}
                                            />
                                        )}

                                        {activeStep === 3 && (
                                            <StepGovernance
                                                control={control}
                                                watch={watch}
                                                MenuProps={MenuProps}
                                                selectedTeamMembers={selectedTeamMembers}
                                                govFields={govFields}
                                                appendGov={appendGov}
                                                removeGov={removeGov}
                                            />
                                        )}

                                        {activeStep === 4 && (
                                            <StepBudget
                                                control={control}
                                                watch={watch}
                                                MenuProps={MenuProps}
                                                departments={departments}
                                                budgetFields={budgetFields}
                                                appendBudget={appendBudget}
                                                removeBudget={removeBudget}
                                                watchedTotalCost={watchedTotalCost}
                                                totalAllocated={totalAllocated}
                                                remainingBudget={remainingBudget}
                                            />
                                        )}

                                        {errorMessage && (
                                            <Grid size={{ xs: 12 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'error.main',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {errorMessage}
                                                </Typography>
                                            </Grid>
                                        )}

                                        <Grid size={{ xs: 12 }} sx={{ mt: 4, display: 'flex', gap: 2 }}>
                                            <Button variant='contained' type='submit' disabled={loading} sx={{ minWidth: 140 }}>
                                                {loading ? <CircularProgress size={20} color='inherit' /> : (activeStep === steps.length - 1 ? 'Finish' : 'Save & Next')}
                                            </Button>
                                            <Button variant='outlined' color='secondary' disabled={activeStep === 0 || loading} onClick={() => setActiveStep(prev => prev - 1)}>Back</Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </CardContent>
        </Card>
    )
}

export default NewProject
