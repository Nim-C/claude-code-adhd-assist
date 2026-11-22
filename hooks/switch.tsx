import type { ClientModule } from 'claude-code'

// An invisible click area laid over the switch picture in the desktop app.
// A left click posts a toggle to the hooks module.
type Props = { on: boolean }
type State = { ready: true }

const ClickArea: ClientModule<Props, State> = (_props, surface) => {
  const { Text } = surface.elements

  if (surface.state === undefined) {
    surface.onPointer(event => {
      if (event.type === 'down' && (event.button ?? 'left') === 'left') {
        surface.post({ toggle: true })
      }
    })
    surface.setState({ ready: true })
  }

  return <Text>{'     '}</Text>
}

export default ClickArea
