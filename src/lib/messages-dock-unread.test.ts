import { describe, expect, it } from 'vitest'
import { computeMessagesDockUnreadCount } from '@/lib/messages-dock-unread'

describe('computeMessagesDockUnreadCount', () => {
  it('counts encyclopedia and archivist entries after read thresholds', () => {
    expect(
      computeMessagesDockUnreadCount({
        gameMessages: [
          { id: '1', ts: 100, kind: 'encyclopedia', title: '', body: '' },
          { id: '2', ts: 200, kind: 'encyclopedia', title: '', body: '' },
        ],
        archivistThread: [{ id: 'a', ts: 150, speaker: 'archivist', text: 'x' }],
        encyclopediaReadUpToTs: 100,
        archivistReadUpToTs: 100,
      })
    ).toBe(2)
  })

  it('returns zero when everything is read', () => {
    expect(
      computeMessagesDockUnreadCount({
        gameMessages: [{ id: '1', ts: 100, kind: 'encyclopedia', title: '', body: '' }],
        archivistThread: [],
        encyclopediaReadUpToTs: 100,
        archivistReadUpToTs: 0,
      })
    ).toBe(0)
  })
})
