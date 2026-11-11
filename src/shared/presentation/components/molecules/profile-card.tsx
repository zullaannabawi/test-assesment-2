import type { Member } from '@/features/member-list/domain/member'
import { formatNumber } from '@/shared/lib/formatters'
import { Avatar } from '../atoms/avatar'
import { Text } from '../atoms/text'

/** Edit-page sidebar card: large avatar, identity, repositories/deployments strip. */
export function ProfileCard({ member }: { member: Member }) {
  return (
    <section className="profile-card" aria-label="Profile">
      <Avatar name={member.full_name} className="profile-card__avatar" />
      <Text weight="semibold" className="profile-card__name">
        {member.full_name}
      </Text>
      <Text size="sm" className="profile-card__job">
        {member.job_title}
      </Text>
      <Text size="sm" className="profile-card__email">
        {member.email}
      </Text>
      <dl className="profile-card__stats">
        <div className="profile-card__stat">
          <dt className="profile-card__stat-label">Repositories</dt>
          <dd className="profile-card__stat-value">{formatNumber(member.activity.repositories)}</dd>
        </div>
        <div className="profile-card__stat">
          <dt className="profile-card__stat-label">Deployments</dt>
          <dd className="profile-card__stat-value">{formatNumber(member.activity.deployments)}</dd>
        </div>
      </dl>
    </section>
  )
}
