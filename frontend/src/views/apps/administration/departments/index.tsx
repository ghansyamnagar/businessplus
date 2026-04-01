// Component Imports
import DepartmentListTable from './DepartmentListTable'

// Server Action Imports
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

const DepartmentList = async () => {
    // Vars
    const session = await getServerSession(authOptions)

    return <DepartmentListTable />
}

export default DepartmentList
