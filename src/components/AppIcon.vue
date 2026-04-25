<script setup>
import IconHome from './icons/IconHome.vue'
import IconMenu from './icons/IconMenu.vue'
import IconAlarm from './icons/IconAlarm.vue'
import IconInfo from './icons/IconInfo.vue'
import IconBack from './icons/IconBack.vue'
import IconSettings from './icons/IconSettings.vue'
import IconFault from './icons/IconFault.vue'
import IconChannel from './icons/IconChannel.vue'
import IconGps from './icons/IconGps.vue'
import IconLogin from './icons/IconLogin.vue'
import IconTheme from './icons/IconTheme.vue'
import IconCircle from './icons/IconCircle.vue'

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
}

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 22,
  },
  label: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <component :is="iconMap[props.name] ?? IconCircle" :size="props.size" />
</template>
