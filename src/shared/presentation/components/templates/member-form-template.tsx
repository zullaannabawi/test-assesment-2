'use client'

import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/shared/presentation/store/hooks'
import { dismissCreated } from '@/shared/presentation/store/slices/member-form.slice'
import type { Member } from '@/features/member-dashboard/domain/member'
import { formatMemberCode } from '@/shared/lib/formatters'
import { Text } from '../atoms/text'
import { MemberForm } from '../organisms/member-form'
import { SuccessModal } from '../organisms/success-modal'

interface MemberFormTemplateProps {
  mode: 'create' | 'edit'
  /** Edit mode: the member loaded by route id. */
  member?: Member
  /** Edit-mode extras (header, profile card, delete) arrive with the edit-page step. */
  editHeader?: React.ReactNode
}

export function MemberFormTemplate({ mode, member, editHeader }: MemberFormTemplateProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { created } = useAppSelector((state) => state.memberForm)

  const handleCancel = () => {
    router.push('/')
  }

  const handleCreatedPrimary = () => {
    dispatch(dismissCreated())
    router.push('/')
  }

  return (
    <main className="member-form-page">
      <header className="member-form-page__header">
        <Text as="h1" size="xl" weight="bold">
          {mode === 'create' ? 'Add New Member' : `Edit ${member ? formatMemberCode(member.id) : 'Member'}`}
        </Text>
        <Text size="sm" className="member-form-page__subtitle">
          {mode === 'create'
            ? 'Fill in the details below to add a new team member.'
            : 'Update the member details below.'}
        </Text>
        {editHeader}
      </header>

      <MemberForm mode={mode} member={member} onCancel={handleCancel} />

      <SuccessModal
        open={created !== null}
        title="Member Added Successfully"
        description={created ? `${created.full_name} (${formatMemberCode(created.id)})` : undefined}
        primaryLabel="Back to Dashboard"
        onPrimary={handleCreatedPrimary}
      />
    </main>
  )
}
