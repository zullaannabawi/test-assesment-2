'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/presentation/store/hooks'
import {
  fetchMembers,
  fetchMemberStats,
} from '@/shared/presentation/store/actions/member-dashboard.action'
import {
  toggleSelectedMember,
  toggleSelectAllMembers,
} from '@/shared/presentation/store/slices/member-dashboard.slice'
import { useDebouncedValue } from '@/shared/presentation/hooks/use-debounced-value'
import { downloadCsv, toCsv, type MemberCsvRow } from '@/shared/lib/csv'
import { Button } from '../atoms/button'
import { Text } from '../atoms/text'
import { SearchBar } from '../molecules/search-bar'
import { StatCardsRow } from '../organisms/stat-cards-row'
import { MembersTable } from '../organisms/members-table'
import { EmptyState } from '../organisms/empty-state'
import { BulkActionBar } from '../organisms/bulk-action-bar'

export function DashboardTemplate() {
  const dispatch = useAppDispatch()
  const { members, listStatus, stats, selectedIds } = useAppSelector(
    (state) => state.memberDashboard,
  )
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
    downloadCsv('members.csv', toCsv(rows))
  }

  const showEmptyState = listStatus === 'succeeded' && members.length === 0

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <Text as="h1" size="xl" weight="bold">
            Member Dashboard
          </Text>
          <Text size="sm" className="dashboard__subtitle">
            Manage your organization team members, roles, and workspace access.
          </Text>
        </div>
        <div className="dashboard__actions">
          <Button variant="secondary" onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Link className="btn btn--primary" href="/members/new">
            <Plus size={16} aria-hidden="true" />
            Add Member
          </Link>
        </div>
      </header>

      <StatCardsRow stats={stats} />
      <SearchBar value={search} onChange={setSearch} onClear={handleClearSearch} />

      {showEmptyState ? (
        <EmptyState actionLabel="Clear search" onAction={handleClearSearch} />
      ) : (
        <>
          <BulkActionBar count={selectedIds.length} />
          <MembersTable
            members={members}
            selectedIds={selectedIds}
            onToggleSelectMember={(id) => dispatch(toggleSelectedMember(id))}
            onToggleSelectAll={() =>
              dispatch(toggleSelectAllMembers(members.map((member) => member.id)))
            }
          />
        </>
      )}
    </main>
  )
}
