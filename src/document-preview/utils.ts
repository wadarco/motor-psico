export interface ResizeAction {
  readonly type: '~document-preview/resize'
  readonly payload: { height: number }
}

export interface RenderAction {
  readonly type: '~document-preview/render'
  readonly payload: { source: string }
}

export function isValidRenderEvent(
  event: MessageEvent<RenderAction>,
): event is MessageEvent<RenderAction> {
  return (
    event.origin === window.location.origin &&
    event.data.type === '~document-preview/render'
  )
}
