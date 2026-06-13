import { describe, it, expect, vi, beforeEach } from 'vitest'
import { productService } from '../product'
import { authService } from '../auth'

vi.mock('../auth', () => ({
  authService: {
    getToken: vi.fn().mockReturnValue('fake-token'),
    handleUnauthorized: vi.fn()
  }
}))

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('createProduct performs POST and returns product_id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ product_id: 123, message: 'Product created' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await productService.createProduct('Banana', 'Stk', 'Fruits')
    expect(res).toEqual({ product_id: 123, message: 'Product created' })
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/products'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({ name: 'Banana', default_unit: 'Stk', category: 'Fruits' })
    })
  })

  it('getProducts fetches all products', async () => {
    const mockProducts = [
      { product_id: 1, name: 'Apple', default_unit: 'kg', category: 'Fruits' }
    ]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ products: mockProducts })
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await productService.getProducts()
    expect(res).toEqual(mockProducts)
  })

  it('getProduct fetches single product details', async () => {
    const mockProduct = { product_id: 5, name: 'Milk', default_unit: 'Liter', category: 'Dairy' }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ product: mockProduct })
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await productService.getProduct(5)
    expect(res).toEqual(mockProduct)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/products/5'), expect.any(Object))
  })

  it('updateProduct performs PUT and returns message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ message: 'Product updated' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await productService.updateProduct(5, 'Soy Milk', 'Liter', 'Dairy')
    expect(res).toEqual({ message: 'Product updated' })
  })

  it('deleteProduct performs DELETE and returns message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ message: 'Product deleted' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await productService.deleteProduct(5)
    expect(res).toEqual({ message: 'Product deleted' })
  })

  it('handles unauthorized (401) responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ message: 'Unauthorized' })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(productService.getProducts()).rejects.toThrow('Unauthorized')
    expect(authService.handleUnauthorized).toHaveBeenCalled()
  })
})
