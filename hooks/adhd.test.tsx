import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'adhd-mode',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isCollapsed: false, isRunning: false },
} as const

test('switch and /adhd-on /adhd-off control the same mode', async ($, on) => {
  let seen: readonly string[] | undefined
  on('prompt.submit', (_, e) => {
    seen = e.context
    return { text: e.text }
  })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ key: 'adhd' }))?.text).toMatch(/●━━/)

  await $.prompt.submit({ text: 'hello' })
  expect(seen?.some(c => c.includes('ADHD MODE IS ON')) ?? false).toBe(false)

  // A press flips the switch and sends /adhd-on as if typed.
  await ui.press({ key: 'adhd' })
  expect((await ui.find({ key: 'adhd' }))?.text).toMatch(/━━●/)

  await $.prompt.submit({ text: 'hello' })
  expect(seen?.some(c => c.includes('ADHD MODE IS ON'))).toBe(true)

  // A plain message never moves the switch.
  await $.prompt.submit({ text: 'stop adhd mode' })
  expect((await ui.find({ key: 'adhd' }))?.text).toMatch(/━━●/)

  // The typed command moves it.
  await $.command.run({ command: 'adhd-off', args: '' })
  expect((await ui.find({ key: 'adhd' }))?.text).toMatch(/●━━/)
  await $.command.run({ command: 'adhd-on', args: '' })
  expect((await ui.find({ key: 'adhd' }))?.text).toMatch(/━━●/)

  // A press while on sends /adhd-off.
  await ui.press({ key: 'adhd' })
  expect((await ui.find({ key: 'adhd' }))?.text).toMatch(/●━━/)
  await ui.unmount()
})

test('desktop draws the custom switch', async $ => {
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ key: 'adhd-switch' })).toBeDefined()
  await ui.unmount()
})
