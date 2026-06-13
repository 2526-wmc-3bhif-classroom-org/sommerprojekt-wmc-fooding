import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock auth and inventory services before importing the component
vi.mock('@/services/auth', () => ({
  authService: {
    isAuthenticated: true,
    getToken: () => 'fake-token',
    user: { email: 'test@example.com' }
  }
}))

vi.mock('@/services/inventory', () => {
  const makeDateLocal = (daysFromNow: number) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    return d.toISOString().split('T')[0]
  }

  return {
    inventoryService: {
      getInventory: vi.fn().mockResolvedValueOnce([
        { inventory_id: 1, product_id: 1, quantity: 1, expiration_date: makeDateLocal(2) }, // expiring within 3 days
        { inventory_id: 2, product_id: 2, quantity: 1, expiration_date: makeDateLocal(10) }, // fresh
        { inventory_id: 3, product_id: 3, quantity: 1, expiration_date: makeDateLocal(15) } // fresh
      ])
    }
  }
})

import HeroSection from '../HeroSection.vue'
import { nextTick } from 'vue'

describe('HeroSection expiration logic', () => {
  it('calculates freshness percentage considering items expiring within 3 days', async () => {
    const wrapper = mount(HeroSection)
    // wait for onMounted and async calls
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))

    // We provided 3 items, 1 expiring soon -> fresh = 2/3 -> ~67%
    expect(wrapper.html()).toContain('% deiner Zutaten sind frisch')
    expect(wrapper.text()).toMatch(/\d+% deiner Zutaten sind frisch/)
    const match = wrapper.text().match(/(\d+)% deiner Zutaten sind frisch/)
    expect(match).toBeTruthy()
    const percent = Number(match![1])
    expect(percent).toBeGreaterThanOrEqual(66)
    expect(percent).toBeLessThanOrEqual(68)
  })
})
