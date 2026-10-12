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
import IconLock from './icons/IconLock.jsx'
import IconCheckCircle from './icons/IconCheckCircle.jsx'
import IconXCircle from './icons/IconXCircle.jsx'
import IconZeta from './icons/IconZeta.jsx'
import IconRemote from './icons/IconRemote.jsx'
import IconFillKey from './icons/IconKeyFill.jsx'
import IconReload from './icons/IconReload.jsx'
import IconWaveform from './icons/IconWF.jsx'
import {
  IconBasic,
  IconSquelch,
  IconCrypto,
  IconAudio,
  IconSerial,
  IconRadio,
  IconCompressor,
  IconRadioSilence,
  IconPowerSaving,
  IconMilStd188220c,
  IconOtad,
  IconAbout,
} from './icons/IconWaveform.jsx'
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
  lock: IconLock,
  zeta: IconZeta,
  remote: IconRemote,
  fillKey: IconFillKey,
  'check-circle': IconCheckCircle,
  'x-circle': IconXCircle,
   basic: IconBasic,
  squelch: IconSquelch,
  crypto: IconCrypto,
  audio: IconAudio,
  serial: IconSerial,
  radio: IconRadio,
  compressor: IconCompressor,
  'radio-silence': IconRadioSilence,
  powersaving: IconPowerSaving,
  mil_std_188_220c: IconMilStd188220c,
  otad: IconOtad,
  about: IconAbout,
  reload:IconReload,
  waveform: IconWaveform
}

export default function AppIcon({ name, size = 22, label = '' }) {

  const IconComponent = iconMap[name] ?? IconCircle
  return <IconComponent size={size} aria-label={label || undefined} />
}
