import { useState, useMemo } from 'react';
import {
  OBJECT_FIELDS,
  SmartFieldObject,
  SmartFieldDefinition,
} from './mockData';

export interface SmartFieldMapping {
  object: SmartFieldObject;
  field: SmartFieldDefinition;
}

interface Props {
  value: SmartFieldMapping | null;
  onChange: (mapping: SmartFieldMapping) => void;
}

const TABS: { key: SmartFieldObject; label: string; icon: string; description: string }[] = [
  { key: 'general',   label: 'General',   icon: 'hub',         description: 'Job, technician, and cross-object fields' },
  { key: 'customer',  label: 'Customer',  icon: 'person',      description: 'Fields from the Customer record' },
  { key: 'location',  label: 'Location',  icon: 'location_on', description: 'Fields from the Location record' },
  { key: 'equipment', label: 'Equipment', icon: 'build',       description: 'Fields from the Equipment record' },
];

const DATA_TYPE_ICONS: Record<string, string> = {
  text:     'text_fields',
  number:   'tag',
  date:     'calendar_today',
  boolean:  'toggle_on',
  dropdown: 'arrow_drop_down_circle',
  phone:    'phone',
  email:    'email',
};

const KIND_CONFIG = {
  system: {
    label: 'System',
    icon: 'verified',
    bg: '#EFF6FF',
    color: '#1D4ED8',
    border: '#BFDBFE',
    iconColor: '#2563EB',
  },
  custom: {
    label: 'Custom',
    icon: 'tune',
    bg: '#F5F3FF',
    color: '#6D28D9',
    border: '#DDD6FE',
    iconColor: '#7C3AED',
  },
};

export function SmartFieldPicker({ value, onChange }: Props) {
  const [selectedTab, setSelectedTab] = useState<SmartFieldObject>(
    value?.object ?? 'general'
  );
  const [search, setSearch] = useState('');

  const allFields = OBJECT_FIELDS[selectedTab];
  const isGeneral = selectedTab === 'general';

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allFields;
    return allFields.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.dataType.toLowerCase().includes(q) ||
        f.kind.toLowerCase().includes(q) ||
        (f.description?.toLowerCase().includes(q) ?? false)
    );
  }, [allFields, search]);

  const systemFields = filtered.filter((f) => f.kind === 'system');
  const customFields  = filtered.filter((f) => f.kind === 'custom');

  function handleTabChange(tab: SmartFieldObject) {
    setSelectedTab(tab);
    setSearch('');
  }

  const currentTabMeta = TABS.find((t) => t.key === selectedTab)!;

  return (
    <div style={s.wrapper}>
      {/* Tab row */}
      <div style={s.tabRow}>
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <button
              key={tab.key}
              style={{ ...s.tab, ...(isActive ? s.tabActive : {}) }}
              onClick={() => handleTabChange(tab.key)}
              title={tab.description}
            >
              <span
                className="material-symbols-rounded"
                style={{ ...s.tabIcon, color: isActive ? '#0D9F6E' : '#9CA3AF' }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-header: description + legend */}
      <div style={s.subHeader}>
        <span style={s.tabDesc}>{currentTabMeta.description}</span>
        <div style={s.legend}>
          {(['system', 'custom'] as const)
            .filter((k) => !(isGeneral && k === 'custom'))
            .map((k) => {
              const cfg = KIND_CONFIG[k];
              return (
                <span
                  key={k}
                  style={{
                    ...s.legendItem,
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.color,
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 12, color: cfg.iconColor }}>
                    {cfg.icon}
                  </span>
                  {cfg.label}
                </span>
              );
            })}
        </div>
      </div>

      {/* Search */}
      <div style={s.searchRow}>
        <span className="material-symbols-rounded" style={s.searchIcon}>search</span>
        <input
          style={s.searchInput}
          placeholder={`Search ${currentTabMeta.label} fields...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        {search && (
          <button style={s.clearBtn} onClick={() => setSearch('')}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
          </button>
        )}
      </div>

      {/* Field list */}
      <div style={s.list}>
        {filtered.length === 0 && (
          <div style={s.empty}>No fields match "{search}"</div>
        )}

        {systemFields.length > 0 && (
          <FieldGroup
            label={`System Fields (${systemFields.length})`}
            kind="system"
            fields={systemFields}
            selectedId={value?.field.id}
            onSelect={(field) => onChange({ object: selectedTab, field })}
          />
        )}

        {!isGeneral && customFields.length > 0 && (
          <FieldGroup
            label={`Custom Fields (${customFields.length})`}
            kind="custom"
            fields={customFields}
            selectedId={value?.field.id}
            onSelect={(field) => onChange({ object: selectedTab, field })}
          />
        )}
      </div>

      {/* Selection confirmation bar */}
      {value && (
        <div style={s.selectionBar}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#0D9F6E' }}>check_circle</span>
          <span style={s.selectionText}>
            Mapped to{' '}
            <strong>{TABS.find((t) => t.key === value.object)?.label}</strong>
            {' → '}
            <strong>{value.field.label}</strong>
          </span>
          <KindBadge kind={value.field.kind} />
        </div>
      )}
    </div>
  );
}

/* ── Field group ──────────────────────────────────────────── */

function FieldGroup({
  label,
  kind,
  fields,
  selectedId,
  onSelect,
}: {
  label: string;
  kind: 'system' | 'custom';
  fields: SmartFieldDefinition[];
  selectedId?: string;
  onSelect: (f: SmartFieldDefinition) => void;
}) {
  const cfg = KIND_CONFIG[kind];
  return (
    <div style={g.section}>
      <div style={{ ...g.groupHeader, borderLeft: `3px solid ${cfg.border}` }}>
        <span className="material-symbols-rounded" style={{ fontSize: 14, color: cfg.iconColor }}>{cfg.icon}</span>
        <span style={{ ...g.groupLabel, color: cfg.color }}>{label}</span>
      </div>
      {fields.map((field) => {
        const isSelected = field.id === selectedId;
        return (
          <button
            key={field.id}
            style={{ ...g.row, ...(isSelected ? g.rowSelected : {}) }}
            onClick={() => onSelect(field)}
          >
            <span
              className="material-symbols-rounded"
              style={{ ...g.typeIcon, color: isSelected ? '#0D9F6E' : '#9CA3AF' }}
            >
              {DATA_TYPE_ICONS[field.dataType] ?? 'text_fields'}
            </span>
            <div style={g.labelBlock}>
              <span style={g.fieldLabel}>{field.label}</span>
              {field.description && (
                <span style={g.fieldDesc}>{field.description}</span>
              )}
            </div>
            <KindBadge kind={field.kind} />
            {isSelected && (
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#0D9F6E', marginLeft: 4 }}>
                check
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Kind badge ───────────────────────────────────────────── */

function KindBadge({ kind }: { kind: 'system' | 'custom' }) {
  const cfg = KIND_CONFIG[kind];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      padding: '2px 7px 2px 5px',
      borderRadius: 10,
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      flexShrink: 0,
    }}>
      <span className="material-symbols-rounded" style={{ fontSize: 11, color: cfg.iconColor }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

/* ── Styles ───────────────────────────────────────────────── */

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#fff',
    marginTop: 8,
  },
  tabRow: {
    display: 'flex',
    borderBottom: '1px solid #E5E7EB',
    background: '#F9FAFB',
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: '9px 8px',
    fontSize: 12,
    fontWeight: 500,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    color: '#6B7280',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#0D9F6E',
    borderBottom: '2px solid #0D9F6E',
    background: '#fff',
  },
  tabIcon: {
    fontSize: 15,
  },
  subHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    background: '#FAFAFA',
    borderBottom: '1px solid #F3F4F6',
    gap: 8,
  },
  tabDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    flex: 1,
  },
  legend: {
    display: 'flex',
    gap: 6,
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 7px 2px 5px',
    borderRadius: 10,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #E5E7EB',
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 13,
    color: '#111827',
    background: 'transparent',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  list: {
    maxHeight: 300,
    overflowY: 'auto',
  },
  empty: {
    padding: '24px 16px',
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
  },
  selectionBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: '#F0FDF4',
    borderTop: '1px solid #D1FAE5',
    fontSize: 12,
    color: '#374151',
  },
  selectionText: {
    fontSize: 12,
    flex: 1,
  },
};

const g: Record<string, React.CSSProperties> = {
  section: {
    paddingBottom: 4,
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 12px 4px 10px',
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '7px 12px',
    gap: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.1s',
  },
  rowSelected: {
    background: '#F0FDF4',
  },
  typeIcon: {
    fontSize: 17,
    flexShrink: 0,
  },
  labelBlock: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#111827',
  },
  fieldDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
