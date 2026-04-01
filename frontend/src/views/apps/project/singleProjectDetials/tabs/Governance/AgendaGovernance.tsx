'use client'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'

interface AgendaGovernanceProps {
    open: boolean
    handleClose: () => void
    data: any
}

const AgendaGovernance = ({ open, handleClose, data }: AgendaGovernanceProps) => {
    const dummyPicture = "/images/avatars/1.png"

    const getDurationLabel = (duration: string) => {
        switch (duration) {
            case 'half_hour': return '30 Minute'
            case 'one_hour': return '1 Hour'
            case 'two_hour': return '2 Hour'
            case 'half_day': return 'Half day'
            case 'full_Day': return 'Full day'
            default: return duration
        }
    }

    const Tile = ({ title, children, sx = {}, headerSx = {}, contentSx = {} }: { title: string, children: React.ReactNode, sx?: any, headerSx?: any, contentSx?: any }) => (
        <Box sx={{
            border: '1px solid var(--mui-palette-divider)',
            display: 'flex',
            flexDirection: 'column',
            ...sx
        }}>
            <Box sx={{
                bgcolor: 'action.hover',
                p: 1.5,
                textAlign: 'center',
                fontWeight: 600,
                borderBottom: '1px solid var(--mui-palette-divider)',
                fontSize: '0.8125rem',
                color: 'text.secondary',
                ...headerSx
            }}>
                {title}
            </Box>
            <Box sx={{
                p: 2,
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                minHeight: 45,
                ...contentSx
            }}>
                {children}
            </Box>
        </Box>
    )

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>
            <DialogTitle component='div' sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='h6'>Governance Structure</Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 4, pt: 0 }}>
                <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' sx={{ top: 8, right: 8 }}>
                    <i className='ri-close-line text-textSecondary' />
                </IconButton>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(200px, 1.2fr) 2fr 1.5fr',
                    gap: 0,
                    border: '1px solid var(--mui-palette-divider)',
                    minWidth: 800,
                    '& > *': { m: '-0.5px' } // Overlap borders for single border effect
                }}>
                    {/* Column 1: Metadata Tiles */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Tile title="Chair Person">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', px: 2 }}>
                                <Typography sx={{ flexGrow: 1, textAlign: 'center', fontSize: 'inherit' }}>{data?.chair_person_name}</Typography>
                                <Avatar src={data?.chair_person_img || dummyPicture} sx={{ width: 28, height: 28 }} />
                            </Box>
                        </Tile>
                        <Tile title="Co Chair Person">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', px: 2 }}>
                                <Typography sx={{ flexGrow: 1, textAlign: 'center', fontSize: 'inherit' }}>{data?.co_chair_person_name}</Typography>
                                <Avatar src={data?.co_chair_person_img || dummyPicture} sx={{ width: 28, height: 28 }} />
                            </Box>
                        </Tile>
                        <Tile title="Meeting Frequency">
                            <Typography sx={{ fontSize: 'inherit' }}>{data?.gov_frequency}</Typography>
                        </Tile>
                        <Tile title="Meeting Shedule">
                            <Typography sx={{ fontSize: 'inherit' }}>{data?.meeting_shedule || '-'} {data?.meeting_shedule ? 'Week' : ''}</Typography>
                        </Tile>
                        <Tile title="Meeting days">
                            <Typography sx={{ fontSize: 'inherit' }}>{data?.meeting_day ? `Every ${data?.meeting_day}` : '-'}</Typography>
                        </Tile>
                        <Tile title="Meeting Duration">
                            <Typography sx={{ fontSize: 'inherit' }}>{getDurationLabel(data?.gov_duration)}</Typography>
                        </Tile>
                        <Tile title="Venue">
                            <Typography sx={{ fontSize: 'inherit' }}>{data?.gov_venue}</Typography>
                        </Tile>
                    </Box>

                    {/* Column 2: Meeting Name and Agenda */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Tile title="Meeting Name" sx={{ borderLeft: 0, borderRight: 0 }}>
                            <Typography sx={{ fontSize: 'inherit', textAlign: 'center' }}>{data?.meeting_name}</Typography>
                        </Tile>
                        <Tile
                            title="Agenda"
                            headerSx={{ width: '100%', textAlign: 'center', px: 2, borderBottom: 0, }}
                            contentSx={{ alignItems: 'flex-start', justifyContent: 'flex-start', p: 2 }}
                            sx={{ border: 0, flexGrow: 1 }}
                        >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', width: '100%', mt: 1 }}>
                                {data?.agenda || 'No agenda available.'}
                            </Typography>
                        </Tile>
                    </Box>

                    {/* Column 3: Members */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Tile
                            title="Members"
                            contentSx={{ display: 'flex', flexDirection: 'column', p: 0, alignItems: 'flex-start', justifyContent: 'flex-start' }}
                            sx={{ borderBottom: 0, flexGrow: 1 }}
                        >
                            <Box sx={{ width: '100%' }}>
                                {data?.gov_members?.map((member: any, index: number) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, py: 1, borderBottom: '1px solid var(--mui-palette-divider)' }}>
                                        <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '0.8125rem' }}>{index + 1}. {member.member_name}</Typography>
                                        <Avatar src={member.member_img || dummyPicture} sx={{ width: 24, height: 24 }} />
                                    </Box>
                                ))}
                                {(!data?.gov_members || data?.gov_members.length === 0) && (
                                    <Typography variant="body2" sx={{ p: 2, textAlign: 'center', fontStyle: 'italic', color: 'text.disabled' }}>No members</Typography>
                                )}
                            </Box>
                        </Tile>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    <Button variant='outlined' color='secondary' onClick={handleClose} sx={{ minWidth: 100 }}>
                        Close
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default AgendaGovernance
