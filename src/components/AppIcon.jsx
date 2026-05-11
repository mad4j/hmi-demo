import { IconHome } from './icons/IconHome.jsx'
import { IconMenu } from './icons/IconMenu.jsx'
import { IconAlarm } from './icons/IconAlarm.jsx'
import { IconInfo } from './icons/IconInfo.jsx'
import { IconBack } from './icons/IconBack.jsx'
import { IconLock } from './icons/IconLock.jsx'
import { IconCheckCircle } from './icons/IconCheckCircle.jsx'
import { IconXCircle } from './icons/IconXCircle.jsx'
import { IconReset } from './icons/IconReset.jsx'
import { IconSend } from './icons/IconSend.jsx'
import { IconCircle } from './icons/IconCircle.jsx'

const iconMap = {
  home: IconHome,
  menu: IconMenu,
  alarm: IconAlarm,
  info: IconInfo,
  back: IconBack,
  lock: IconLock,
  'check-circle': IconCheckCircle,
  'x-circle': IconXCircle,
  reset: IconReset,
  send: IconSend,
  circle: IconCircle,
}

export const AppIcon = ({ name, size = 22, label = '' }) => {
  const IconComponent = iconMap[name] ?? IconCircle
  return <IconComponent size={size} />
}