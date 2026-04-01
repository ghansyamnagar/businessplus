// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href={`/${locale}/apps/home`} icon={<i className='ri-home-smile-line' />}>
          Home
        </MenuItem>
        <SubMenu
          label={dictionary['navigation'].dashboards}
          icon={<i className='ri-dashboard-line' />}
        // suffix={<Chip label='5' size='small' color='error' />}
        >
          <MenuItem href={`/${locale}/apps/dashboard`}>{dictionary['navigation'].dashboard}</MenuItem>
          <MenuItem href={`/${locale}/apps/managementDashboard`}>Management Dashboard</MenuItem>
          <MenuItem href={`/${locale}/apps/functionReport`}>Function Report</MenuItem>


        </SubMenu>

        {/* add new manu */}

        <SubMenu label="Current Business Plan" icon={<i className='ri-file-list-3-line' suppressHydrationWarning />}>
          <MenuItem href={`/${locale}/apps/masterActionPlans`}>Master Plan</MenuItem>
        </SubMenu>
        <SubMenu label="Set New Business Plans" icon={<i className='ri-building-2-line' />}>
          <MenuItem href={`/${locale}/apps/swot`}>SWOT</MenuItem>
          <MenuItem href={`/${locale}/apps/strategicObjective/strategicObjective`}>Get Started</MenuItem>
          <MenuItem href={`/${locale}/apps/initiatives/initiatives`}>Initiatives</MenuItem>
          <MenuItem href={`/${locale}/apps/actionPlans/actionPlans`}>Action Plans</MenuItem>
        </SubMenu>

        <SubMenu label="KPI Tracker" icon={<i className='ri-sun-line' />}>
          <MenuItem href={`/${locale}/apps/kpiTracker/dashboard`}>Dashboard</MenuItem>
          <MenuItem href={`/${locale}/apps/kpiTracker/keyperformance`}>Key Performance Indicator</MenuItem>
          <MenuItem href={`/${locale}/apps/kpiTracker/kpidata`}>KPI Data</MenuItem>
        </SubMenu>
        <SubMenu label="Prima Project" icon={<i className='ri-repeat-2-line' />}>
          <MenuItem href={`/${locale}/apps/project/projectDashboard`}>Project Dashboard</MenuItem>
          <MenuItem href={`/${locale}/apps/project/projectTracker`}>Project Tracker</MenuItem>
          <MenuItem href={`/${locale}/apps/project/newProject`}>New Project</MenuItem>
        </SubMenu>

        <SubMenu label="Task Tracker" icon={<i className='ri-file-line' />}>
          <MenuItem href={`/${locale}/apps/taskTracker/eventsTask`}>Events</MenuItem>
          <MenuItem href={`/${locale}/apps/taskTracker/dashboard`}>Dashboard Task</MenuItem>
          <MenuItem href={`/${locale}/apps/taskTracker/task`}>Task</MenuItem>
        </SubMenu>
        <SubMenu label="Prima Pluse Navigation" icon={<i className='ri-shopping-bag-3-line' />}>
          <MenuItem href={`/${locale}/apps/primaPluseNavigation/faq`}>FAQ</MenuItem>
          {/* <MenuItem href={`/${locale}/apps/primaPluseNavigation/faq`}>Help</MenuItem> */}
          <MenuItem href={`/${locale}/apps/primaPluseNavigation/primaProcess`}>Prima Process</MenuItem>

        </SubMenu>
        <SubMenu label="Administration" icon={<i className='ri-settings-4-line' />}>
          <SubMenu label="Company Setup">
            <MenuItem href={`/${locale}/apps/administration/units`}>Units</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/departments`}>Departments</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/sections`}>Sections</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/users`}>Users</MenuItem>
          </SubMenu>
          <SubMenu label="User Setup">
            <MenuItem href={`/${locale}/apps/administration/unitOfMeasure`}>Add Uom</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/priorities`}>Add Priority</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/permissions`}>Permission</MenuItem>
            {/* <MenuItem href={`/${locale}/apps/administration/sections`}>Control Setting</MenuItem> */}
          </SubMenu>
          <SubMenu label="Additional Setup">
            <MenuItem href={`/${locale}/apps/administration/companyFaq`}>Add Faq</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/visionMission`}>Vision/Mission</MenuItem>
          </SubMenu>

          <MenuItem href={`/${locale}/apps/administration/presentation`}>Presentation</MenuItem>
          <SubMenu label="Facility Details">
            <MenuItem href={`/${locale}/apps/administration/facilityDetails/location`}>Location</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/facilityDetails/layout`}>Layout</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/facilityDetails/machineAndEquipment`}>Machine & Equipment</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/facilityDetails/infrastructure`}>Infrastructure</MenuItem>
          </SubMenu>
          <SubMenu label="Photograph">
            <MenuItem href={`/${locale}/apps/administration/photograph/media`}>Media</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/photograph/events`}>Events</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/photograph/celebration`}>Celebration</MenuItem>
          </SubMenu>
          <SubMenu label="Products & Services">
            <MenuItem href={`/${locale}/apps/administration/productAndServices/softwareDevelopment`}>Software Development</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/productAndServices/productDevelopment`}>Product Development</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/productAndServices/bigDataServices`}>Big Data Services</MenuItem>
          </SubMenu>
          <SubMenu label="Procedure & Templates">
            <MenuItem href={`/${locale}/apps/administration/procedureAndTemplates/procedureHr`}>Procedure - HR</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/procedureAndTemplates/procedureOperations`}>Procedure - Operations</MenuItem>
            <MenuItem href={`/${locale}/apps/administration/procedureAndTemplates/procedureRnD`}>Procedure - R & D</MenuItem>
          </SubMenu>
          <MenuItem href={`/${locale}/apps/administration/governance`}>Governance</MenuItem>
        </SubMenu>







        {/* <MenuSection label={dictionary['navigation'].appsPages}> */}

        {/* <MenuItem
            href={`/${locale}/apps/email`}
            icon={<i className='ri-mail-open-line' />}
            exactMatch={false}
            activeUrl='/apps/email'
          >
            {dictionary['navigation'].email}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/chat`} icon={<i className='ri-wechat-line' />}>
            {dictionary['navigation'].chat}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/calendar`} icon={<i className='ri-calendar-line' />}>
            {dictionary['navigation'].calendar}
          </MenuItem> */}


        {/* <SubMenu label={dictionary['navigation'].pages} icon={<i className='ri-layout-left-line' />}>
            <MenuItem href={`/${locale}/pages/user-profile`}>{dictionary['navigation'].userProfile}</MenuItem>
            <MenuItem href={`/${locale}/pages/account-settings`}>{dictionary['navigation'].accountSettings}</MenuItem>
            <MenuItem href={`/${locale}/pages/faq`}>{dictionary['navigation'].faq}</MenuItem>
            <MenuItem href={`/${locale}/pages/pricing`}>{dictionary['navigation'].pricing}</MenuItem>
            <SubMenu label={dictionary['navigation'].miscellaneous}>
              <MenuItem href={`/${locale}/pages/misc/coming-soon`} target='_blank'>
                {dictionary['navigation'].comingSoon}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/misc/under-maintenance`} target='_blank'>
                {dictionary['navigation'].underMaintenance}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/misc/404-not-found`} target='_blank'>
                {dictionary['navigation'].pageNotFound404}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/misc/401-not-authorized`} target='_blank'>
                {dictionary['navigation'].notAuthorized401}
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu label={dictionary['navigation'].authPages} icon={<i className='ri-shield-keyhole-line' />}>
            <SubMenu label={dictionary['navigation'].login}>
              <MenuItem href={`/${locale}/pages/auth/login-v1`} target='_blank'>
                {dictionary['navigation'].loginV1}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/login-v2`} target='_blank'>
                {dictionary['navigation'].loginV2}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].register}>
              <MenuItem href={`/${locale}/pages/auth/register-v1`} target='_blank'>
                {dictionary['navigation'].registerV1}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/register-v2`} target='_blank'>
                {dictionary['navigation'].registerV2}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/register-multi-steps`} target='_blank'>
                {dictionary['navigation'].registerMultiSteps}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].verifyEmail}>
              <MenuItem href={`/${locale}/pages/auth/verify-email-v1`} target='_blank'>
                {dictionary['navigation'].verifyEmailV1}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/verify-email-v2`} target='_blank'>
                {dictionary['navigation'].verifyEmailV2}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].forgotPassword}>
              <MenuItem href={`/${locale}/pages/auth/forgot-password-v1`} target='_blank'>
                {dictionary['navigation'].forgotPasswordV1}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/forgot-password-v2`} target='_blank'>
                {dictionary['navigation'].forgotPasswordV2}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].resetPassword}>
              <MenuItem href={`/${locale}/pages/auth/reset-password-v1`} target='_blank'>
                {dictionary['navigation'].resetPasswordV1}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/reset-password-v2`} target='_blank'>
                {dictionary['navigation'].resetPasswordV2}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].twoSteps}>
              <MenuItem href={`/${locale}/pages/auth/two-steps-v1`} target='_blank'>
                {dictionary['navigation'].twoStepsV1}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/auth/two-steps-v2`} target='_blank'>
                {dictionary['navigation'].twoStepsV2}
              </MenuItem>
            </SubMenu>
          </SubMenu> */}





        {/* </MenuSection> */}


      </Menu>
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
      </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
