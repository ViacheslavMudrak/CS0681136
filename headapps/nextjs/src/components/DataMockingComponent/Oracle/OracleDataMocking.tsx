import classNames from 'classnames/bind';
import { useSession } from 'next-auth/react';
import { JSX, useCallback, useEffect, useState } from 'react';

import styles from './OracleDataMocking.module.scss';
import { EMPTY_FIELDS, FIELD_META, OracleMockFields } from './OracleDataMocking.types';

const cx = classNames.bind(styles);

const OracleDataMocking = (): JSX.Element => {
  const { status } = useSession();
  const [fields, setFields] = useState<OracleMockFields>({ ...EMPTY_FIELDS });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load existing values on mount
  useEffect(() => {
    if (status !== 'authenticated') return;

    const load = async () => {
      try {
        const res = await fetch('/api/mock-data');
        if (res.ok) {
          const data = await res.json();
          setFields((prev) => ({
            ...prev,
            ...Object.fromEntries(
              FIELD_META.map(({ key }) => [key, data[key] ?? '']).filter(([, v]) => v !== '')
            ),
          }));
        }
      } catch {
        // Silently ignore load errors
      }
    };

    load();
  }, [status]);

  const handleChange = useCallback((key: keyof OracleMockFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      const res = await fetch('/api/mock-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to save');
      }

      setMessage({ text: 'Saved successfully', type: 'success' });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Unknown error',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }, [fields]);

  if (status === 'loading') {
    return <p>Loading session...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>Please sign in to configure Oracle mock data.</p>;
  }

  return (
    <div className={cx('oracle-data-mocking')}>
      <h2 className={cx('oracle-data-mocking__title')}>Oracle Data Mocking</h2>

      {FIELD_META.map(({ key, label, type }) => (
        <div key={key} className={cx('oracle-data-mocking__field')}>
          <label htmlFor={key} className={cx('oracle-data-mocking__label')}>
            {label}
          </label>
          <input
            id={key}
            type={type}
            className={cx('oracle-data-mocking__input')}
            value={fields[key]}
            placeholder={`Enter ${label}`}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}

      <div className={cx('oracle-data-mocking__actions')}>
        <button
          type="button"
          className={cx('oracle-data-mocking__btn', 'oracle-data-mocking__btn--save')}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {message && (
        <p
          className={cx('oracle-data-mocking__message', {
            'oracle-data-mocking__message--success': message.type === 'success',
            'oracle-data-mocking__message--error': message.type === 'error',
          })}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default OracleDataMocking;
