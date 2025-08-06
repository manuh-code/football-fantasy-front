// Common icons configuration for Oh My Vue Icons
// Import only the icons you need to reduce bundle size

// Basic icons
import {
  HiSolidHome,
  HiSolidUser,
  HiSolidCog,
  HiSolidLogout,
  HiSolidMenu,
  HiSolidX,
  HiSolidChevronDown,
  HiSolidChevronUp,
  HiSolidChevronLeft,
  HiSolidChevronRight,
  HiSolidPlus,
  HiSolidMinus,
  HiSolidCheck,
  HiSolidExclamation,
  HiSolidInformationCircle,
  HiSolidXCircle,
  HiSolidCheckCircle,
  HiSolidExclamationCircle,
} from 'oh-vue-icons/icons'

// Theme icons
import {
  HiSolidSun,
  HiSolidMoon,
  HiSolidDesktopComputer,
} from 'oh-vue-icons/icons'

// Search and filter icons
import {
  HiSolidSearch,
  HiSolidFilter,
  HiSolidAdjustments,
  HiSolidSortAscending,
  HiSolidSortDescending,
} from 'oh-vue-icons/icons'

// Navigation icons
import {
  HiSolidArrowLeft,
  HiSolidArrowRight,
  HiSolidArrowUp,
  HiSolidArrowDown,
  HiSolidExternalLink,
} from 'oh-vue-icons/icons'

// Action icons
import {
  HiSolidPencil,
  HiSolidTrash,
  HiSolidDuplicate,
  HiSolidDownload,
  HiSolidUpload,
  HiSolidRefresh,
  HiSolidEye,
  HiSolidEyeOff,
} from 'oh-vue-icons/icons'

// Status icons
import {
  HiSolidClock,
  HiSolidBell,
  HiSolidStar,
  HiSolidHeart,
  HiSolidBookmark,
  HiSolidShare,
} from 'oh-vue-icons/icons'

// Login icons (Bootstrap Icons)
import {
  BiPersonFill,
  BiLockFill,
  BiGoogle,
  BiEyeFill,
  BiEyeSlashFill,
} from 'oh-vue-icons/icons'

// Export all icons in an array for easy registration
export const iconList = [
  // Basic icons
  HiSolidHome,
  HiSolidUser,
  HiSolidCog,
  HiSolidLogout,
  HiSolidMenu,
  HiSolidX,
  HiSolidChevronDown,
  HiSolidChevronUp,
  HiSolidChevronLeft,
  HiSolidChevronRight,
  HiSolidPlus,
  HiSolidMinus,
  HiSolidCheck,
  HiSolidExclamation,
  HiSolidInformationCircle,
  HiSolidXCircle,
  HiSolidCheckCircle,
  HiSolidExclamationCircle,
  
  // Theme icons
  HiSolidSun,
  HiSolidMoon,
  HiSolidDesktopComputer,
  
  // Search and filter icons
  HiSolidSearch,
  HiSolidFilter,
  HiSolidAdjustments,
  HiSolidSortAscending,
  HiSolidSortDescending,
  
  // Navigation icons
  HiSolidArrowLeft,
  HiSolidArrowRight,
  HiSolidArrowUp,
  HiSolidArrowDown,
  HiSolidExternalLink,
  
  // Action icons
  HiSolidPencil,
  HiSolidTrash,
  HiSolidDuplicate,
  HiSolidDownload,
  HiSolidUpload,
  HiSolidRefresh,
  HiSolidEye,
  HiSolidEyeOff,
  
  // Status icons
  HiSolidClock,
  HiSolidBell,
  HiSolidStar,
  HiSolidHeart,
  HiSolidBookmark,
  HiSolidShare,
  
  // Login icons
  BiPersonFill,
  BiLockFill,
  BiGoogle,
  BiEyeFill,
  BiEyeSlashFill,
]

// Icon name mapping for easier usage
export const iconNames = {
  // Basic
  home: 'hi-solid-home',
  user: 'hi-solid-user',
  settings: 'hi-solid-cog',
  logout: 'hi-solid-logout',
  menu: 'hi-solid-menu',
  close: 'hi-solid-x',
  chevronDown: 'hi-solid-chevron-down',
  chevronUp: 'hi-solid-chevron-up',
  chevronLeft: 'hi-solid-chevron-left',
  chevronRight: 'hi-solid-chevron-right',
  plus: 'hi-solid-plus',
  minus: 'hi-solid-minus',
  check: 'hi-solid-check',
  exclamation: 'hi-solid-exclamation',
  info: 'hi-solid-information-circle',
  error: 'hi-solid-x-circle',
  success: 'hi-solid-check-circle',
  warning: 'hi-solid-exclamation-circle',
  
  // Theme
  sun: 'hi-solid-sun',
  moon: 'hi-solid-moon',
  computer: 'hi-solid-desktop-computer',
  
  // Search and filter
  search: 'hi-solid-search',
  filter: 'hi-solid-filter',
  adjustments: 'hi-solid-adjustments',
  sortAsc: 'hi-solid-sort-ascending',
  sortDesc: 'hi-solid-sort-descending',
  
  // Navigation
  arrowLeft: 'hi-solid-arrow-left',
  arrowRight: 'hi-solid-arrow-right',
  arrowUp: 'hi-solid-arrow-up',
  arrowDown: 'hi-solid-arrow-down',
  externalLink: 'hi-solid-external-link',
  
  // Actions
  edit: 'hi-solid-pencil',
  delete: 'hi-solid-trash',
  duplicate: 'hi-solid-duplicate',
  download: 'hi-solid-download',
  upload: 'hi-solid-upload',
  refresh: 'hi-solid-refresh',
  show: 'hi-solid-eye',
  hide: 'hi-solid-eye-off',
  
  // Status
  clock: 'hi-solid-clock',
  bell: 'hi-solid-bell',
  star: 'hi-solid-star',
  heart: 'hi-solid-heart',
  bookmark: 'hi-solid-bookmark',
  share: 'hi-solid-share',
} as const

export type IconName = keyof typeof iconNames
