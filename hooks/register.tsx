import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { RULES } from './rules'

// ADHD mode: one on/off switch, separate from the output style.
// Off by default in every session. When on, the ADHD rules ride along with
// each message you send, on top of whatever output style is active.
const isOn = atom({ plugin: 'adhd-mode', key: 'isOn' } as const, false)

const HEADER =
  'ADHD MODE IS ON (the user switched it on with the ADHD button). ' +
  'Apply the rules below to this reply, on top of the active output style. ' +
  'Keep the language the user writes in. Only the switch turns ADHD mode off; ' +
  'if the user asks to stop it, tell them to click the switch.\n\n'

// Apple-style switch: rounded pill, a smaller white round knob with a soft
// shadow and an even gap all around it. Blue with the knob right when on,
// grey with it left when off. With `animate`, the knob slides and the colour
// fades from the old state to the new one (0.25s, eased).
const BLUE = '#3478F6'
const GREY = '#787880'
const KNOB_OFF = 15.5 // 15.5 - r(11) = 4.5 gap on the left
const KNOB_ON = 37.5 // 53 - 37.5 - r(11) = 4.5 gap on the right

function switchSvg(on: boolean, animate: boolean): string {
  const track = on ? BLUE : GREY
  const cx = on ? KNOB_ON : KNOB_OFF
  const ease = 'calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" dur="0.25s" fill="freeze"'
  const slide = animate
    ? `<animate attributeName="cx" from="${on ? KNOB_OFF : KNOB_ON}" to="${cx}" ${ease}/>`
    : ''
  const fade = animate
    ? `<animate attributeName="fill" from="${on ? GREY : BLUE}" to="${track}" ${ease}/>`
    : ''

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="53" height="31" viewBox="0 0 53 31">' +
    '<defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%">' +
    '<feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.3"/></filter></defs>' +
    `<rect x="0" y="0" width="53" height="31" rx="15.5" fill="${track}">${fade}</rect>` +
    `<circle cx="${cx}" cy="15.5" r="11" fill="#FFFFFF" filter="url(#s)">${slide}</circle>` +
    '</svg>'
  )
}

// A press on the switch: move it now, then leave a line in the chat, as the
// typed /adhd-on or /adhd-off would, so you can see where it was switched.
// A hidden note tells Claude too.
async function press($: EngineInterface): Promise<boolean> {
  let now = false
  await update($, isOn, v => {
    now = !v
    return now
  })
  $.ui.log(now ? '/adhd-on  ·  ADHD mode: ON' : '/adhd-off  ·  ADHD mode: OFF')
  void $.session
    .append({
      message: {
        type: 'user',
        content: [
          {
            type: 'text',
            text: now
              ? '[The user clicked the switch: ADHD mode ON from here.]'
              : '[The user clicked the switch: ADHD mode OFF from here.]',
          },
        ],
      },
    })
    .catch(() => undefined)

  return now
}

export const register: Register = on => {
  // The state the switch was last drawn in, so a change animates and
  // the first drawing of a new chat does not.
  let lastDrawn: boolean | null = null

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'adhd-on', description: 'Turn ADHD mode on' })
    await $.command.register({ name: 'adhd-off', description: 'Turn ADHD mode off' })
    await $.command.register({
      name: 'adhd-mode',
      description: 'Show whether ADHD mode is on, and the options',
    })

    return next(e)
  })

  on('command.run', { command: 'adhd-mode' }, async $ => {
    const active = await read($, isOn).catch(() => false)

    return {
      text: active
        ? 'ADHD mode: 🔵 ON\n\nOptions:\n  /adhd-off  turn it off\n  or click the switch above the message box'
        : 'ADHD mode: ⚪ OFF\n\nOptions:\n  /adhd-on  turn it on\n  or click the switch above the message box',
    }
  })

  on('command.run', { command: 'adhd-on' }, async $ => {
    await update($, isOn, () => true)

    return { text: 'ADHD mode: ON' }
  })

  on('command.run', { command: 'adhd-off' }, async $ => {
    await update($, isOn, () => false)

    return { text: 'ADHD mode: OFF' }
  })


  on('prompt.submit', async ($, e, next) => {
    // Only the switch decides; what the message says never changes it.
    // Never block a message: if reading the switch fails, treat it as off.
    const active = await read($, isOn).catch(() => false)

    if (!active) {
      return next(e)
    }

    return next({ ...e, context: [...(e.context ?? []), HEADER + RULES] })
  })

  // A click on the desktop switch.
  on('ui.message', async ($, e) => {
    if (e.element !== 'adhd-switch') {
      return {}
    }

    return { props: { on: await press($) } }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const active = await read($, isOn)

    // Desktop app: an Apple-style switch picture, with an invisible
    // click area (./switch.tsx) laid on top of it.
    if (e.surface === 'desktop') {
      const { Box, Text, Svg, Client } = $.ui.resolve(e)
      const animate = lastDrawn !== null && lastDrawn !== active
      lastDrawn = active

      return (
        <Box flexDirection="row" alignItems="center" gap={1}>
          <Text>ADHD Accessibility</Text>
          <Box position="relative">
            <Svg
              source={switchSvg(active, animate)}
              isInteractive
              alt={active ? 'ADHD Accessibility switch: on' : 'ADHD Accessibility switch: off'}
              width={38}
              height={22}
            />
            <Box position="absolute" top={0} left={0}>
              <Client
                key="adhd-switch"
                module="./switch.tsx"
                props={{ on: active }}
                width={5}
                height={1}
              />
            </Box>
          </Box>
        </Box>
      )
    }

    const { Box, Button, Text } = $.ui.resolve(e)

    // Drawn like a switch: knob on the right and blue when on,
    // knob on the left and grey when off.
    return (
      <Box>
        <Button
          key="adhd"
          label={active ? 'ADHD Accessibility: on' : 'ADHD Accessibility: off'}
          variant={active ? 'primary' : 'secondary'}
          onPress={() => press($)}
        >
          <Text>ADHD Accessibility  </Text>
          {active ? (
            <Text color="blue" bold>━━●</Text>
          ) : (
            <Text dimColor>●━━</Text>
          )}
        </Button>
      </Box>
    )
  })
}
