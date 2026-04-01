// redux-store/rootSaga.ts
import { all } from 'redux-saga/effects'
import { authSaga } from './slices/auth/auth.saga'
import { userSaga } from './slices/user/user.saga'
import { masterSaga } from './slices/master/master.saga'
import { kpiTrackerSaga } from './slices/kpiTracker/kpiTracker.saga'
import { strategicObjectivesSaga } from './slices/strategicObjectives/strategicObjectives.saga'
import { initiativesSaga } from './slices/initiatives/initiatives.saga'
import { actionPlansSaga } from './slices/actionplans/actionplans.saga'
import { taskTrackersSaga } from './slices/taskTracker/taskTracker.saga'
import { projectSaga } from './slices/project/project.saga'

export default function* rootSaga() {
    yield all([
        authSaga(),
        userSaga(),
        masterSaga(),
        kpiTrackerSaga(),
        strategicObjectivesSaga(),
        initiativesSaga(),
        actionPlansSaga(),
        taskTrackersSaga(),
        projectSaga()
    ])
}
