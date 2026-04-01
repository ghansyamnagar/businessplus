
import Grid from '@mui/material/Grid2'
import UnitListTable from './UnitListTable'
const UnitList = () => {

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UnitListTable />
      </Grid>
    </Grid>
  )
}

export default UnitList
