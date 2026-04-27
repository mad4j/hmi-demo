import { load } from 'js-yaml'
import rawApplicationConfig from '../config/application.yaml?raw'
import { normalizeMenuItems } from './useMenuConfig.js'

const fallbackApplicationConfig = {
  name: 'HMI Demo',
  pages: [],
}

const buildApplicationConfig = () => {
  try {
    const parsed = load(rawApplicationConfig)
    if (!parsed || typeof parsed !== 'object') return fallbackApplicationConfig

    const name =
      typeof parsed.name === 'string' && parsed.name.trim()
        ? parsed.name.trim()
        : fallbackApplicationConfig.name

    const sourcePages = Array.isArray(parsed.pages) ? parsed.pages : []
    const pages = normalizeMenuItems(sourcePages)

    return { name, pages }
  } catch {
    return fallbackApplicationConfig
  }
}

export const applicationConfig = buildApplicationConfig()
