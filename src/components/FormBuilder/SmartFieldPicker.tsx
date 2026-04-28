import { useState, useMemo } from 'react';
import {
  OBJECT_FIELDS,
  SmartFieldObject,
  SmartFieldDefinition,
} from './mockData';

interface SmartFieldMapping {
  object: SmartFieldObject;
  field: SmartFieldDefinition;
}

interface Props {
  value: SmartFieldMapping | null;
  onChange: (mapping: SmartFieldMapping) => void;
}

const OBJECT_LABELS: Record<SmartFieldObject, string> = {
  customer: 'Customer',
  location: 'Location',
  equipment: 'Equipment',
};

const DATA_TYPE_ICONS: Record<string, string> = {
  text: 'text_fields',
  number: 'tag',
  date: 'calendar_today',
  boolean: 'toggle_on',
  dropdown: 'arrow_drop_down_circle',
  phone: 'phone',
  email: 'email',
};

export function SmartFieldPicker({ value, onChange }: Props) {
  const [selectedObject, setSelectedObject] = useState<SmartFieldObject>(
    value?.object ?? 'customer'
  );
  const [search, setSearch] = useState('');

  const allFields = OBJECT_FIELDS[selectedObject];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allFields;
    return allFields.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.dataType.toLowerCase().includes(q) ||
        (f.description?.toLowerCase().includes(q) ?? false)
    );
  }, [allFields, search]);

  const standardFields = filtered.filter((f) => f.type === 'standard');
  const customFields = filtered.filter((f) => f.type === 'custom');

  function handleSelect(field: SmartFieldDefinition) {
    onChange({ object: selectedObject, field });
  }

  function handleObjectChange(obj: SmartFieldObject) {
    setSelectedObject(obj);
    setSearch('');
  }

  return (
    <div style={styles.wrapper}>
      {/* Object tabs */}
      <div style={styles.tabRow}>
        {(Object.keys(OBJECT_LABELS) as SmartFieldObject[]).map((obj) => (
          <button
            key={obj}
            style={{
              ...styles.tab,
              ...(selectedObject === obj ? styles.tabActive : {}),
            }}
            onClick={() => handleObjectChange(obj)}
          >
            {OBJECT_LABELS[obj]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={styles.searchRow}>
        <span className="material-symbols-rounded" style={styles.searchIcon}>
          search
        </span>
        <input
          style={styles.searchInput}
          placeholder={`Search ${OBJECT_LABELS[selectedObject]} fields...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        {search && (
          <button style={styles.clearBtn} onClick={() => setSearch('')}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
          </button>
        )}
      </div>

      {/* Field list */}
      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.empty}>No fields match "{search}"</div>
        )}

        {standardFields.length > 0 && (
          <FieldGroup
            label="Standard Fields"
            fields={standardFields}
            selectedId={value?.field.id}
            onSelect={handleSelect}
          />
        )}

        {customFields.length > 0 && (
          <FieldGroup
            label={`Custom Fields (${customFields.length})`}
            fields={customFields}
            selectedId={value?.field.id}
            onSelect={handleSelect}
          />
        )}
      </div>

      {/* Current selection summary */}
      {value && (
        <div style={styles.selectionBar}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#0D9F6E' }}>
            check_circle
          </span>
          <span style={styles.selectionText}>
            Mapped to <strong>{OBJECT_LABELS[value.object]}</strong> →{' '}
            <strong>{value.field.label}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

function FieldGroup({
  label,
  fields,
  selectedId,
  onSelect,
}: {
  label: string;
  fields: SmartFieldDefinition[];
  selectedId?: string;
  onSelect: (f: SmartFieldDefinition) => void;
}) {
  return (
    <div style={groupStyles.section}>
      <div style={groupStyles.groupLabel}>{label}</div>
      {fields.map((field) => {
        const isSelected = field.id === selectedId;
        return (
          <button
            key={field.id}
            style={{
              ...groupStyles.row,
              ...(isSelected ? groupStyles.rowSelected : {}),
            }}
            onClick={() => onSelect(field)}
          >
            <span
              className="material-symbols-rounded"
              style={{
                ...groupStyles.typeIcon,
                color: isSelected ? '#0D9F6E' : '#6B7280',
              }}
            >
              {DATA_TYPE_ICONS[field.dataType] ?? 'text_fields'}
            </span>
            <div style={groupStyles.labelBlock}>
              <span style={groupStyles.fieldLabel}>{field.label}</span>
              {field.description && (
                <span style={groupStyles.fieldDesc}>{field.description}</span>
              )}
            </div>
            <span style={groupStyles.dataTypeBadge}>{field.dataType}</span>
            {isSelected && (
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 18, color: '#0D9F6E', marginLeft: 4 }}
              >
                check
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
    padding: '8px 12px',
    fontSize: 13,
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
    maxHeight: 280,
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
  },
};

const groupStyles: Record<string, React.CSSProperties> = {
  section: {
    paddingBottom: 4,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#9CA3AF',
    padding: '10px 12px 4px',
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
    fontSize: 18,
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
    fontWeight: 400,
  },
  fieldDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dataTypeBadge: {
    fontSize: 10,
    color: '#6B7280',
    background: '#F3F4F6',
    padding: '2px 6px',
    borderRadius: 4,
    flexShrink: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontWeight: 500,
  },
};
