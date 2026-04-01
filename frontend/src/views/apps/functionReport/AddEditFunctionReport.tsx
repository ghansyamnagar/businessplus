
'use client'

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, nonEmpty, pipe, optional } from 'valibot'
import type { InferInput } from 'valibot'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import { addFunctionReportRequest, editFunctionReportRequest } from '@/redux-store/slices/strategicObjectives/strategicObjectives.slice'
import { getDepartmentListRequest } from '@/redux-store/slices/user/user.slice'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Box } from '@mui/material'
import { getCompanyDetailsFromLocal } from '@/redux-store/sagaHelpers'

const schema = object({
    year: pipe(string(), nonEmpty('Year is required')),
    quarterly: pipe(string(), nonEmpty('Month is required')),
    dept_id: pipe(string(), nonEmpty('Department is required')),
    highlight: pipe(string(), nonEmpty('Highlights is required')),
    majorgaps: optional(string()),
    challenges: optional(string()),
    priorities: optional(string()),
    remark: optional(string()),
})

type FormDataValues = InferInput<typeof schema>

interface AddEditFunctionReportProps {
    open: boolean
    handleClose: (refresh: boolean) => void
    dataEdit?: any
    filterUnit: string
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const AddEditFunctionReport = ({ open, handleClose, dataEdit, filterUnit }: AddEditFunctionReportProps) => {
    const dispatch = useDispatch()
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState<any[]>([])
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [showCompanyYearList, setShowCompanyYearList] = useState<any[]>([])

    const {
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<FormDataValues>({
        resolver: valibotResolver(schema),
        defaultValues: {
            year: String(new Date().getFullYear()),
            quarterly: '',
            dept_id: '',
            highlight: '',
            majorgaps: '',
            challenges: '',
            priorities: '',
            remark: '',
        }
    })

    useEffect(() => {
        const allDetailsCompany = getCompanyDetailsFromLocal()
        if (allDetailsCompany) {
            try {
                const companyFinancialYear = allDetailsCompany?.general_data?.[0]?.financial_year
                const companyCreateData = allDetailsCompany?.general_data?.[0]?.company_created_date

                const currentYear = new Date().getFullYear()
                let companyDataCreateYear = companyCreateData ? new Date(companyCreateData).getFullYear() : currentYear

                const yearList: any[] = []
                // Loop from company creation year to currentYear + 14 as per angular logic
                for (let a = companyDataCreateYear; a <= currentYear + 10; a++) {
                    if (companyFinancialYear === "april-march") {
                        yearList.push({ "year_key": a, "year_value": `${a}-${(a + 1).toString().substr(2, 2)}` })
                    } else {
                        yearList.push({ "year_key": a, "year_value": String(a) })
                    }
                }
                setShowCompanyYearList(yearList)
            } catch (error) {
                console.error("Error processing company details", error)
            }
        }
    }, [])

    useEffect(() => {
        if (open && filterUnit) {
            dispatch(getDepartmentListRequest({
                payload: { unit_id: filterUnit },
                callback: (res) => {
                    if (res?.status === 'success') {
                        setDepartments(res.data)
                    }
                }
            }))
        }
    }, [open, filterUnit, dispatch])

    useEffect(() => {
        if (open && dataEdit) {
            reset({
                year: String(dataEdit.year),
                quarterly: dataEdit.quarterly,
                dept_id: String(dataEdit.dept_id),
                highlight: dataEdit.highlight || '',
                majorgaps: dataEdit.majorgaps || '',
                challenges: dataEdit.challenges || '',
                priorities: dataEdit.priorities || '',
                remark: dataEdit.remark || '',
            })
        } else if (open && !dataEdit) {
            reset({
                year: String(new Date().getFullYear()),
                quarterly: '',
                dept_id: '',
                highlight: '',
                majorgaps: '',
                challenges: '',
                priorities: '',
                remark: '',
            })
            setSelectedFiles([])
        }
    }, [open, dataEdit, reset])

    const handleDialogClose = (refresh: boolean) => {
        handleClose(refresh)
        reset()
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files))
        }
    }

    const onSubmit = (data: FormDataValues) => {
        setLoading(true)
        const unit_id = (session?.user as any)?.unit_selected?.id
        const login_access_token = (session?.user as any)?.accessToken

        const formData = new FormData()
        formData.append('login_access_token', login_access_token)
        formData.append('unit_id', String(unit_id))
        formData.append('year', data.year)
        formData.append('quarterly', data.quarterly)
        formData.append('dept_id', data.dept_id)
        formData.append('highlight', data.highlight)
        formData.append('majorgaps', data.majorgaps || '')
        formData.append('challenges', data.challenges || '')
        formData.append('priorities', data.priorities || '')
        formData.append('remark', data.remark || '')

        if (selectedFiles.length > 0) {
            selectedFiles.forEach((file) => {
                formData.append('photo[]', file)
            })
        }

        if (dataEdit) {
            formData.append('quartupdatmanufacturs_id', String(dataEdit.quartupdatmanufacturs_id))
            dispatch(editFunctionReportRequest({
                payload: formData,
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Updated successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error updating')
                    }
                    setLoading(false)
                }
            }))
        } else {
            dispatch(addFunctionReportRequest({
                payload: formData,
                callback: (response: any) => {
                    if (response?.status === 'success') {
                        toast.success(response.message || 'Added successfully')
                        handleDialogClose(true)
                    } else {
                        toast.error(response?.message || 'Error adding')
                    }
                    setLoading(false)
                }
            }))
        }
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={() => handleDialogClose(false)}
            maxWidth='md'
            scroll='body'
        >
            <DialogTitle variant='h5' className='flex gap-2 flex-col items-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
                <div className='max-sm:is-[80%] max-sm:text-center'>{dataEdit ? 'Edit' : 'Add'} Monthly Report</div>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-8'>
                    <IconButton onClick={() => handleDialogClose(false)} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='year'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        select
                                        {...field}
                                        label='Year'
                                        fullWidth
                                        error={!!errors.year}
                                        helperText={errors.year?.message}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    className: 'max-h-[300px]'
                                                },
                                            }
                                        }}
                                    >
                                        {showCompanyYearList.length > 0 ? (
                                            showCompanyYearList.map(item => (
                                                <MenuItem key={item.year_key} value={String(item.year_key)}>
                                                    {item.year_value}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value={field.value}>{field.value}</MenuItem>
                                        )}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='quarterly'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} label='Month' fullWidth error={!!errors.quarterly} helperText={errors.quarterly?.message}>
                                        {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name='dept_id'
                                control={control}
                                render={({ field }) => (
                                    <TextField select {...field} label='Department' fullWidth error={!!errors.dept_id} helperText={errors.dept_id?.message}>
                                        {departments.map(d => <MenuItem key={d.dept_id} value={String(d.dept_id)}>{d.dept_name}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Highlights</Typography>
                            <Controller
                                name='highlight'
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={!!errors.highlight}
                                    />
                                )}
                            />
                            {errors.highlight && <Typography color="error" variant="caption">{errors.highlight.message}</Typography>}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Major Gaps</Typography>
                            <Controller
                                name='majorgaps'
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Challenges</Typography>
                            <Controller
                                name='challenges'
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Priorities</Typography>
                            <Controller
                                name='priorities'
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='remark'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label='Remarks'
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="photo-upload"
                                multiple
                                type="file"
                                onChange={onFileChange}
                            />
                            <label htmlFor="photo-upload">
                                <Button variant="outlined" component="span" startIcon={<i className='ri-upload-2-line' />}>
                                    Upload Photos
                                </Button>
                            </label>
                            {selectedFiles.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" display="block">
                                        Selected: {selectedFiles.map(f => f.name).join(', ')}
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
                    <Button variant='contained' type='submit' disabled={loading} className='min-is-[120px]'>
                        {loading ? <CircularProgress size={22} color='inherit' /> : dataEdit ? 'Update' : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={() => handleDialogClose(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddEditFunctionReport
