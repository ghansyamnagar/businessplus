'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { toast } from 'react-toastify'

// Redux Imports
import { useDispatch } from 'react-redux'
import { changePasswordRequest } from '@/redux-store/slices/auth/auth.slice'

const ChangePasswordCard = () => {
  // Hooks
  const dispatch = useDispatch()

  // States
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleClickShowCurrentPassword = () => {
    setIsCurrentPasswordShown(!isCurrentPasswordShown)
  }

  const handleReset = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required')
      return
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }

    setLoading(true)

    dispatch(
      changePasswordRequest({
        payload: {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        },
        callback: (response: any, error: any) => {
          setLoading(false)

          if (response && !error) {
            toast.success(response?.message || 'Password changed successfully')
            handleReset()
          } else {
            toast.error(error?.message || 'Failed to change password')
          }
        }
      })
    )
  }

  return (
    <Card>
      <CardHeader title='Change Password' className='pbe-6' />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 24, sm: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Current Password'
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                type={isCurrentPasswordShown ? 'text' : 'password'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowCurrentPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isCurrentPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 24, sm: 12, md: 4 }}>
              <TextField
                fullWidth
                label='New Password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                type={isNewPasswordShown ? 'text' : 'password'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => setIsNewPasswordShown(!isNewPasswordShown)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isNewPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 24, sm: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Confirm New Password'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                type={isConfirmPasswordShown ? 'text' : 'password'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
          </Grid>
          <Grid size={{ xs: 12 }} className='flex flex-col gap-4 pbs-6'>
            <Typography variant='h6' color='text.secondary'>
              Password Requirements:
            </Typography>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2.5'>
                <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                Minimum 6 characters long - the more, the better
              </div>
              {/* <div className='flex items-center gap-2.5'>
                <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                At least one lowercase & one uppercase character
              </div>
              <div className='flex items-center gap-2.5'>
                <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                At least one number, symbol, or whitespace character
              </div> */}
            </div>
          </Grid>
          <Grid size={{ xs: 12 }} className='flex gap-4 pbs-6'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={22} color='inherit' /> : 'Save Changes'}
            </Button>
            <Button variant='outlined' type='button' color='secondary' onClick={handleReset}>
              Reset
            </Button>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
