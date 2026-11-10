/**
 * Typed member errors. Repositories translate transport-level failures into
 * these so use cases and the UI never inspect HTTP details.
 */

export class MemberNotFoundError extends Error {
  constructor(message = 'Member not found') {
    super(message)
    this.name = 'MemberNotFoundError'
  }
}

export class MemberEmailConflictError extends Error {
  constructor(message = 'Email is already in use by another member') {
    super(message)
    this.name = 'MemberEmailConflictError'
  }
}

export class MemberValidationFieldsError extends Error {
  /** Field name → human-readable problem, from the API `error.fields` object. */
  readonly fields: Record<string, string>

  constructor(fields: Record<string, string>, message = 'Member data is invalid') {
    super(message)
    this.name = 'MemberValidationFieldsError'
    this.fields = fields
  }
}

export class EmptyDeletionSelectionError extends Error {
  constructor(message = 'No members selected for deletion') {
    super(message)
    this.name = 'EmptyDeletionSelectionError'
  }
}

export class ApiUnexpectedError extends Error {
  constructor(message = 'Unexpected API error') {
    super(message)
    this.name = 'ApiUnexpectedError'
  }
}
