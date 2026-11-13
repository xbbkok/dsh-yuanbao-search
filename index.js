/**
 * Host half of the Yuanbao Search bundle.
 *
 * The search itself happens on so.qq.com, rendered by the Client module in a
 * frame-wide panel. This half deliberately registers nothing: no service, no
 * route, no tool. Keeping it empty means the bundle cannot fail activation on
 * a service-name collision, and the Client module carries its own defaults.
 *
 * Nothing here reads, stores or forwards credentials: the session the user
 * creates on so.qq.com belongs to the browser context that renders the panel.
 */
export const name = 'yuanbao-search'

export function apply() {}
