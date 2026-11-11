import type { MemberInput } from '@/features/member-list/domain/member'
import { validateMemberInput } from '@/features/member-form/domain/validate-member-input'

export type MemberPayloadResult =
  | { ok: true; value: MemberInput }
  | { ok: false; fields: Record<string, string> }

/** Parses a POST/PUT body and validates it with the shared form rules (422 source). */
export async function parseMemberPayload(request: Request): Promise<MemberPayloadResult> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return { ok: false, fields: { body: 'Request body must be valid JSON' } }
  }

  const input = (body ?? {}) as Partial<MemberInput>
  const result = validateMemberInput(input)
  return result.valid ? { ok: true, value: result.value } : { ok: false, fields: result.fields }
}
