import os
import re

files = [
    "project/projectRemark/ProjectRemarkListTable.tsx",
    "project/projectTracker/ProjectTrackerListTable.tsx",
    "initiatives/initiatives/initiativesListTable.tsx",
    "actionPlans/actionPlans/actionPlansListTable.tsx",
    "actionPlans/singleActionPlanDetials/SingleActionPlanDetials.tsx",
    "administration/presentation/PresentationListTable.tsx",
    "administration/units/UnitListTable.tsx",
    "administration/priorities/PriorityListTable.tsx",
    "administration/productAndServices/softwareDevelopment/SoftwareDevelopmentListTable.tsx",
    "administration/productAndServices/bigDataServices/BigDataServicesListTable.tsx",
    "swot/index.tsx",
    "administration/visionMission/index.tsx",
    "administration/productAndServices/productDevelopment/ProductDevelopmentListTable.tsx",
    "administration/permissions/PermissionListTable.tsx",
    "administration/companyFaq/CompanyFaqListTable.tsx",
    "administration/departments/DepartmentListTable.tsx",
    "administration/unitOfMeasure/UomListTable.tsx",
    "administration/photograph/celebration/CelebrationListTable.tsx",
    "administration/facilityDetails/layout/LayoutListTable.tsx",
    "administration/facilityDetails/machineAndEquipment/MachineAndEquipmentListTable.tsx",
    "administration/photograph/events/EventsListTable.tsx",
    "administration/photograph/media/MediaListTable.tsx",
    "administration/facilityDetails/infrastructure/InfrastructureListTable.tsx",
    "administration/facilityDetails/location/LocationListTable.tsx",
    "administration/governance/GovernanceListTable.tsx",
    "administration/sections/SectionListTable.tsx",
    "administration/procedureAndTemplates/procedureOperations/ProcedureOperationsListTable.tsx",
    "administration/procedureAndTemplates/procedureRnD/ProcedureRnDListTable.tsx",
    "administration/procedureAndTemplates/procedureHr/ProcedureHrListTable.tsx",
    "taskTracker/taskRemark/TaskRemarkListTable.tsx",
    "taskTracker/eventsTask/EventsTaskListTable.tsx",
    "taskTracker/task/TaskListTable.tsx",
    "kpiTracker/keyperformance/KpiTrackerListTable.tsx",
    "kpiTracker/kpidata/kpidataListTable.tsx",
    "strategicObjective/strategicObjective/strategicObjectiveListTable.tsx"
]

base_path = "/home/digi-4/project/businessplus-python-nextjs/businessplus-python-nextjs/frontend/src/views/apps"

for file_rel in files:
    file_path = os.path.join(base_path, file_rel)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # 1. Replace import
    new_content = content.replace("import { getModulePermissionFromLocal } from '@/redux-store/sagaHelpers'", "import { useModulePermission } from '@/hooks/useModulePermission'")
    
    # 2. Replace usage: const xPermission = useMemo(() => getModulePermissionFromLocal('...'), [])
    # Or: const xPermission = getModulePermissionFromLocal('...')
    
    # Pattern 1: useMemo
    new_content = re.sub(r'const (\w+)Permission = useMemo\(\(\) => getModulePermissionFromLocal\(([\'"][^\'"]+[\'"])\), \[\]\)', r'const \1Permission = useModulePermission(\2)', new_content)
    
    # Pattern 2: direct call (not inside useMemo)
    new_content = re.sub(r'const (\w+)Permission = getModulePermissionFromLocal\(([\'"][^\'"]+[\'"])\)', r'const \1Permission = useModulePermission(\2)', new_content)

    # Some files use different variable names, let's be more generic
    new_content = re.sub(r'const (\w+) = useMemo\(\(\) => getModulePermissionFromLocal\(([\'"][^\'"]+[\'"])\), \[\]\)', r'const \1 = useModulePermission(\2)', new_content)
    new_content = re.sub(r'const (\w+) = getModulePermissionFromLocal\(([\'"][^\'"]+[\'"])\)', r'const \1 = useModulePermission(\2)', new_content)

    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Updated: {file_rel}")
    else:
        # Check if already updated but maybe regex missed something
        if "getModulePermissionFromLocal" in content and "getModulePermissionFromLocal" not in new_content:
             with open(file_path, 'w') as f:
                f.write(new_content)
             print(f"Updated (fallback): {file_rel}")
        else:
            print(f"No changes for: {file_rel}")
