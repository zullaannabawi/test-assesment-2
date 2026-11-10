import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../atoms/button'
import { Input } from '../atoms/input'
import { Select } from '../atoms/select'
import { Textarea } from '../atoms/textarea'
import { Checkbox } from '../atoms/checkbox'
import { Badge } from '../atoms/badge'
import { Avatar } from '../atoms/avatar'
import { Text } from '../atoms/text'
import { FormField } from '../molecules/form-field'

describe('SH-09: atoms & form-field', () => {
  it('SH-09: Button renders variants plus disabled and loading states', () => {
    render(
      <>
        <Button variant="primary">Save Changes</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="danger">Delete Member</Button>
        <Button variant="ghost" disabled>
          Back
        </Button>
        <Button loading>Saving</Button>
      </>,
    )

    expect(screen.getByRole('button', { name: 'Save Changes' })).toHaveClass('btn--primary')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('btn--secondary')
    expect(screen.getByRole('button', { name: 'Delete Member' })).toHaveClass('btn--danger')
    expect(screen.getByRole('button', { name: 'Back' })).toHaveClass('btn--ghost')
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()

    const loading = screen.getByRole('button', { name: 'Saving' })
    expect(loading).toBeDisabled()
    expect(loading).toHaveAttribute('aria-busy', 'true')
  })

  it('SH-09: FormField associates the label and Input, shows helper and error', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <FormField label="Full Name" htmlFor="full-name" required helper="Shown on their profile">
        <Input id="full-name" />
      </FormField>,
    )

    const input = screen.getByLabelText(/full name/i)
    expect(input).toHaveAttribute('id', 'full-name')
    expect(document.querySelector('label[for="full-name"]')).not.toBeNull()
    expect(screen.getByText('Shown on their profile')).toBeInTheDocument()

    await user.type(input, 'Sarah')
    expect(input).toHaveValue('Sarah')

    rerender(
      <FormField label="Full Name" htmlFor="full-name" required error="Name is required">
        <Input id="full-name" />
      </FormField>,
    )
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('SH-09: Select renders options and fires change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Select aria-label="Department" value="Engineering" onChange={onChange}>
        <option value="Engineering">Engineering</option>
        <option value="Design">Design</option>
      </Select>,
    )

    const select = screen.getByLabelText('Department')
    expect(select).toHaveValue('Engineering')
    await user.selectOptions(select, 'Design')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('SH-09: Textarea fires change while typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Textarea aria-label="Bio" onChange={onChange} />)

    await user.type(screen.getByLabelText('Bio'), 'Frontend lead')
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByLabelText('Bio')).toHaveValue('Frontend lead')
  })

  it('SH-09: Checkbox fires change and reflects the indeterminate state', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<Checkbox aria-label="Select Sarah" onChange={onChange} />)

    const box = screen.getByRole('checkbox', { name: 'Select Sarah' }) as HTMLInputElement
    expect(box.indeterminate).toBe(false)
    await user.click(box)
    expect(onChange).toHaveBeenCalledTimes(1)

    rerender(<Checkbox aria-label="Select Sarah" indeterminate />)
    expect(box.indeterminate).toBe(true)
  })

  it('SH-09: Badge renders with a tone class', () => {
    render(
      <>
        <Badge tone="success">Active</Badge>
        <Badge tone="info">Engineering</Badge>
      </>,
    )
    expect(screen.getByText('Active')).toHaveClass('badge--success')
    expect(screen.getByText('Engineering')).toHaveClass('badge--info')
  })

  it('SH-09: Avatar renders the derived initials', () => {
    render(<Avatar name="Sarah Jenkins" />)
    expect(screen.getByText('SJ')).toBeInTheDocument()
  })

  it('SH-09: Text renders as a heading with size and weight classes', () => {
    render(
      <Text as="h1" size="xl" weight="bold">
        Member Dashboard
      </Text>,
    )
    const heading = screen.getByRole('heading', { level: 1, name: 'Member Dashboard' })
    expect(heading).toHaveClass('text--xl', 'text--bold')
  })
})
