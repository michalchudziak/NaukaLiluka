export type ContentType = 'words' | 'sentences';
export type BookSession = 'session1' | 'session2' | 'session3';
export type MathSession =
  | 'subitizingOrdered'
  | 'subitizingUnordered'
  | 'numbersOrdered'
  | 'numbersUnordered';
export type EquationSession = 'subitizing1' | 'subitizing2' | 'equations1' | 'equations2';

export type PresentationCompletion =
  | {
      kind: 'book';
      session: BookSession;
      contentType: ContentType;
      bookIndex: number;
      tripleIndex: number;
    }
  | { kind: 'math'; session: MathSession }
  | { kind: 'equation'; session: EquationSession }
  | { kind: 'noRep'; contentType: ContentType };

export function serializeCompletion(completion: PresentationCompletion): string {
  return JSON.stringify(completion);
}

export function parseCompletion(value?: string): PresentationCompletion | null {
  if (!value) return null;
  try {
    const data = JSON.parse(value);
    if (!data || typeof data !== 'object') return null;
    const isContentType = data.contentType === 'words' || data.contentType === 'sentences';
    if (data.kind === 'noRep' && isContentType) return data;
    if (
      data.kind === 'book' &&
      isContentType &&
      ['session1', 'session2', 'session3'].includes(data.session) &&
      Number.isInteger(data.bookIndex) &&
      data.bookIndex >= 0 &&
      Number.isInteger(data.tripleIndex) &&
      data.tripleIndex >= 0
    )
      return data;
    if (
      data.kind === 'math' &&
      ['subitizingOrdered', 'subitizingUnordered', 'numbersOrdered', 'numbersUnordered'].includes(
        data.session
      )
    )
      return data;
    if (
      data.kind === 'equation' &&
      ['subitizing1', 'subitizing2', 'equations1', 'equations2'].includes(data.session)
    )
      return data;
  } catch {
    return null;
  }
  return null;
}
