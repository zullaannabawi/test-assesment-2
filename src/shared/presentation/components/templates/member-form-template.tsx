'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Trash2 } from 'lucide-react'
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
import { formatMemberCode, formatMonthYear, shortStatus } from '@/shared/lib/formatters'
import { Button } from '../atoms/button'
import { Badge } from '../atoms/badge'
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
  const { confirming, lastResult } = useAppSelector((state) => state.memberDeletion)

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
    if (!confirming) {
      return
    }
    const result = await dispatch(confirmDeleteMembers(confirming.ids))
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
      {editMember ? (
        <header className="member-header">
          <div className="member-header__top">
            <div className="member-header__title">
              <Link className="member-header__back" href="/" aria-label="Back to dashboard">
                <ArrowLeft size={18} aria-hidden="true" />
              </Link>
              <Text as="h1" size="xl" weight="semibold">
                {editMember.full_name}
              </Text>
              <Badge tone={editMember.account_status.startsWith('Active') ? 'sky' : 'warning'}>
                <span className="badge__dot" aria-hidden="true" />
                {shortStatus(editMember.account_status)}
              </Badge>
            </div>
            <CopyIdButton id={editMember.id} />
          </div>
          <div className="member-header__meta">
            <span className="id-pill">ID: {formatMemberCode(editMember.id)}</span>
            <span className="member-header__sep" aria-hidden="true">
              •
            </span>
            <span className="member-header__joined">
              <Calendar size={14} aria-hidden="true" />
              Joined {formatMonthYear(editMember.joined_at)}
            </span>
          </div>
        </header>
      ) : (
        <header className="member-form-page__header">
          <Text as="h1" size="xl" weight="bold">
            Add New Member
          </Text>
          <Text size="sm" className="member-form-page__subtitle">
            Fill in the details below to add a new team member.
          </Text>
        </header>
      )}

      {editMember ? (
        <div className="edit-layout">
          <aside className="edit-layout__aside">
            <ProfileCard member={editMember} />
          </aside>
          <div className="edit-layout__main">
            <MemberForm
              mode={mode}
              member={editMember}
              onCancel={handleCancel}
              footerLeft={
                <Button
                  variant="secondary"
                  className="btn--danger-outline"
                  onClick={() =>
                    dispatch(
                      requestDeletion({ ids: [editMember.id], names: [editMember.full_name] }),
                    )
                  }
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Delete Member
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <MemberForm mode={mode} onCancel={handleCancel} />
      )}

      <SuccessModal
        open={created !== null}
        title="Member Added Successfully"
        description={
          created ? (
            <>
              The profile information for <strong>{created.full_name}</strong> (
              <span className="member-code">{formatMemberCode(created.id)}</span>) has been added
              and synchronized across all workspace services.
            </>
          ) : undefined
        }
        primaryLabel="Back to Dashboard"
        onPrimary={handleCreatedPrimary}
      />

      <SuccessModal
        open={updated !== null}
        title="Member Updated Successfully"
        description={
          updated ? (
            <>
              The profile information for <strong>{updated.full_name}</strong> (
              <span className="member-code">{formatMemberCode(updated.id)}</span>) has been updated
              and synchronized across all workspace services.
            </>
          ) : undefined
        }
        secondaryLabel="Continue Editing"
        onSecondary={handleUpdatedSecondary}
        primaryLabel="Back to Dashboard"
        onPrimary={handleUpdatedPrimary}
      />

      <ConfirmDialog
        open={confirming !== null}
        title={confirming && confirming.ids.length === 1 ? 'Delete Member' : `Delete ${confirming?.ids.length ?? 0} Members`}
        description="This permanently removes the selected members and revokes their permissions, sessions, and tokens."
        onConfirm={handleDeleteConfirm}
        onCancel={() => dispatch(cancelDeletion())}
      />

      {/* after deleting from the edit page the user lands on '/', where the
          dashboard renders this same global result as its modal */}
      <SuccessModal
        open={lastResult !== null}
        title={
          lastResult && lastResult.deleted.length === 1
            ? 'Member Deleted Successfully'
            : 'Members Deleted Successfully'
        }
        description={
          lastResult
            ? lastResult.deleted.length === 1
              ? `${lastResult.names[0] ?? 'The member'} (#MEM-${lastResult.deleted[0]}) has been permanently removed from the workspace. All assigned permissions, active sessions, and access tokens have been revoked.`
              : `${lastResult.deleted.length} members has been permanently removed from the workspace. All assigned permissions, active sessions, and access tokens have been revoked.`
            : undefined
        }
        primaryLabel="Dismiss"
        onPrimary={() => dispatch(dismissDeletionResult())}
      />
    </main>
  )
}
