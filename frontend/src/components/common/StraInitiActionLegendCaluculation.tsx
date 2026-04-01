
'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const StraInitiActionLegendCaluculation = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Box
                sx={{
                    // border: '1px solid',
                    borderRadius: '4px',
                    borderColor: 'divider',
                    p: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    justifyContent: 'flex-start',
                    width: 'fit-content'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        bgcolor: '#4caf50'
                    }} />
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>- 100%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderBottom: '18px solid #ffd900' }} />
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>- 90-100%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 18, height: 18, border: '2px solid #f44336', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f44336' }}>
                        <i className='ri-close-line' style={{ fontSize: '16px', fontWeight: 'bold' }} />
                    </Box>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>90%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 18,
                        height: 18,
                        borderRadius: '4px',
                        bgcolor: '#9fa6ad'
                    }} />
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>- On track</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 18, height: 18, paddingTop: "2px", borderRadius: '4px', bgcolor: '#4b89dc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>H</Box>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>- Hold</Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default StraInitiActionLegendCaluculation
