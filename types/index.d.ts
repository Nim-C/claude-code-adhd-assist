export type AdhdFlag = boolean

declare module 'claude-code' {
  interface PluginState {
    'adhd-mode': { isOn: boolean }
  }
}
