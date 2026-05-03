import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { DynamicTraveler } from '../../types/dynamicTraveler';
import type { WorkCenter } from '../../types/plant';
import { productionOrders } from '../../data/productionOrders';
import { generateDynamicTravelers } from '../../logic/dynamicTraveler';
import {
  getConfirmationsForTraveler,
  loadClassificationReviewConfirmations,
} from '../../logic/classificationReviewConfirmations';
import type { DashboardTheme } from './dashboardStyles';

type ClassificationReviewQueueProps = {
  theme: DashboardTheme;
  workCenters: WorkCenter[];
  onOpenWorkCenter: (workCenter: WorkCenter) => void;
};

export default function ClassificationReviewQueue({ theme, workCenters, onOpenWorkCenter }: ClassificationReviewQueueProps) {
  const [confirmationsVersion, setConfirmationsVersion] = useState(0);
  const confirmations = useMemo(() => loadClassificationReviewConfirmations(), [confirmationsVersion]);
  const travelers = useMemo(() => generateDynamicTravelers(productionOrders, 'All'), []);
  const reviewTravelers = useMemo(
    () => travelers.filter((traveler) => needsClassificationReview(traveler)),
    [travelers],
  );
  const unresolvedCount = reviewTravelers.filter((traveler) => getConfirmationsForTraveler(confirmations, traveler).length === 0).length;
  const savedCount = reviewTravelers.length - unresolvedCount;

  useEffect(() => {
    const refresh = () => setConfirmationsVersion((version) => version + 1);
    window.addEventListener('storage', refresh);
    window.addEventListener('jcm-classification-review-confirmations-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('jcm-classification-review-confirmations-updated', refresh);
    };
  }, []);

  function openTravelerWorkCenter(traveler: DynamicTraveler) {
    const matchingWorkCenter = workCenters.find((workCenter) => workCenter.department === traveler.department);
    if (matchingWorkCenter) onOpenWorkCenter(matchingWorkCenter);
  }

  if (reviewTravelers.length === 0) {
    return (
      <section style={queueShellStyle(theme, false)}>
        <div style={queueHeaderStyle}>
          <div>
            <div style={eyebrowStyle('#10b981')}>CLASSIFICATION REVIEW QUEUE</div>
            <h3 style={titleStyle(theme)}>No plant-wide classification review warnings.</h3>
            <p style={subtitleStyle(theme)}>Dynamic Travelers currently have no low-confidence route/product review signals.</p>
          </div>
          <span style={badgeStyle('#10b981')}>CLEAR</span>
        </div>
      </section>
    );
  }

  return (
    <section style={queueShellStyle(theme, true)}>
      <div style={queueHeaderStyle}>
        <div>
          <div style={eyebrowStyle('#f97316')}>CLASSIFICATION REVIEW QUEUE</div>
          <h3 style={titleStyle(theme)}>Plant-wide route/product confirmations needed.</h3>
          <p style={subtitleStyle(theme)}>Visibility only. This queue does not approve routes, mutate classifier rules, raise confidence, or dispatch work.</p>
        </div>
        <div style={summaryBadgeColumnStyle}>
          <span style={badgeStyle('#f97316')}>{reviewTravelers.length} REVIEW</span>
          <span style={badgeStyle('#ef4444')}>{unresolvedCount} UNSAVED</span>
          <span style={badgeStyle('#10b981')}>{savedCount} CAPTURED</span>
        </div>
      </div>

      <div style={queueListStyle}>
        {reviewTravelers.slice(0, 6).map((traveler) => {
          const travelerConfirmations = getConfirmationsForTraveler(confirmations, traveler);
          const firstReason = traveler.classificationReviewReasons[0] ?? 'Classification needs human review.';
          const canDrillIn = workCenters.some((workCenter) => workCenter.department === traveler.department);
          return (
            <article key={traveler.id} style={queueItemStyle(theme, travelerConfirmations.length > 0)}>
              <div style={queueItemTopStyle}>
                <div>
                  <strong style={itemTitleStyle(theme)}>#{traveler.order.orderNumber} · {traveler.productClassification.modelSignal ?? 'No model signal'}</strong>
                  <div style={itemMetaStyle(theme)}>{traveler.department} · {formatToken(traveler.productClassification.productFamily)} · {formatHintList(traveler.finishHints)}</div>
                </div>
                <div style={itemBadgeRowStyle}>
                  <span style={badgeStyle(getConfidenceColor(traveler.productClassification.confidence))}>{formatToken(traveler.productClassification.confidence)}</span>
                  <span style={badgeStyle(traveler.qaRequired ? '#f97316' : '#64748b')}>{traveler.qaRequired ? 'QA REQUIRED' : 'QA NOT REQUIRED'}</span>
                </div>
              </div>

              <div style={reasonStyle(theme)}>{firstReason}</div>

              <div style={routeStyle(theme)}>
                Suggested route: {traveler.productClassification.routeHint.length > 0 ? traveler.productClassification.routeHint.join(' → ') : 'No route hint'}
              </div>

              <div style={queueFooterStyle}>
                <span style={smallTextStyle(theme)}>Current: {traveler.currentInstruction}</span>
                <div style={footerActionRowStyle}>
                  <span style={badgeStyle(travelerConfirmations.length > 0 ? '#10b981' : '#64748b')}>
                    {travelerConfirmations.length} CONFIRMATION{travelerConfirmations.length === 1 ? '' : 'S'}
                  </span>
                  <button
                    type="button"
                    style={drillInButtonStyle(theme, canDrillIn)}
                    disabled={!canDrillIn}
                    onClick={() => openTravelerWorkCenter(traveler)}
                  >
                    OPEN REVIEW CAPTURE
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function needsClassificationReview(traveler: DynamicTraveler): boolean {
  return traveler.classificationReviewReasons.length > 0 || traveler.productClassification.needsHumanReview || traveler.productClassification.confidence === 'LOW' || traveler.productClassification.confidence === 'REVIEW';
}

function getConfidenceColor(confidence: DynamicTraveler['productClassification']['confidence']): string {
  if (confidence === 'HIGH') return '#10b981';
  if (confidence === 'MEDIUM') return '#38bdf8';
  if (confidence === 'LOW') return '#f97316';
  return '#ef4444';
}

function formatToken(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatHintList(values: string[]) {
  if (values.length === 0) return 'No finish hint';
  return values.map(formatToken).join(', ');
}

const queueHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 14,
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};

const summaryBadgeColumnStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  justifyContent: 'flex-end',
};

const queueListStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
  marginTop: 12,
};

const queueItemTopStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};

const itemBadgeRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  justifyContent: 'flex-end',
};

const queueFooterStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 9,
};

const footerActionRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  justifyContent: 'flex-end',
  alignItems: 'center',
};

function queueShellStyle(theme: DashboardTheme, needsReview: boolean): CSSProperties {
  const color = needsReview ? '#f97316' : '#10b981';
  return {
    padding: 14,
    borderRadius: 8,
    background: theme === 'dark' ? '#111827' : '#ffffff',
    border: `1px solid ${color}66`,
    borderLeft: `5px solid ${color}`,
    marginBottom: 16,
  };
}

function queueItemStyle(theme: DashboardTheme, captured: boolean): CSSProperties {
  const color = captured ? '#10b981' : '#f97316';
  return {
    padding: 12,
    borderRadius: 7,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: `1px solid ${color}55`,
  };
}

function eyebrowStyle(color: string): CSSProperties {
  return {
    color,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  };
}

function titleStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    margin: '3px 0',
    fontSize: 16,
  };
}

function subtitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.4,
  };
}

function itemTitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    fontSize: 13,
  };
}

function itemMetaStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 11,
    fontWeight: 800,
    marginTop: 4,
  };
}

function reasonStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#fed7aa' : '#9a3412',
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.4,
    marginTop: 8,
  };
}

function routeStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    fontSize: 11,
    fontWeight: 800,
    marginTop: 6,
  };
}

function smallTextStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.35,
  };
}

function drillInButtonStyle(theme: DashboardTheme, enabled: boolean): CSSProperties {
  return {
    border: enabled ? '1px solid #38bdf8' : '1px solid #64748b',
    background: enabled ? 'rgba(56,189,248,0.16)' : 'rgba(100,116,139,0.12)',
    color: enabled ? '#38bdf8' : theme === 'dark' ? '#64748b' : '#94a3b8',
    borderRadius: 4,
    padding: '5px 7px',
    fontSize: 10,
    fontWeight: 900,
    cursor: enabled ? 'pointer' : 'not-allowed',
  };
}

function badgeStyle(color: string): CSSProperties {
  return {
    whiteSpace: 'nowrap',
    color,
    border: `1px solid ${color}`,
    background: `${color}1f`,
    borderRadius: 4,
    padding: '5px 7px',
    fontSize: 10,
    fontWeight: 900,
  };
}
