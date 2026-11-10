'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import type { Member } from '@/features/member-dashboard/domain/member'
import { formatDate, shortStatus } from '@/shared/lib/formatters'
import { Avatar } from '../atoms/avatar'
import { Badge } from '../atoms/badge'

interface MembersTableProps {
  members: Member[]
  /** Wired in the delete-flows step; until then the trash icon is inert. */
  onDeleteMember?: (member: Member) => void
}

export function MembersTable({ members, onDeleteMember }: MembersTableProps) {
  return (
    <table className="members-table">
      <thead>
        <tr>
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
