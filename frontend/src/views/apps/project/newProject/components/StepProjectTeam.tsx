import { useRef, type ChangeEvent } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'

import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'

interface StepProjectTeamProps {
    control: any
    errors: any
    departments: any[]
    MenuProps: any
    leaderUsers: any[]
    coLeaderUsers: any[]
    getTeamMemberUsers: (index: number) => any[]
    handleUserChange: (userId: any, type: string, index?: number) => void
    leaderImgSrc: string
    coLeaderImgSrc: string
    leaderFileInputRef: React.RefObject<HTMLInputElement | null>
    coLeaderFileInputRef: React.RefObject<HTMLInputElement | null>
    handleLeaderFileChange: (e: ChangeEvent<HTMLInputElement>) => void
    handleCoLeaderFileChange: (e: ChangeEvent<HTMLInputElement>) => void
    companyUserFields: any[]
    appendCompanyUser: (value: any) => void
    removeCompanyUser: (index: number) => void
    externalUserFields: any[]
    appendExternalUser: (value: any) => void
    removeExternalUser: (index: number) => void
}

const StepProjectTeam = ({
    control,
    errors,
    departments,
    MenuProps,
    leaderUsers,
    coLeaderUsers,
    getTeamMemberUsers,
    handleUserChange,
    leaderImgSrc,
    coLeaderImgSrc,
    leaderFileInputRef,
    coLeaderFileInputRef,
    handleLeaderFileChange,
    handleCoLeaderFileChange,
    companyUserFields,
    appendCompanyUser,
    removeCompanyUser,
    externalUserFields,
    appendExternalUser,
    removeExternalUser
}: StepProjectTeamProps) => {
    return (
        <>
            <Grid size={{ xs: 12 }}><Typography variant='h6' sx={{ mb: 2 }}>Project Leader</Typography></Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller name='user_id' control={control} rules={{ required: 'Leader is required' }} render={({ field, fieldState }) => (
                            <TextField select {...field} label='Leader Name' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }} onChange={(e) => { field.onChange(e); handleUserChange(e.target.value, 'leader') }}>
                                {leaderUsers.map(u => <MenuItem key={u.user_id} value={String(u.user_id)} disabled={u.disabled}>{u.name}</MenuItem>)}
                            </TextField>
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller name='leader_dept_id' control={control} render={({ field }) => {
                            let deptName = field.value || ''
                            if (String(field.value) === '0') deptName = 'Senior Executive'
                            else if (field.value) {
                                const dept = departments.find(d => String(d.dept_id) === String(field.value))
                                if (dept) deptName = dept.dept_name
                            }
                            return <TextField {...field} value={deptName} label='Department' fullWidth disabled />
                        }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller name='email' control={control} render={({ field }) => <TextField {...field} label='Email' fullWidth disabled />} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller name='mobile' control={control} render={({ field }) => <TextField {...field} label='Mobile' fullWidth disabled />} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant='body2' sx={{ mb: 2 }}>Photo</Typography>
                <Box sx={{ position: 'relative' }}>
                    <Avatar src={leaderImgSrc} sx={{ width: 100, height: 100, border: '2px solid #e0e0e0' }} />
                    {/* <IconButton
                        type='button'
                        size='small'
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            border: '2px solid white',
                            '&:hover': { backgroundColor: 'primary.dark' }
                        }}
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            leaderFileInputRef.current?.click()
                        }}
                    >
                        <i className='ri-camera-line text-sm' />
                    </IconButton> */}
                </Box>
                {/* <input
                    type='file'
                    ref={leaderFileInputRef}
                    onChange={handleLeaderFileChange}
                    accept='image/png, image/jpeg'
                    style={{ display: 'none' }}
                /> */}
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />
            <Grid size={{ xs: 12 }}><Typography variant='h6' sx={{ mb: 2 }}>Project Co-Leader</Typography></Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller name='co_leader_user_id' control={control} rules={{ required: 'Co-Leader is required' }} render={({ field, fieldState }) => (
                            <TextField select {...field} label='Co-Leader Name' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }} onChange={(e) => { field.onChange(e); handleUserChange(e.target.value, 'co_leader') }}>
                                {coLeaderUsers.map(u => <MenuItem key={u.user_id} value={String(u.user_id)} disabled={u.disabled}>{u.name}</MenuItem>)}
                            </TextField>
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller name='co_leader_dept_id' control={control} render={({ field }) => {
                            let deptName = field.value || ''
                            if (String(field.value) === '0') deptName = 'Senior Executive'
                            else if (field.value) {
                                const dept = departments.find(d => String(d.dept_id) === String(field.value))
                                if (dept) deptName = dept.dept_name
                            }
                            return <TextField {...field} value={deptName} label='Department' fullWidth disabled />
                        }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller name='co_leader_email' control={control} render={({ field }) => (
                            <TextField {...field} label='Email' fullWidth disabled />
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller name='co_leader_mobile' control={control} render={({ field }) => (
                            <TextField {...field} label='Mobile' fullWidth disabled />
                        )} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant='body2' sx={{ mb: 2 }}>Photo</Typography>
                <Box sx={{ position: 'relative' }}>
                    <Avatar src={coLeaderImgSrc} sx={{ width: 100, height: 100, border: '2px solid #e0e0e0' }} />
                    {/* <IconButton
                        type='button'
                        size='small'
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            border: '2px solid white',
                            '&:hover': { backgroundColor: 'primary.dark' }
                        }}
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            coLeaderFileInputRef.current?.click()
                        }}
                    >
                        <i className='ri-camera-line text-sm' />
                    </IconButton> */}
                </Box>
                {/* <input
                    type='file'
                    ref={coLeaderFileInputRef}
                    onChange={handleCoLeaderFileChange}
                    accept='image/png, image/jpeg'
                    style={{ display: 'none' }}
                /> */}
            </Grid>

            <Divider sx={{ width: '100%', my: 4 }} />
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6'>Team Members</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant='outlined' size='small' onClick={() => appendExternalUser({ ex_membar_name: '', company_name: '', email_id: '', phone_number: '' })}>Add External User</Button>
                </Box>
            </Box>

            <Typography variant='subtitle1' sx={{ mb: 0, fontWeight: 500, color: 'text.secondary' }}>Company Users</Typography>

            {companyUserFields.map((field, index) => (
                <Grid container spacing={3} key={field.id} sx={{ mb: 2, width: '100%' }}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Controller name={`company_user.${index}.user_id` as any} control={control} rules={{ required: index === 0 ? 'At least one member is required' : false }} render={({ field, fieldState }) => (
                            <TextField select {...field} label='Name' fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} SelectProps={{ MenuProps }} onChange={(e) => { field.onChange(e); handleUserChange(e.target.value, 'member', index) }}>
                                {getTeamMemberUsers(index).map(u => <MenuItem key={u.user_id} value={String(u.user_id)} disabled={u.disabled}>{u.name}</MenuItem>)}
                            </TextField>
                        )} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <Controller name={`company_user.${index}.department_id` as any} control={control} render={({ field }) => {
                            let deptName = field.value || ''
                            if (String(field.value) === '0') deptName = 'Senior Executive'
                            else if (field.value) {
                                const dept = departments.find(d => String(d.dept_id) === String(field.value))
                                if (dept) deptName = dept.dept_name
                            }
                            return <TextField {...field} value={deptName} label='Department' fullWidth disabled />
                        }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}><Controller name={`company_user.${index}.email` as any} control={control} render={({ field }) => <TextField {...field} label='Email' fullWidth disabled />} /></Grid>
                    <Grid size={{ xs: 12, sm: 2 }}><Controller name={`company_user.${index}.mobile` as any} control={control} render={({ field }) => <TextField {...field} label='Mobile' fullWidth disabled />} /></Grid>
                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {index === 0 && (
                            <Tooltip title="Add Company User">
                                <IconButton color='primary' onClick={() => appendCompanyUser({ user_id: '', department_id: '', email: '', mobile: '' })}>
                                    <i className='ri-add-circle-line' />
                                </IconButton>
                            </Tooltip>
                        )}
                        {index > 0 && (
                            <Tooltip title="Remove Company User">
                                <IconButton color='error' onClick={() => removeCompanyUser(index)}>
                                    <i className='ri-delete-bin-7-line' />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Grid>
                </Grid>
            ))}

            {externalUserFields.length > 0 && (
                <Typography variant='subtitle1' sx={{ mt: 4, mb: 0, fontWeight: 500, color: 'text.secondary' }}>External Users</Typography>
            )}

            {externalUserFields.map((field, index) => (
                <Grid container spacing={3} key={field.id} sx={{ mb: 2, width: '100%' }}>
                    <Grid size={{ xs: 12, sm: 3 }}><Controller name={`external_user.${index}.ex_membar_name` as any} control={control} render={({ field }) => <TextField {...field} label='Ext. Name' fullWidth />} /></Grid>
                    <Grid size={{ xs: 12, sm: 3 }}><Controller name={`external_user.${index}.company_name` as any} control={control} render={({ field }) => <TextField {...field} label='Ext. Company' fullWidth />} /></Grid>
                    <Grid size={{ xs: 12, sm: 3 }}><Controller name={`external_user.${index}.email_id` as any} control={control} render={({ field }) => <TextField {...field} label='Ext. Email' fullWidth />} /></Grid>
                    <Grid size={{ xs: 12, sm: 2 }}><Controller name={`external_user.${index}.phone_number` as any} control={control} render={({ field }) => <TextField {...field} label='Ext. Mobile' fullWidth />} /></Grid>
                    <Grid size={{ xs: 12, sm: 1 }}><IconButton color='error' onClick={() => removeExternalUser(index)}><i className='ri-delete-bin-7-line' /></IconButton></Grid>
                </Grid>
            ))}
        </>
    )
}

export default StepProjectTeam
