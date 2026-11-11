'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/shared/presentation/store/hooks'
import { dismissCreated, dismissUpdated } from '@/shared/presentation/store/slices/member-form.slice'
import { fetchMemberById } from '@/shared/presentation/store/actions/member-list.action'
import { confirmDeleteMembers } from '@/shared/presentation/store/actions/member-deletion.action'
import {
  cancelDeletion,
  requestDeletion,
  dismissDeletionResult,
} from '@/shared/presentation/store/slices/member-deletion.slice'
import type { Member } from '@/features/member-list/domain/member'
import { formatDate, formatMemberCode } from '@/shared/lib/formatters'
import { Button } from '../atoms/button'
import { Text } from '../atoms/text'
import { MemberForm } from '../organisms/member-form'
import { SuccessModal } from '../organisms/success-modal'
import { ConfirmDialog } from '../organisms/confirm-dialog'
import { ProfileCard } from '../molecules/profile-card'
import { CopyIdButton } from '../molecules/copy-id-button'

interface MemberFormTemplateProps {
  mode: 'create' | 'edit'
  /** Edit mode: the member id from the route. */
  memberId?: number
}

export function MemberFormTemplate({ mode, memberId }: MemberFormTemplateProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { created, updated } = useAppSelector((state) => state.memberForm)
  const { detail, detailStatus } = useAppSelector((state) => state.memberList)
  const { confirmingIds, lastResult } = useAppSelector((state) => state.memberDeletion)

  useEffect(() => {
    if (mode === 'edit' && memberId != null) {
      dispatch(fetchMemberById(memberId))
    }
  }, [dispatch, mode, memberId])

  const handleCancel = () => {
    router.push('/')
  }

  const handleCreatedPrimary = () => {
    dispatch(dismissCreated())
    router.push('/')
  }

  const handleUpdatedSecondary = () => {
    dispatch(dismissUpdated())
  }

  const handleUpdatedPrimary = () => {
    dispatch(dismissUpdated())
    router.push('/')
  }

  const handleDeleteConfirm = async () => {
    if (!confirmingIds) {
      return
    }
    const result = await dispatch(confirmDeleteMembers(confirmingIds))
    if (confirmDeleteMembers.fulfilled.match(result)) {
      router.push('/')
    }
  }

  if (mode === 'edit' && (detailStatus === 'idle' || detailStatus === 'loading')) {
    return (
      <main className="member-form-page">
        <Text size="sm">Loading member…</Text>
      </main>
    )
  }

  if (mode === 'edit' && (detailStatus === 'failed' || !detail)) {
    return (
      <main className="member-form-page">
        <div className="edit-error" role="alert">
          <Text as="h1" size="xl" weight="bold">
            Member not found
          </Text>
          <Text size="sm" className="edit-error__description">
            This member does not exist or has already been deleted.
          </Text>
          <Link className="btn btn--primary" href="/">
            Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  const editMember: Member | null = mode === 'edit' ? detail : null

  return (
    <main className="member-form-page">
      <header className="member-form-page__header">
        <Text as="h1" size="xl" weight="bold">
          {mode === 'create' ? 'Add New Member' : `Edit ${formatMemberCode(editMember!.id)}`}
        </Text>
        <Text size="sm" className="member-form-page__subtitle">
          {mode === 'create'
            ? 'Fill in the details below to add a new team member.'
            : 'Update the member details below.'}
        </Text>

        {editMember ? (
          <div className="edit-header">
            <div className="edit-header__meta">
              <Text weight="semibold">{formatMemberCode(editMember.id)}</Text>
              <Text size="sm">Joined {formatDate(editMember.joined_at)}</Text>
              <CopyIdButton id={editMember.id} />
            </div>
            <ProfileCard member={editMember} />
            <Button
              variant="danger"
              className="edit-header__delete"
              onClick={() => dispatch(requestDeletion([editMember.id]))}
            >
              Delete Member
            </Button>
          </div>
        ) : null}
      </header>

      <MemberForm mode={mode} member={editMember ?? undefined} onCancel={handleCancel} />

      <SuccessModal
        open={created !== null}
        title="Member Added Successfully"
        description={created ? `${created.full_name} (${formatMemberCode(created.id)})` : undefined}
        primaryLabel="Back to Dashboard"
        onPrimary={handleCreatedPrimary}
      />

      <SuccessModal
        open={updated !== null}
        title="Member Updated Successfully"
        description={updated ? `${updated.full_name} (${formatMemberCode(updated.id)})` : undefined}
        secondaryLabel="Continue Editing"
        onSecondary={handleUpdatedSecondary}
        primaryLabel="Back to Dashboard"
        onPrimary={handleUpdatedPrimary}
      />

      <ConfirmDialog
        open={confirmingIds !== null}
        title={
          confirmingIds && confirmingIds.length === 1
            ? 'Delete Member'
            : `Delete ${confirmingIds?.length ?? 0} Members`
        }
        description="This permanently removes the selected members and revokes their permissions, sessions, and tokens."
        onConfirm={handleDeleteConfirm}
        onCancel={() => dispatch(cancelDeletion())}
      />

      {/* after deleting from the edit page the user lands on '/', where the
          dashboard renders this same global result as its modal */}
      <SuccessModal
        open={lastResult !== null}
        title="Member Deleted Successfully"
        description={
          lastResult
            ? `${lastResult.deleted.length} ${lastResult.deleted.length === 1 ? 'member' : 'members'} deleted successfully. Their permissions, sessions, and tokens have been revoked.`
            : undefined
        }
        primaryLabel="Done"
        onPrimary={() => dispatch(dismissDeletionResult())}
      />
    </main>
  )
}
