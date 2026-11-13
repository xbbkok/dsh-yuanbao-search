window.__ModuleLoader__.load({
  id: 'dsh-yuanbao-search',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const PANEL_KEY = 'dsh-yuanbao-search'
    const LOCALE_NS = 'yuanbao-search'
    // AI mode keeps search inside so.qq.com. The plain home page hands web
    // queries to sogou.com, which cannot render in a frame and makes the shell
    // open the OS browser instead.
    const SITE = 'https://so.qq.com/iaimode'
    const SEARCH_PATH = '/iaimode/search'

    // Panel copy. Registered with the Client locale service below, so the labels
    // follow the active locale instead of being hard-coded per language.
    const ZH = {
      panelLabel: '元宝搜索',
      searchPlaceholder: '在元宝 AI 搜索中提问，回车开始',
      search: '搜索',
      home: '首页',
      reload: '刷新',
      external: '浏览器打开',
      hint: '答案在面板内生成；登录、历史与对话都保存在元宝站内，DSH 不保存你的账号信息。',
      blocked: '元宝搜索没有在面板内加载。可能是网络问题或站点限制了嵌入，可以用「浏览器打开」。',
    }

    const EN = {
      panelLabel: 'Yuanbao Search',
      searchPlaceholder: 'Ask Yuanbao AI search, then press Enter',
      search: 'Search',
      home: 'Home',
      reload: 'Reload',
      external: 'Open in browser',
      hint: 'Answers are produced inside the panel; sign-in, history and chats stay on the Yuanbao site and the Harness stores no account details.',
      blocked: 'Yuanbao Search did not load in the panel. The site may block embedding or the network may be down; try Open in browser.',
    }

    const CSS = `
.ybs-root{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-label-primary,inherit);font:inherit}
.ybs-bar{display:flex;align-items:center;gap:8px;padding:10px 16px;flex:none;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2));background:var(--dsw-alias-bg-layer-1,transparent)}
.ybs-brand{display:flex;align-items:center;gap:8px;padding-right:4px;font-weight:600;white-space:nowrap;color:var(--dsw-alias-label-primary,inherit)}
.ybs-input{flex:1;min-width:0;height:34px;padding:0 12px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.3));background:var(--dsw-alias-bg-base,transparent);color:inherit;font:inherit;outline:none}
.ybs-input:focus{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.ybs-btn{height:34px;padding:0 14px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.3));background:transparent;color:inherit;font:inherit;cursor:pointer;white-space:nowrap}
.ybs-btn:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.1))}
.ybs-btn-primary{border-color:var(--dsw-alias-brand-primary,#4d6bfe);background:var(--dsw-alias-brand-primary,#4d6bfe);color:#fff}
.ybs-body{position:relative;flex:1;min-height:0}
.ybs-frame{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.05))}
.ybs-hint{flex:none;padding:8px 16px;font-size:12px;color:var(--dsw-alias-label-secondary,rgba(127,127,127,.9));border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.15))}
`

    /** Compose the in-site AI search address for a typed query. */
    function searchUrl(base, query) {
      const trimmed = String(query || '').trim()
      if (!trimmed) return base
      try {
        const url = new URL(base)
        url.pathname = SEARCH_PATH
        url.search = ''
        url.searchParams.set('query', trimmed)
        return url.toString()
      } catch {
        return base
      }
    }

    /** The mark used both in the panel header and in the sidebar entry. */
    function Mark(props) {
      const size = props && typeof props.size === 'number' && props.size > 0 ? props.size : 20
      return h(
        'svg',
        {
          viewBox: '0 0 64 64',
          width: size,
          height: size,
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block', flex: 'none' },
        },
        h('rect', { width: 64, height: 64, rx: 16, fill: '#3d7bff' }),
        h('path', {
          d: 'M22 45.5c-6.2 0-11-4.6-11-10.4 0-5.4 4.2-9.8 9.6-10.3 1.4-5 6-8.6 11.4-8.6 6.1 0 11.1 4.5 11.9 10.3 5.1.5 9.1 4.4 9.1 9.3 0 5.3-4.6 9.7-10.6 9.7H22z',
          fill: '#fff',
          opacity: 0.95,
        }),
        h('circle', { cx: 42, cy: 42, r: 7, fill: '#fff' }),
        h('circle', { cx: 42, cy: 42, r: 4.2, stroke: '#2f6bff', strokeWidth: 2.2 }),
        h('path', { d: 'M45.6 45.6l4.2 4.2', stroke: '#2f6bff', strokeWidth: 2.6, strokeLinecap: 'round' }),
      )
    }

    /** Panel body: a toolbar above the Yuanbao AI search page itself. */
    function Panel(props) {
      const t = props.t
      const base = (props.settings && props.settings.baseUrl) || SITE
      const [draft, setDraft] = React.useState('')
      const [address, setAddress] = React.useState(base)
      const [reloadKey, setReloadKey] = React.useState(0)
      const [failed, setFailed] = React.useState(false)

      const submit = (event) => {
        event.preventDefault()
        setFailed(false)
        setAddress(searchUrl(base, draft))
      }

      const goHome = () => {
        setFailed(false)
        setDraft('')
        setAddress(base)
      }

      const reload = () => {
        setFailed(false)
        setReloadKey((n) => n + 1)
      }

      return h(
        'div',
        { className: 'ybs-root' },
        h('style', null, CSS),
        h(
          'form',
          { className: 'ybs-bar', onSubmit: submit },
          h('span', { className: 'ybs-brand' }, h(Mark, { size: 20 }), h('span', null, t('panelLabel'))),
          h('input', {
            className: 'ybs-input',
            value: draft,
            onChange: (event) => setDraft(event.target.value),
            placeholder: t('searchPlaceholder'),
            'aria-label': t('searchPlaceholder'),
            spellCheck: false,
          }),
          h('button', { className: 'ybs-btn ybs-btn-primary', type: 'submit' }, t('search')),
          h('button', { className: 'ybs-btn', type: 'button', onClick: goHome }, t('home')),
          h('button', { className: 'ybs-btn', type: 'button', onClick: reload }, t('reload')),
          h(
            'button',
            { className: 'ybs-btn', type: 'button', onClick: () => window.open(address, '_blank', 'noopener') },
            t('external'),
          ),
        ),
        h(
          'div',
          { className: 'ybs-body' },
          h('iframe', {
            key: `${address}#${reloadKey}`,
            className: 'ybs-frame',
            src: address,
            title: t('panelLabel'),
            allow: 'clipboard-write',
            referrerPolicy: 'no-referrer-when-downgrade',
            onError: () => setFailed(true),
          }),
        ),
        failed
          ? h('div', { className: 'ybs-hint', role: 'status' }, t('blocked'))
          : h('div', { className: 'ybs-hint' }, t('hint')),
      )
    }

    /** Sidebar entry: the host renders it as a button and owns navigation. */
    function PanelEntry(props) {
      const size = props && typeof props.size === 'number' && props.size > 0 ? props.size : 16
      const label = (() => {
        try {
          return typeof props.label === 'function' ? props.label() : ''
        } catch {
          return ''
        }
      })()
      return h(
        'span',
        {
          title: label || undefined,
          'aria-label': label || undefined,
          role: 'img',
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            opacity: props && props.active ? 1 : 0.82,
          },
        },
        h(Mark, { size }),
      )
    }

    function apply(ctx) {
      const slots = ctx.get('slots')
      if (!slots || typeof slots.inject !== 'function' || typeof slots.register !== 'function') {
        console.error('[dsh-yuanbao-search] the slot service is unavailable; the panel cannot mount')
        return
      }

      // Panel copy belongs to this bundle's locale namespace.
      try {
        const locale = ctx.get('locale')
        if (locale && typeof locale.register === 'function') {
          ctx.effect(() => locale.register(LOCALE_NS, { zh: ZH, en: EN }), 'yuanbao-search: panel labels')
        }
      } catch (error) {
        console.error('[dsh-yuanbao-search] locale dictionaries were not registered:', error)
      }

      const settings = (() => {
        try {
          return ctx.get('yuanbaoSearchConfig') || {}
        } catch {
          return {}
        }
      })()

      const translate = (key) => {
        try {
          const locale = ctx.get('locale')
          const dict = locale && typeof locale.bind === 'function' ? locale.bind(LOCALE_NS) : null
          const hit = typeof dict === 'function' ? dict(key) : dict && dict[key]
          if (typeof hit === 'string' && hit.length > 0) return hit
        } catch {
          // fall through to the bundled English copy
        }
        return EN[key] || key
      }

      const show = (props) => h(Panel, { ...(props || {}), t: translate, settings })

      // 1. The panel body, addressed by the sidebar entry's id.
      slots.inject('main', () => slots.register({ name: 'main', key: PANEL_KEY }, show))

      // 2. The sidebar entry that opens it. The host turns this into a switch.
      slots.inject('sidebar.panellist', () =>
        slots.register(
          { name: 'sidebar.panellist', id: PANEL_KEY, order: 30, label: () => translate('panelLabel') },
          (props) => h(PanelEntry, { ...(props || {}), label: () => translate('panelLabel') }),
        ),
      )
    }

    return { apply, inject: ['slots', 'locale'], name: 'dsh-yuanbao-search/client' }
  },
})
