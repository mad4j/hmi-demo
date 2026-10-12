// Lookup used only for icon names coming from the YAML configuration.
// Components with a fixed icon import it directly from this folder.
import IconHome from './IconHome.jsx'
import IconMenu from './IconMenu.jsx'
import IconAlarm from './IconAlarm.jsx'
import IconInfo from './IconInfo.jsx'
import IconBack from './IconBack.jsx'
import IconSettings from './IconSettings.jsx'
import IconFault from './IconFault.jsx'
import IconChannel from './IconChannel.jsx'
import IconGps from './IconGps.jsx'
import IconLogin from './IconLogin.jsx'
import IconTheme from './IconTheme.jsx'
import IconCircle from './IconCircle.jsx'
import IconReset from './IconReset.jsx'
import IconSend from './IconSend.jsx'
import IconLock from './IconLock.jsx'
import IconCheckCircle from './IconCheckCircle.jsx'
import IconXCircle from './IconXCircle.jsx'
import IconZeta from './IconZeta.jsx'
import IconRemote from './IconRemote.jsx'
import IconKeyFill from './IconKeyFill.jsx'
import IconReload from './IconReload.jsx'
import IconWF from './IconWF.jsx'
import IconBasic from './IconBasic.jsx'
import IconSquelch from './IconSquelch.jsx'
import IconCrypto from './IconCrypto.jsx'
import IconAudio from './IconAudio.jsx'
import IconSerial from './IconSerial.jsx'
import IconRadio from './IconRadio.jsx'
import IconCompressor from './IconCompressor.jsx'
import IconRadioSilence from './IconRadioSilence.jsx'
import IconPowerSaving from './IconPowerSaving.jsx'
import IconMilStd188220c from './IconMilStd188220c.jsx'
import IconOtad from './IconOtad.jsx'
import IconAbout from './IconAbout.jsx'

const iconsByName = {
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
  fillKey: IconKeyFill,
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
  reload: IconReload,
  waveform: IconWF,
}

export const getIconByName = (name) => iconsByName[name] ?? IconCircle
