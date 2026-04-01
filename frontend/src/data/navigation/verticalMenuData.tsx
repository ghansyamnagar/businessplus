// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  // This is how you will normally render submenu
  {
    label: dictionary['navigation'].dashboards,
    icon: 'ri-home-smile-line',
    suffix: {
      label: '5',
      color: 'error'
    },
    children: [
      // This is how you will normally render menu item
      {
        label: dictionary['navigation'].crm,
        href: '/dashboards/crm'
      },

    ]
  },
  // {
  //   label: dictionary['navigation'].frontPages,
  //   icon: 'ri-file-copy-line',
  //   children: [
  //     {
  //       label: dictionary['navigation'].landing,
  //       href: '/front-pages/landing-page',
  //       target: '_blank',
  //       excludeLang: true
  //     },
  //     {
  //       label: dictionary['navigation'].pricing,
  //       href: '/front-pages/pricing',
  //       target: '_blank',
  //       excludeLang: true
  //     },
  //     {
  //       label: dictionary['navigation'].payment,
  //       href: '/front-pages/payment',
  //       target: '_blank',
  //       excludeLang: true
  //     },
  //     {
  //       label: dictionary['navigation'].checkout,
  //       href: '/front-pages/checkout',
  //       target: '_blank',
  //       excludeLang: true
  //     },
  //     {
  //       label: dictionary['navigation'].helpCenter,
  //       href: '/front-pages/help-center',
  //       target: '_blank',
  //       excludeLang: true
  //     }
  //   ]
  // },

  // This is how you will normally render menu section
  {
    label: dictionary['navigation'].appsPages,
    isSection: true,
    children: [





      // {
      //   label: dictionary['navigation'].email,
      //   href: '/apps/email',
      //   exactMatch: false,
      //   activeUrl: '/apps/email',
      //   icon: 'ri-mail-open-line'
      // },
      // {
      //   label: dictionary['navigation'].chat,
      //   href: '/apps/chat',
      //   icon: 'ri-wechat-line'
      // },
      // {
      //   label: dictionary['navigation'].calendar,
      //   href: '/apps/calendar',
      //   icon: 'ri-calendar-line'
      // },






      // {
      //   label: dictionary['navigation'].pages,
      //   icon: 'ri-layout-left-line',
      //   children: [
      //     {
      //       label: dictionary['navigation'].userProfile,
      //       href: '/pages/user-profile'
      //     },
      //     {
      //       label: dictionary['navigation'].accountSettings,
      //       href: '/pages/account-settings'
      //     },
      //     {
      //       label: dictionary['navigation'].faq,
      //       href: '/pages/faq'
      //     },
      //     {
      //       label: dictionary['navigation'].pricing,
      //       href: '/pages/pricing'
      //     },
      //     {
      //       label: dictionary['navigation'].miscellaneous,
      //       children: [
      //         {
      //           label: dictionary['navigation'].comingSoon,
      //           href: '/pages/misc/coming-soon',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].underMaintenance,
      //           href: '/pages/misc/under-maintenance',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].pageNotFound404,
      //           href: '/pages/misc/404-not-found',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].notAuthorized401,
      //           href: '/pages/misc/401-not-authorized',
      //           target: '_blank'
      //         }
      //       ]
      //     }
      //   ]
      // },
      // {
      //   label: dictionary['navigation'].authPages,
      //   icon: 'ri-shield-keyhole-line',
      //   children: [
      //     {
      //       label: dictionary['navigation'].login,
      //       children: [
      //         {
      //           label: dictionary['navigation'].loginV1,
      //           href: '/pages/auth/login-v1',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].loginV2,
      //           href: '/pages/auth/login-v2',
      //           target: '_blank'
      //         }
      //       ]
      //     },
      //     {
      //       label: dictionary['navigation'].register,
      //       children: [
      //         {
      //           label: dictionary['navigation'].registerV1,
      //           href: '/pages/auth/register-v1',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].registerV2,
      //           href: '/pages/auth/register-v2',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].registerMultiSteps,
      //           href: '/pages/auth/register-multi-steps',
      //           target: '_blank'
      //         }
      //       ]
      //     },
      //     {
      //       label: dictionary['navigation'].verifyEmail,
      //       children: [
      //         {
      //           label: dictionary['navigation'].verifyEmailV1,
      //           href: '/pages/auth/verify-email-v1',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].verifyEmailV2,
      //           href: '/pages/auth/verify-email-v2',
      //           target: '_blank'
      //         }
      //       ]
      //     },
      //     {
      //       label: dictionary['navigation'].forgotPassword,
      //       children: [
      //         {
      //           label: dictionary['navigation'].forgotPasswordV1,
      //           href: '/pages/auth/forgot-password-v1',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].forgotPasswordV2,
      //           href: '/pages/auth/forgot-password-v2',
      //           target: '_blank'
      //         }
      //       ]
      //     },
      //     {
      //       label: dictionary['navigation'].resetPassword,
      //       children: [
      //         {
      //           label: dictionary['navigation'].resetPasswordV1,
      //           href: '/pages/auth/reset-password-v1',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].resetPasswordV2,
      //           href: '/pages/auth/reset-password-v2',
      //           target: '_blank'
      //         }
      //       ]
      //     },
      //     {
      //       label: dictionary['navigation'].twoSteps,
      //       children: [
      //         {
      //           label: dictionary['navigation'].twoStepsV1,
      //           href: '/pages/auth/two-steps-v1',
      //           target: '_blank'
      //         },
      //         {
      //           label: dictionary['navigation'].twoStepsV2,
      //           href: '/pages/auth/two-steps-v2',
      //           target: '_blank'
      //         }
      //       ]
      //     }
      //   ]
      // },



    ]
  },
]

export default verticalMenuData
