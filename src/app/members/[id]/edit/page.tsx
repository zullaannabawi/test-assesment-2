'use client'

import { useParams } from 'next/navigation'
import { MemberFormPage } from '@/features/member-form/presentation/pages/member-form'

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>()
  return <MemberFormPage mode="edit" memberId={Number(id)} />
}
