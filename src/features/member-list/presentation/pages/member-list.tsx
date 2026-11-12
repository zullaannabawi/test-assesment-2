'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/presentation/store/hooks'
import {
  fetchMembers,
  fetchMemberStats,
} from '@/shared/presentation/store/actions/member-list.action'
import {
  toggleSelectedMember,
  toggleSelectAllMembers,
} from '@/shared/presentation/store/slices/member-list.slice'
import { dismissDeletionResult } from '@/shared/presentation/store/slices/member-deletion.slice'
import { confirmDeleteMembers } from '@/shared/presentation/store/actions/member-deletion.action'
import { useDebouncedValue } from '@/shared/presentation/hooks/use-debounced-value'
import {
  downloadCsv,
  EXCEL_CSV_SEPARATOR,
  toCsv,
  type MemberCsvRow,
} from '@/shared/lib/csv'
import { Button } from '@/shared/presentation/components/atoms/button'
import { Text } from '@/shared/presentation/components/atoms/text'
import { SearchBar } from '@/shared/presentation/components/molecules/search-bar'
import { StatCardsRow } from '@/shared/presentation/components/organisms/stat-cards-row'
import { MembersTable } from '@/shared/presentation/components/organisms/members-table'
import { EmptyState } from '@/shared/presentation/components/organisms/empty-state'
import { SuccessModal } from '@/shared/presentation/components/organisms/success-modal'

/** The Members Directory page: KPI cards, search, table, selection, delete flows. */
export function MemberListPage() {
  const dispatch = useAppDispatch()
  const { members, listStatus, stats, selectedIds } = useAppSelector(
    (state) => state.memberList,
  )
  const { lastResult } = useAppSelector((state) => state.memberDeletion)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    dispatch(fetchMembers())
    dispatch(fetchMemberStats())
  }, [dispatch])

  useEffect(() => {
    if (debouncedSearch) {
      dispatch(fetchMembers({ search: debouncedSearch }))
    }
  }, [dispatch, debouncedSearch])

  /** Clear is immediate — no debounce — and refetches the full list. */
  const handleClearSearch = () => {
    setSearch('')
    dispatch(fetchMembers())
  }

  /** Exports exactly the rows on screen (the filtered list), client-side. */
  const handleExportCsv = () => {
    const rows: MemberCsvRow[] = members.map(
      ({ full_name, email, job_title, department, account_status, joined_at }) => ({
        full_name,
        email,
        job_title,
        department,
        account_status,
        joined_at,
      }),
    )
    downloadCsv('members.csv', toCsv(rows, EXCEL_CSV_SEPARATOR))
  }

  const showEmptyState = listStatus === 'succeeded' && members.length === 0

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <Text as="h1" size="xl" weight="semibold">
            Members Directory
          </Text>
          <Text size="sm" className="dashboard__subtitle">
            Manage your organization team members, cross-functional roles, and workspace access
            levels.
          </Text>
        </div>
        <div className="dashboard__actions">
          <Button variant="secondary" onClick={handleExportCsv}>
            <Download size={16} aria-hidden="true" />
            Export CSV
          </Button>
          <Link className="btn btn--primary" href="/members/new">
            <Plus size={16} aria-hidden="true" />
            Add Member
          </Link>
        </div>
      </header>

      <StatCardsRow stats={stats} />

      <div className="table-card">
        <SearchBar value={search} onChange={setSearch} onClear={handleClearSearch} />
        {showEmptyState ? (
          <EmptyState
            description={`We couldn't find any members matching “${search}”. Try checking for typos or searching with different keywords.`}
            actionLabel="Clear search"
            onAction={handleClearSearch}
          />
        ) : (
          <MembersTable
            members={members}
            selectedIds={selectedIds}
            onToggleSelectMember={(id) => dispatch(toggleSelectedMember(id))}
            onToggleSelectAll={() =>
              dispatch(toggleSelectAllMembers(members.map((member) => member.id)))
            }
            onDeleteMember={(member) => {
              // direct action delete: the row trash acts on the whole selection,
              // or on its single row when nothing is checked (no confirm dialog)
              const ids = selectedIds.length > 0 ? selectedIds : [member.id]
              const names = members
                .filter((row) => ids.includes(row.id))
                .map((row) => row.full_name)
              dispatch(confirmDeleteMembers({ ids, names }))
            }}
          />
        )}
      </div>

      <SuccessModal
        open={lastResult !== null}
        tone="danger"
        title={
          lastResult && lastResult.deleted.length === 1
            ? 'Member Deleted Successfully'
            : 'Members Deleted Successfully'
        }
        description={
          lastResult
            ? lastResult.deleted.length === 1
              ? (
              <span className="modal__description-dark">
                {lastResult.names[0] ?? 'The member'} (#MEM-
                {lastResult.deleted[0]}) has been permanently removed from the workspace. All
                assigned permissions, active sessions, and access tokens have been revoked.
              </span>
            )
              : `${lastResult.deleted.length} members has been permanently removed from the workspace. All assigned permissions, active sessions, and access tokens have been revoked.`
            : undefined
        }
        primaryLabel="Dismiss"
        onPrimary={() => dispatch(dismissDeletionResult())}
      />
    </main>
  )
}
