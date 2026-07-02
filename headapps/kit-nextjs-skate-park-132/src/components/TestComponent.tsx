import React from 'react';
import { useTranslations } from 'next-intl';

export const Default = (): React.JSX.Element => {
  const t = useTranslations('TestSite');
  return (
    <div className="container-default">
      <p>---------TEST TEXT---------</p>
      <h2>{t('user_register_already_registered_text')}</h2>
    </div>
  );
};