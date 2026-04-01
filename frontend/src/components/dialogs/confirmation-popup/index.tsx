'use client'

// React Imports
import 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

type ConfirmationPopupProps = {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  subTitle?: string
  onConfirm: () => void
}

const ConfirmationPopup = ({ open, setOpen, title, subTitle, onConfirm }: ConfirmationPopupProps) => {
  const handleConfirmation = (value: boolean) => {
    setOpen(false)
    if (value && onConfirm) {
      onConfirm()
    }
  }

  return (
    <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)} closeAfterTransition={false}>
      <DialogContent className='flex items-center flex-col text-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
        <i className='ri-error-warning-line text-[88px] mbe-6 text-warning' />
        <div className='flex flex-col items-center gap-2'>
          <Typography variant='h4'>
            {title}
          </Typography>
          {subTitle && (
            <Typography color='text.primary'>{subTitle}</Typography>
          )}
        </div>
      </DialogContent>
      <DialogActions className='justify-between pbs-0 sm:pbe-8 sm:pli-8'>
        <Button variant='contained' onClick={() => handleConfirmation(true)}>
          Yes
        </Button>
        <Button
          variant='outlined'
          color='secondary'
          onClick={() => {
            handleConfirmation(false)
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationPopup
