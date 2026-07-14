import classNames from 'classnames/bind';
import { useSession } from 'next-auth/react';
import { JSX, useCallback, useEffect, useState } from 'react';

import styles from './DataMockingForm.module.scss';
import { EMPTY_FIELDS, FIELD_META, UkgMockFields } from './DataMockingForm.types';

const cx = classNames.bind(styles);

const DataMockingForm = (): JSX.Element => {
  const { status } = useSession();
  const [fields, setFields] = useState<UkgMockFields>({ ...EMPTY_FIELDS });
  const [enableMocking, setEnableMocking] = useState<'yes' | 'no'>('no');
  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [toggleMessage, setToggleMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Load existing values on mount
  useEffect(() => {
    if (status !== 'authenticated') return;

    const load = async () => {
      try {
        const res = await fetch('/api/mock-data');
        if (res.ok) {
          const data = await res.json();
          if (data.enableMocking === 'true') {
            setEnableMocking('yes');
          }
          setFields((prev) => ({
            ...prev,
            ...Object.fromEntries(
              FIELD_META.map(({ key }) => [key, data[key] ?? '']).filter(([, v]) => v !== '')
            ),
          }));
        }
      } catch {}
    };

    load();
  }, [status]);

  const handleChange = useCallback((key: keyof UkgMockFields, value: string) => {
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
    return <p>Please sign in to configure UKG mock data.</p>;
  }

  return (
    <>
      <div className={cx('data-mocking-form')}>
        <h2 className={cx('data-mocking-form__title')}>Enable Data Mocking</h2>

        <div className={cx('data-mocking-form__radio-group')}>
          <label className={cx('data-mocking-form__radio-label')}>
            <input
              type="radio"
              name="enableMocking"
              className={cx('data-mocking-form__radio')}
              checked={enableMocking === 'yes'}
              onChange={() => {
                setEnableMocking('yes');
                setToggleMessage(null);
              }}
            />
            Yes
          </label>
          <label className={cx('data-mocking-form__radio-label')}>
            <input
              type="radio"
              name="enableMocking"
              className={cx('data-mocking-form__radio')}
              checked={enableMocking === 'no'}
              onChange={() => {
                setEnableMocking('no');
                setToggleMessage(null);
              }}
            />
            No
          </label>
        </div>

        <div className={cx('data-mocking-form__actions')}>
          <button
            type="button"
            className={cx('data-mocking-form__btn', 'data-mocking-form__btn--save')}
            onClick={async () => {
              try {
                setIsSavingToggle(true);
                setToggleMessage(null);

                const res = await fetch('/api/mock-data', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    enableMocking: enableMocking === 'yes' ? 'true' : 'false',
                  }),
                });

                if (!res.ok) {
                  const errorData = await res.json().catch(() => null);
                  throw new Error(errorData?.error || 'Failed to save');
                }

                setToggleMessage({ text: 'Saved successfully', type: 'success' });
              } catch (err) {
                setToggleMessage({
                  text: err instanceof Error ? err.message : 'Unknown error',
                  type: 'error',
                });
              } finally {
                setIsSavingToggle(false);
              }
            }}
            disabled={isSavingToggle}
          >
            {isSavingToggle ? 'Saving...' : 'Save'}
          </button>
        </div>

        {toggleMessage && (
          <p
            className={cx('data-mocking-form__message', {
              'data-mocking-form__message--success': toggleMessage.type === 'success',
              'data-mocking-form__message--error': toggleMessage.type === 'error',
            })}
          >
            {toggleMessage.text}
          </p>
        )}
      </div>
      <div className={cx('data-mocking-form')}>
        <h2 className={cx('data-mocking-form__title')}>UKG Data Mocking</h2>

        <div className={cx('data-mocking-form__fields')}>
          {FIELD_META.map(({ key, label }) => (
            <div key={key} className={cx('data-mocking-form__field')}>
              <label htmlFor={key} className={cx('data-mocking-form__label')}>
                {label}
              </label>
              <input
                id={key}
                type="text"
                className={cx('data-mocking-form__input')}
                value={fields[key]}
                placeholder={`Enter ${label} value`}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className={cx('data-mocking-form__actions')}>
          <button
            type="button"
            className={cx('data-mocking-form__btn', 'data-mocking-form__btn--save')}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {message && (
          <p
            className={cx('data-mocking-form__message', {
              'data-mocking-form__message--success': message.type === 'success',
              'data-mocking-form__message--error': message.type === 'error',
            })}
          >
            {message.text}
          </p>
        )}
      </div>
    </>
  );
};

export default DataMockingForm;
