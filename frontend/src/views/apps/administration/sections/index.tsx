
import Grid from '@mui/material/Grid2'
import SectionListTable from './SectionListTable'
const SectionList = () => {

    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <SectionListTable />
            </Grid>
        </Grid>
    )
}

export default SectionList
