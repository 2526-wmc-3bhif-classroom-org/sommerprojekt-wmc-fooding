import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shoppingListService } from '../shoppingLists'
import { authService } from '../auth'
import { productService } from '../product'

vi.mock('../auth', () => ({
  authService: {
    getToken: vi.fn().mockReturnValue('fake-token'),
    handleUnauthorized: vi.fn()
  }
}))

vi.mock('../product', () => ({
  productService: {
    getProducts: vi.fn(),
    createProduct: vi.fn()
  }
}))

describe('shoppingListService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('getItems fetches items correctly', async () => {
    const mockItems = [{ shopping_item_id: 1, product_id: 10, quantity: 5 }]
    
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ items: mockItems })
    })
    vi.stubGlobal('fetch', fetchMock)

    const items = await shoppingListService.getItems()
    expect(items).toEqual(mockItems)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/shopping-list'), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      }
    })
  })

  it('addItem performs POST and returns id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ shopping_item_id: 42 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await shoppingListService.addItem({ product_id: 10, quantity: 2 })
    expect(result).toEqual({ shopping_item_id: 42 })
  })

  it('findOrCreateProduct returns existing product id', async () => {
    vi.mocked(productService.getProducts).mockResolvedValue([
      { product_id: 101, name: 'Apple', default_unit: 'Stk', category: 'Fruits' }
    ])

    const productId = await shoppingListService.findOrCreateProduct('Apple', 'Stk', 'Fruits')
    expect(productId).toBe(101)
    expect(productService.createProduct).not.toHaveBeenCalled()
  })

  it('findOrCreateProduct creates product if it does not exist', async () => {
    vi.mocked(productService.getProducts).mockResolvedValue([
      { product_id: 101, name: 'Apple', default_unit: 'Stk', category: 'Fruits' }
    ])
    vi.mocked(productService.createProduct).mockResolvedValue({
      product_id: 202,
      name: 'Orange',
      default_unit: 'Stk',
      category: 'Fruits'
    })

    const productId = await shoppingListService.findOrCreateProduct('Orange', 'Stk', 'Fruits')
    expect(productId).toBe(202)
    expect(productService.createProduct).toHaveBeenCalledWith('Orange', 'Stk', 'Fruits')
  })
})
