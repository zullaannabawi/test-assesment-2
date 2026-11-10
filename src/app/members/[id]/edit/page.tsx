'use client'

import { useParams } from 'next/navigation'
import { MemberFormTemplate } from '@/shared/presentation/components/templates/member-form-template'

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>()
  return <MemberFormTemplate mode="edit" memberId={Number(id)} />
}
