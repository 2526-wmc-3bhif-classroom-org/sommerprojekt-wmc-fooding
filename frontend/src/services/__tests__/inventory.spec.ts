import { describe, it, expect, vi, beforeEach } from 'vitest'
import { inventoryService } from '../inventory'
import { authService } from '../auth'

vi.mock('../auth', () => ({
  authService: {
    getToken: vi.fn().mockReturnValue('fake-token'),
    handleUnauthorized: vi.fn()
  }
}))

describe('inventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('getInventory fetches items successfully', async () => {
    const mockItems = [{ inventory_id: 1, product_id: 10, quantity: 3, expiration_date: '2026-06-15' }]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ items: mockItems })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await inventoryService.getInventory()
    expect(result).toEqual(mockItems)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/inventory-items'), {
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    })
  })

  it('addItem performs POST with body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({})
    })
    vi.stubGlobal('fetch', fetchMock)

    await inventoryService.addItem({ product_id: 10, quantity: 3, expiration_date: '2026-06-15' })
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/inventory-items'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({ product_id: 10, quantity: 3, expiration_date: '2026-06-15' })
    })
  })

  it('updateItem performs PUT', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({})
    })
    vi.stubGlobal('fetch', fetchMock)

    await inventoryService.updateItem(42, { quantity: 10 })
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/inventory-items/42'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({ quantity: 10 })
    })
  })

  it('deleteItem performs DELETE', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({})
    })
    vi.stubGlobal('fetch', fetchMock)

    await inventoryService.deleteItem(42)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/inventory-items/42'), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    })
  })

  it('uploadImage performs PUT with FormData', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ image: 'uploaded_path.jpg' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })
    const imagePath = await inventoryService.uploadImage(42, file)
    expect(imagePath).toBe('uploaded_path.jpg')
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/inventory-items/42/image'), {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer fake-token'
      },
      body: expect.any(FormData)
    })
  })
})
