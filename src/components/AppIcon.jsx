import IconHome from './icons/IconHome.jsx'
import IconMenu from './icons/IconMenu.jsx'
import IconAlarm from './icons/IconAlarm.jsx'
import IconInfo from './icons/IconInfo.jsx'
import IconBack from './icons/IconBack.jsx'
import IconSettings from './icons/IconSettings.jsx'
import IconFault from './icons/IconFault.jsx'
import IconChannel from './icons/IconChannel.jsx'
import IconGps from './icons/IconGps.jsx'
import IconLogin from './icons/IconLogin.jsx'
import IconTheme from './icons/IconTheme.jsx'
import IconCircle from './icons/IconCircle.jsx'
import IconReset from './icons/IconReset.jsx'
import IconSend from './icons/IconSend.jsx'
import IconCheckCircle from './icons/IconCheckCircle.jsx'
import IconXCircle from './icons/IconXCircle.jsx'

const iconMap = {
  home: IconHome,
  menu: IconMenu,
  alarm: IconAlarm,
  info: IconInfo,
  back: IconBack,
  settings: IconSettings,
  fault: IconFault,
  channel: IconChannel,
  gps: IconGps,
  login: IconLogin,
  theme: IconTheme,
  reset: IconReset,
  send: IconSend,
  'check-circle': IconCheckCircle,
  'x-circle': IconXCircle,
}

export default function AppIcon({ name, size = 22, label = '' }) {
  const IconComponent = iconMap[name] ?? IconCircle
  return <IconComponent size={size} aria-label={label || undefined} />
}
