import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiBadge from '../ui/UiBadge.vue'

describe('UiBadge', () => {
  it('renders slot content and applies variant class', () => {
    const wrapper = mount(UiBadge, { props: { variant: 'primary' }, slots: { default: 'Test Badge' } })
    expect(wrapper.text()).toContain('Test Badge')
    expect(wrapper.classes()).toContain('primary')
  })
})
