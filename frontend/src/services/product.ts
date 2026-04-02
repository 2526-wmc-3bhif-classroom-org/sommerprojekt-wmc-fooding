import { authService } from './auth'

export interface Product {
  product_id?: number
  name: string
  default_unit: string
}

export interface CreateProductResponse {
  product_id: number
  message: string
}

export interface GetProductsResponse {
  products: Product[]
}

export interface GetProductResponse {
  product: Product
}

export interface UpdateProductResponse {
  message: string
}

export interface DeleteProductResponse {
  message: string
}

const API_URL = 'http://127.0.0.1:8080'

class ProductService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  async createProduct(name: string, default_unit: string): Promise<CreateProductResponse> {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, default_unit })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create product')
    }

    return await response.json()
  }

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch products')
    }

    const data: GetProductsResponse = await response.json()
    return data.products
  }

  async getProduct(product_id: number): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${product_id}`, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch product')
    }

    const data: GetProductResponse = await response.json()
    return data.product
  }

  async updateProduct(product_id: number, name: string, default_unit: string): Promise<UpdateProductResponse> {
    const response = await fetch(`${API_URL}/products/${product_id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, default_unit })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update product')
    }

    return await response.json()
  }

  async deleteProduct(product_id: number): Promise<DeleteProductResponse> {
    const response = await fetch(`${API_URL}/products/${product_id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete product')
    }

    return await response.json()
  }
}

export const productService = new ProductService()
