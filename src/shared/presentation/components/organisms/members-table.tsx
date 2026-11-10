'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import type { Member } from '@/features/member-dashboard/domain/member'
import { formatDate, shortStatus } from '@/shared/lib/formatters'
import { Avatar } from '../atoms/avatar'
import { Badge } from '../atoms/badge'
import { Checkbox } from '../atoms/checkbox'

interface MembersTableProps {
  members: Member[]
  selectedIds?: number[]
  onToggleSelectMember?: (id: number) => void
  /** Header checkbox — toggles every displayed id. */
  onToggleSelectAll?: () => void
  /** Wired in the delete-flows step; until then the trash icon is inert. */
  onDeleteMember?: (member: Member) => void
}

export function MembersTable({
  members,
  selectedIds = [],
  onToggleSelectMember,
  onToggleSelectAll,
  onDeleteMember,
}: MembersTableProps) {
  const displayedIds = members.map((member) => member.id)
  const selectedCount = displayedIds.filter((id) => selectedIds.includes(id)).length
  const allSelected = displayedIds.length > 0 && selectedCount === displayedIds.length
  const someSelected = selectedCount > 0 && !allSelected

  return (
    <table className="members-table">
      <thead>
        <tr>
          <th scope="col" className="members-table__check">
            <Checkbox
              aria-label="Select all members"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={onToggleSelectAll}
            />
          </th>
          <th scope="col">Member</th>
          <th scope="col">Role / Title</th>
          <th scope="col">Department</th>
          <th scope="col">Status</th>
          <th scope="col">Joined Date</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.id} className="members-table__row">
            <td className="members-table__check">
              <Checkbox
                aria-label={`Select ${member.full_name}`}
                checked={selectedIds.includes(member.id)}
                onChange={() => onToggleSelectMember?.(member.id)}
              />
            </td>
            <td>
              <span className="members-table__member">
                <Avatar name={member.full_name} />
                <span className="members-table__member-detail">
                  <span className="members-table__name">{member.full_name}</span>
                  <span className="members-table__email">{member.email}</span>
                </span>
              </span>
            </td>
            <td>{member.job_title}</td>
            <td>
              <Badge tone="info">{member.department}</Badge>
            </td>
            <td>
              <Badge tone={member.account_status.startsWith('Active') ? 'success' : 'neutral'}>
                {shortStatus(member.account_status)}
              </Badge>
            </td>
            <td>{formatDate(member.joined_at)}</td>
            <td>
              <span className="members-table__actions">
                <Link className="members-table__edit" href={`/members/${member.id}/edit`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="members-table__delete"
                  aria-label={`Delete ${member.full_name}`}
                  onClick={() => onDeleteMember?.(member)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
