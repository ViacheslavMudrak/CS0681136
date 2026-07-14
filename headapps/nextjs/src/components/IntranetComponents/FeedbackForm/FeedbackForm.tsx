import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { useSession } from 'next-auth/react';
import { useI18n } from 'next-localization';
import { JSX, useEffect, useState } from 'react';
import React from 'react';

import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';

import styles from './FeedbackForm.module.scss';
import { FeedbackFormProps, FeedbackFormStatics } from './FeedbackForm.types';

const cx = classNames.bind(styles);

const FeedbackForm = (props: FeedbackFormProps): JSX.Element => {
  const { fields } = props;
  const { t } = useI18n();

  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const [userEmail, setuserEmail] = useState('');
  const [formSubject, setformSubject] = useState('');
  const [formMessage, setformMessage] = useState('');
  const recipientEmails = fields?.recipientEmails?.value || '';
  const webhookUrl = fields?.webhookUrl?.value;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: session } = useSession();

  const subjectPlaceholder =
    t('FeedbackFormSubjectPlaceholderText') || FeedbackFormStatics.subjectPlaceholderText;
  const messagePlaceholder =
    t('FeedbackFormMessagePlaceholderText') || FeedbackFormStatics.messagePlaceholderText;
  const successMessage = t('FeedbackFormSuccessMessage') || FeedbackFormStatics.successMessage;
  const pageUrlLabel = t('FeedbackFormPageUrlLabel') || FeedbackFormStatics.pageUrlLabel;

  const isSubmitDisabled = !formSubject.trim() || !formMessage.trim();

  useEffect(() => {
    if (!isPageEditing && session && session.user) {
      setuserEmail(session.user?.email as string);
    }
  }, [isPageEditing, session]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitDisabled) {
      return;
    }
    if (!webhookUrl) {
      console.error('No webhook URL configured for FeedbackForm');
      return;
    }
    let formattedMessage = formMessage;
    if (fields?.includePageUrl?.value) {
      formattedMessage += `\n\n${pageUrlLabel}: ${window.location.href}`; // Append page URL to the message if the option is enabled
    }

    setIsSubmitting(true);
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedbackform_subject: formSubject,
        feedbackform_message: formattedMessage,
        feedbackform_userEmail: userEmail,
        feedbackform_recipientEmails: recipientEmails,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed ${res.status}`);
        return res.json().catch(() => null);
      })
      .then(() => {
        setSubmitted(true);
        setFormClear();
      })
      .catch((err) => {
        console.error('Feedback submit failed', err);
      })
      .finally(() => setIsSubmitting(false));
  };

  const setFormClear = () => {
    setformSubject('');
    setformMessage('');
  };

  return (
    <>
      <div
        className={cx(
          'feedback-form',
          'component container flex flex-col md:flex-row md:gap-8 items-stretch',
          props.stylesSXA
        )}
      >
        <div
          className={cx(
            'feedback-form__content',
            'flex md:flex-[1_1_50%] flex-col gap-4 justify-center'
          )}
        >
          <Text
            tag="span"
            className={cx('feedback-form__eyebrow', 'eyebrow eyebrow-font-size')}
            field={fields.optionalEyebrow}
          />
          <Text tag="h2" field={fields?.title} />
          <Text tag="p" field={fields?.description} />
        </div>
        <div className={cx('feedback-form__form-container', 'flex md:flex-[1_1_50%] flex-col')}>
          {!submitted && (
            <form
              className={cx('feedback-form__form', 'flex flex-col gap-4')}
              onSubmit={handleSubmit}
            >
              <input
                value={formSubject}
                name="feedbackform_Subject"
                className={cx('feedback-form__form-subject', 'p-4')}
                onChange={(e) => setformSubject(e.target.value as string)}
                type="text"
                placeholder={subjectPlaceholder}
              />
              <textarea
                value={formMessage}
                name="feedbackform_Message"
                className={cx('feedback-form__form-message', 'p-4')}
                onChange={(e) => setformMessage(e.target.value as string)}
                placeholder={messagePlaceholder}
              />
              <div>
                <button
                  type="submit"
                  className={cx(
                    'asc-btn asc-btn--primary w-fit',
                    `${isSubmitting || isSubmitDisabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`
                  )}
                >
                  {fields?.buttonText?.value}
                </button>
              </div>
            </form>
          )}

          {submitted && (
            <div
              className={cx(
                'feedback-form__submitted-message',
                'show-message',
                'flex gap-2 items-center justify-center'
              )}
            >
              <MaterialIcon name="CheckCircleOutlined" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default compose<FeedbackFormProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(FeedbackForm);
