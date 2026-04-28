import { useState } from 'react';
import { SmartFieldPicker } from './SmartFieldPicker';
import { SmartFieldObject, SmartFieldDefinition, OBJECT_FIELDS } from './mockData';

type FieldType =
  | 'Text'
  | 'Number'
  | 'Checkboxes'
  | 'Radio Buttons'
  | 'Dropdown'
  | 'Stoplight buttons'
  | 'Picture'
  | 'Date'
  | 'Signature'
  | 'Smart Field';

interface SmartFieldMapping {
  object: SmartFieldObject;
  field: SmartFieldDefinition;
}

interface FormField {
  id: string;
  header: string;
  description: string;
  required: boolean;
  type: FieldType;
  smartFieldMapping: SmartFieldMapping | null;
}

const FIELD_TYPES: FieldType[] = [
  'Text', 'Number', 'Checkboxes', 'Radio Buttons', 'Dropdown',
  'Stoplight buttons', 'Picture', 'Date', 'Signature', 'Smart Field',
];

const OBJECT_LABELS: Record<SmartFieldObject, string> = {
  customer: 'Customer',
  location: 'Location',
  equipment: 'Equipment',
};

export function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'field-1',
      header: '',
      description: '',
      required: false,
      type: 'Text',
      smartFieldMapping: null,
    },
  ]);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
    setSaved(false);
    setSaveError(null);
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      {
        id: `field-${Date.now()}`,
        header: '',
        description: '',
        required: false,
        type: 'Text',
        smartFieldMapping: null,
      },
    ]);
    setSaved(false);
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSaved(false);
  }

  function handleSave() {
    // Validate smart fields
    for (const f of fields) {
      if (f.type === 'Smart Field' && !f.smartFieldMapping) {
        setSaveError(`Field "${f.header || 'Untitled'}" is a Smart Field but has no source selected.`);
        return;
      }
    }
    setSaved(true);
    setSaveError(null);
  }

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topBar}>
        <button style={s.backBtn}>
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Forms
        </button>
        <div style={s.topCenter}>
          <span style={s.formTitle}>Untitled Form</span>
          <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#9CA3AF', cursor: 'pointer' }}>edit</span>
          <span style={s.publishedBadge}>Published</span>
        </div>
        <div style={s.topRight}>
          <button style={s.conditionalBtn}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>account_tree</span>
            Add Conditional Logic
          </button>
          <button style={s.previewBtn}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>visibility</span>
            Preview Form
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={s.content}>
        {/* Form settings panel */}
        <div style={s.settingsPanel}>
          <SettingsRow label="Status">
            <div style={s.statusCards}>
              <div style={s.statusCard}>
                <strong>Unpublished</strong>
                <p style={s.statusDesc}>The form will be saved but will not be available to your selected audience.</p>
              </div>
              <div style={{ ...s.statusCard, ...s.statusCardActive }}>
                <div style={s.statusRadioRow}>
                  <span style={s.radioActive} />
                  <strong>Published</strong>
                </div>
                <p style={s.statusDesc}>The form will be saved and will be available to your selected audience.</p>
              </div>
            </div>
          </SettingsRow>

          <div style={s.checkRow}>
            <CheckboxItem label="Show BU logo on print view" checked />
            <CheckboxItem label="Allow emailing when not filled" checked />
            <CheckboxItem label="If filled, email to customer automatically upon job completion" checked info />
          </div>

          <SettingsRow label="Display on">
            <RadioItem label="Office Side Only" checked />
            <RadioItem label="Both Office and Technician Sides" />
          </SettingsRow>

          <SettingsRow label="Assigned to">
            <div style={s.checkboxGroup}>
              {['Job', 'Call', 'Customer', 'Location', 'Equipment', 'Technician'].map((item) => (
                <CheckboxItem key={item} label={item} checked={['Job', 'Call', 'Customer', 'Location'].includes(item)} inline />
              ))}
            </div>
          </SettingsRow>

          <SettingsRow label="Send form as">
            <RadioItem label="One column" checked />
            <RadioItem label="Two columns" />
          </SettingsRow>
        </div>

        {/* Form fields */}
        <div style={s.fieldsArea}>
          <div style={s.sectionLabel}>Some text</div>

          {fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              onChange={(patch) => updateField(field.id, patch)}
              onRemove={() => removeField(field.id)}
            />
          ))}

          <button style={s.addFieldBtn} onClick={addField}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>add</span>
            Add Field
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={s.bottomBar}>
        {saveError && <span style={s.errorMsg}>{saveError}</span>}
        {saved && <span style={s.savedMsg}>Form saved successfully.</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={s.cancelBtn}>Cancel</button>
          <button style={s.saveBtn} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

function FieldCard({
  field,
  onChange,
  onRemove,
}: {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
  onRemove: () => void;
}) {
  const [typeOpen, setTypeOpen] = useState(false);
  const isSmartField = field.type === 'Smart Field';

  // When type changes away from Smart Field, clear the mapping
  function handleTypeSelect(type: FieldType) {
    const patch: Partial<FormField> = { type };
    if (type !== 'Smart Field') patch.smartFieldMapping = null;
    onChange(patch);
    setTypeOpen(false);
  }

  return (
    <div style={fc.card}>
      <div style={fc.actions}>
        <button style={fc.iconBtn} title="Duplicate">
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>content_copy</span>
        </button>
        <button style={fc.iconBtn} title="Delete" onClick={onRemove}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>delete</span>
        </button>
      </div>

      <div style={fc.row}>
        <label style={fc.label}>Header</label>
        <input
          style={fc.input}
          placeholder="Untitled question"
          value={field.header}
          onChange={(e) => onChange({ header: e.target.value })}
        />
      </div>

      <div style={fc.row}>
        <label style={fc.label}>Description</label>
        <textarea
          style={fc.textarea}
          placeholder="Description"
          value={field.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div style={fc.row}>
        <label style={fc.label} />
        <label style={fc.checkboxLabel}>
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onChange({ required: e.target.checked })}
          />
          Required
        </label>
      </div>

      <div style={fc.row}>
        <label style={fc.label}>Type</label>
        <div style={fc.typeWrapper}>
          {/* Dropdown trigger */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              style={fc.typeBtn}
              onClick={() => setTypeOpen((o) => !o)}
            >
              {field.type}
              <span className="material-symbols-rounded" style={{ fontSize: 16, marginLeft: 4 }}>
                arrow_drop_down
              </span>
            </button>

            {typeOpen && (
              <div style={fc.dropdown}>
                {FIELD_TYPES.map((t) => (
                  <button
                    key={t}
                    style={{
                      ...fc.dropdownItem,
                      ...(t === field.type ? fc.dropdownItemActive : {}),
                      ...(t === 'Smart Field' ? fc.dropdownItemSmartField : {}),
                    }}
                    onClick={() => handleTypeSelect(t)}
                  >
                    {t === field.type && (
                      <span className="material-symbols-rounded" style={{ fontSize: 14, marginRight: 6 }}>
                        check
                      </span>
                    )}
                    {t}
                    {t === 'Smart Field' && (
                      <span style={fc.smartBadge}>Pre-fill</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Smart Field mapping summary pill */}
          {isSmartField && field.smartFieldMapping && (
            <div style={fc.mappingPill}>
              <span className="material-symbols-rounded" style={{ fontSize: 14, color: '#0D9F6E' }}>
                link
              </span>
              {OBJECT_LABELS[field.smartFieldMapping.object]} → {field.smartFieldMapping.field.label}
            </div>
          )}

          {/* Missing mapping warning */}
          {isSmartField && !field.smartFieldMapping && (
            <div style={fc.mappingWarning}>
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>warning</span>
              No source selected
            </div>
          )}
        </div>
      </div>

      {/* Smart Field picker inline */}
      {isSmartField && (
        <div style={fc.pickerRow}>
          <label style={fc.label}>Smart Field source</label>
          <div style={{ flex: 1 }}>
            <SmartFieldPicker
              value={field.smartFieldMapping}
              onChange={(mapping) => onChange({ smartFieldMapping: mapping })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Layout helpers ─────────────────────────────────────────── */

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={sr.row}>
      <div style={sr.label}>{label}</div>
      <div style={sr.content}>{children}</div>
    </div>
  );
}

function CheckboxItem({ label, checked, info, inline }: { label: string; checked?: boolean; info?: boolean; inline?: boolean }) {
  return (
    <label style={{ ...ci.label, ...(inline ? ci.inline : {}) }}>
      <input type="checkbox" defaultChecked={checked} style={{ accentColor: '#0D9F6E' }} />
      {label}
      {info && <span className="material-symbols-rounded" style={ci.infoIcon}>info</span>}
    </label>
  );
}

function RadioItem({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <label style={ci.label}>
      <input type="radio" defaultChecked={checked} style={{ accentColor: '#0D9F6E' }} />
      {label}
    </label>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    color: '#111827',
    background: '#F9FAFB',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    height: 56,
    background: '#1F2937',
    color: '#fff',
    gap: 16,
    flexShrink: 0,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    color: '#D1D5DB',
    cursor: 'pointer',
    fontSize: 13,
  },
  topCenter: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  formTitle: {
    fontWeight: 500,
    fontSize: 15,
    color: '#fff',
  },
  publishedBadge: {
    background: '#0D9F6E',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
  },
  topRight: {
    display: 'flex',
    gap: 8,
  },
  conditionalBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: '1px solid #4B5563',
    color: '#D1D5DB',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  previewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#fff',
    border: '1px solid #fff',
    color: '#111827',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    maxWidth: 800,
    margin: '0 auto',
    width: '100%',
  },
  settingsPanel: {
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  statusCards: {
    display: 'flex',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    padding: '10px 14px',
    fontSize: 13,
    color: '#6B7280',
  },
  statusCardActive: {
    border: '2px solid #0D9F6E',
    color: '#111827',
  },
  statusRadioRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  radioActive: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#0D9F6E',
    border: '3px solid #D1FAE5',
    display: 'inline-block',
  },
  statusDesc: {
    margin: '4px 0 0',
    lineHeight: 1.4,
  },
  checkRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingLeft: 120,
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 16px',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 500,
    color: '#374151',
  },
  fieldsArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  addFieldBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#fff',
    border: '1px dashed #D1D5DB',
    borderRadius: 8,
    padding: '10px 16px',
    color: '#6B7280',
    cursor: 'pointer',
    fontSize: 13,
    width: '100%',
    justifyContent: 'center',
    transition: 'background 0.1s',
  },
  bottomBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#fff',
    borderTop: '1px solid #E5E7EB',
    flexShrink: 0,
    gap: 12,
  },
  cancelBtn: {
    padding: '8px 20px',
    border: '1px solid #D1D5DB',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    color: '#374151',
  },
  saveBtn: {
    padding: '8px 24px',
    border: 'none',
    borderRadius: 6,
    background: '#0D9F6E',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  },
  errorMsg: {
    color: '#DC2626',
    fontSize: 13,
  },
  savedMsg: {
    color: '#0D9F6E',
    fontSize: 13,
    fontWeight: 500,
  },
};

const sr: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
  },
  label: {
    width: 100,
    flexShrink: 0,
    fontSize: 13,
    color: '#6B7280',
    paddingTop: 4,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
};

const ci: Record<string, React.CSSProperties> = {
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    cursor: 'pointer',
    userSelect: 'none',
    accentColor: '#0D9F6E',
  },
  inline: {
    marginRight: 8,
  },
  infoIcon: {
    fontSize: 14,
    color: '#9CA3AF',
    cursor: 'help',
  },
};

const fc: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
  },
  actions: {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    gap: 4,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9CA3AF',
    padding: 4,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
  },
  label: {
    width: 90,
    flexShrink: 0,
    fontSize: 13,
    color: '#6B7280',
    paddingTop: 6,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    outline: 'none',
    color: '#374151',
    background: '#FAFAFA',
  },
  textarea: {
    flex: 1,
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    outline: 'none',
    resize: 'vertical',
    minHeight: 56,
    color: '#374151',
    background: '#FAFAFA',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    cursor: 'pointer',
    paddingTop: 4,
  },
  typeWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  typeBtn: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    background: '#FAFAFA',
    cursor: 'pointer',
    color: '#374151',
    minWidth: 140,
    justifyContent: 'space-between',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 100,
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    minWidth: 200,
    padding: '4px 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    color: '#374151',
    textAlign: 'left',
    gap: 4,
  },
  dropdownItemActive: {
    background: '#F0FDF4',
    color: '#0D9F6E',
    fontWeight: 500,
  },
  dropdownItemSmartField: {
    borderTop: '1px solid #E5E7EB',
    marginTop: 4,
    paddingTop: 10,
  },
  smartBadge: {
    marginLeft: 'auto',
    fontSize: 10,
    background: '#D1FAE5',
    color: '#065F46',
    padding: '2px 6px',
    borderRadius: 10,
    fontWeight: 600,
    letterSpacing: '0.03em',
  },
  mappingPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#F0FDF4',
    border: '1px solid #A7F3D0',
    borderRadius: 20,
    padding: '4px 10px',
    fontSize: 12,
    color: '#065F46',
    fontWeight: 500,
  },
  mappingWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: 20,
    padding: '4px 10px',
    fontSize: 12,
    color: '#92400E',
  },
  pickerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 4,
  },
};
