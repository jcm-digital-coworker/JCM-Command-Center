import type { DynamicTraveler } from '../../types/dynamicTraveler';
import type {
  ClassificationReviewAnswer,
  ClassificationReviewConfirmation,
  ClassificationReviewDraft,
  ClassificationReviewQuestion,
} from '../../types/classificationReview';

type Props = {
  traveler: DynamicTraveler;
  confirmations: ClassificationReviewConfirmation[];
  draft: ClassificationReviewDraft;
  theme: 'dark' | 'light';
  onDraftChange: (draft: ClassificationReviewDraft) => void;
  onSave: () => void;
};

const questionOptions: Array<{ value: ClassificationReviewQuestion; label: string }> = [
  { value: 'NOT_ENOUGH_INFO', label: 'Needs floor confirmation' },
  { value: 'ROUTE_CONFIRMED', label: 'Route confirmed' },
  { value: 'OUTLET_THRESHOLD_CONFIRMED', label: 'Outlet threshold confirmed' },
  { value: 'COATING_LANE_CONFIRMED', label: 'Coating lane confirmed' },
  { value: 'FUSION_EPOXY_CONFIRMED', label: 'Fusion epoxy source confirmed' },
  { value: 'PASSIVATION_CONFIRMED', label: 'Passivation path confirmed' },
  { value: 'STRAP_TIMING_CONFIRMED', label: 'Strap timing confirmed' },
];

const answerOptions: Array<{ value: ClassificationReviewAnswer; label: string }> = [
  { value: 'NEEDS_REVIEW', label: 'Needs review' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'NOT_CONFIRMED', label: 'Not confirmed' },
  { value: 'NOT_APPLICABLE', label: 'Not applicable' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

const reviewerOptions: ClassificationReviewDraft['reviewedBy'][] = [
  'Floor Review',
  'Lead Review',
  'Engineering Review',
  'QA Review',
  'Unknown',
];

export default function ClassificationReviewCapture({ traveler, confirmations, draft, theme, onDraftChange, onSave }: Props) {
  const textColor = theme === 'dark' ? '#e2e8f0' : '#0f172a';
  const shellBackground = theme === 'dark' ? 'rgba(15,23,42,0.88)' : '#ffffff';
  const borderColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const inputBackground = theme === 'dark' ? '#0f172a' : '#f8fafc';

  return (
    <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: shellBackground, border: `1px solid ${borderColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#f97316', fontSize: 10, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>Structured Confirmation Capture</div>
          <strong style={{ color: textColor, fontSize: 13 }}>#{traveler.order.orderNumber} · {formatToken(traveler.productClassification.productFamily)}</strong>
        </div>
        <span style={pill('#38bdf8')}>{confirmations.length} SAVED</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginTop: 10 }}>
        <Field label="Question" theme={theme}>
          <select style={selectStyle(theme, inputBackground, textColor, borderColor)} value={draft.question} onChange={(event) => onDraftChange({ ...draft, question: event.target.value as ClassificationReviewQuestion })}>
            {questionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </Field>

        <Field label="Answer" theme={theme}>
          <select style={selectStyle(theme, inputBackground, textColor, borderColor)} value={draft.answer} onChange={(event) => onDraftChange({ ...draft, answer: event.target.value as ClassificationReviewAnswer })}>
            {answerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </Field>

        <Field label="Reviewed By" theme={theme}>
          <select style={selectStyle(theme, inputBackground, textColor, borderColor)} value={draft.reviewedBy} onChange={(event) => onDraftChange({ ...draft, reviewedBy: event.target.value as ClassificationReviewDraft['reviewedBy'] })}>
            {reviewerOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Optional note" theme={theme}>
        <input
          style={{ width: '100%', boxSizing: 'border-box', borderRadius: 4, border: `1px solid ${borderColor}`, background: inputBackground, color: textColor, padding: '8px 9px', fontWeight: 700 }}
          value={draft.note ?? ''}
          onChange={(event) => onDraftChange({ ...draft, note: event.target.value })}
          placeholder="Short context only. Selections remain the source of truth."
        />
      </Field>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
        <button type="button" style={{ border: '1px solid #10b981', background: 'rgba(16,185,129,0.16)', color: '#10b981', borderRadius: 4, padding: '8px 10px', fontSize: 11, fontWeight: 900, cursor: 'pointer' }} onClick={onSave}>
          SAVE CONFIRMATION
        </button>
        <span style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 700 }}>
          Saved locally for review tracking. Classifier rules are not changed automatically.
        </span>
      </div>

      {confirmations.length > 0 ? (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${borderColor}` }}>
          <div style={fieldLabelStyle}>Recent confirmations</div>
          {confirmations.slice(0, 3).map((confirmation) => (
            <div key={confirmation.id} style={{ display: 'grid', gap: 2, marginTop: 6, color: theme === 'dark' ? '#cbd5e1' : '#334155', fontSize: 11, fontWeight: 700 }}>
              <strong>{formatToken(confirmation.question)}: {formatToken(confirmation.answer)}</strong>
              <span>{confirmation.reviewedBy} · {new Date(confirmation.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, theme, children }: { label: string; theme: 'dark' | 'light'; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 4, marginTop: 8, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

function selectStyle(_theme: 'dark' | 'light', background: string, color: string, borderColor: string) {
  return {
    width: '100%',
    borderRadius: 4,
    border: `1px solid ${borderColor}`,
    background,
    color,
    padding: '8px 9px',
    fontWeight: 800,
  } as const;
}

function pill(color: string) {
  return {
    whiteSpace: 'nowrap',
    color,
    border: `1px solid ${color}`,
    background: `${color}1f`,
    borderRadius: 4,
    padding: '5px 7px',
    fontSize: 10,
    fontWeight: 900,
  } as const;
}

function formatToken(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const fieldLabelStyle = {
  color: '#94a3b8',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
} as const;
