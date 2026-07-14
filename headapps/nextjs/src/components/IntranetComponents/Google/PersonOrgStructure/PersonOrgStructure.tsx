import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useOrgStructure, type OrgSearchMode } from 'lib/google/hooks/use-org-structure';
import { useSession } from 'next-auth/react';
import React, { JSX, useCallback, useState } from 'react';

import { Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material';

import styles from './PersonOrgStructure.module.scss';
import type { OrgTreeNode, PersonOrgStructureProps } from './PersonOrgStructure.types';

const cx = classNames.bind(styles);

// ---------------------------------------------------------------------------
// OrgNode — recursive tree node
// ---------------------------------------------------------------------------

interface OrgNodeProps {
  node: OrgTreeNode;
  depth: number;
  highlightEmail?: string;
}

const OrgNode = ({ node, depth, highlightEmail }: OrgNodeProps): JSX.Element => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasReports = node.directReports.length > 0;
  const isHighlighted = highlightEmail
    ? node.email.toLowerCase() === highlightEmail.toLowerCase()
    : false;

  return (
    <div
      className={cx('org-node')}
      role="treeitem"
      aria-selected={isHighlighted}
      aria-expanded={hasReports ? expanded : undefined}
    >
      <div className={cx('org-node__card', { 'org-node__card--highlighted': isHighlighted })}>
        {hasReports ? (
          <button
            type="button"
            className={cx('org-node__toggle')}
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expanded ? 'Collapse direct reports' : 'Expand direct reports'}
          >
            <MaterialIcon name={expanded ? 'ExpandMore' : 'ChevronRight'} />
          </button>
        ) : (
          <span className={cx('org-node__toggle-spacer')} />
        )}

        {node.photoUrl ? (
          <img
            src={node.photoUrl}
            alt={node.name?.displayName || node.email}
            className={cx('org-node__avatar')}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className={cx('org-node__avatar-placeholder')}>
            <MaterialIcon name="Person" />
          </span>
        )}

        <div className={cx('org-node__info')}>
          <span className={cx('org-node__name')}>{node.name?.displayName || node.email}</span>
          {node.title && <span className={cx('org-node__title')}>{node.title}</span>}
          {node.department && <span className={cx('org-node__department')}>{node.department}</span>}
        </div>

        {hasReports && <span className={cx('org-node__badge')}>{node.directReports.length}</span>}
      </div>

      {hasReports && expanded && (
        <div className={cx('org-node__children')} role="group">
          {node.directReports.map((child) => (
            <OrgNode
              key={child.email}
              node={child}
              depth={depth + 1}
              highlightEmail={highlightEmail}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// PersonOrgStructure — main component
// ---------------------------------------------------------------------------

const PersonOrgStructure = (props: PersonOrgStructureProps): JSX.Element => {
  const { data: session } = useSession();
  const [inputEmail, setInputEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<OrgSearchMode>('root');

  // Default to session user email when no explicit search
  const effectiveEmail = searchEmail || session?.user?.email || null;
  const { data, loading, error, refresh } = useOrgStructure(effectiveEmail, mode);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputEmail.trim();
      setSearchEmail(trimmed || null);
    },
    [inputEmail]
  );

  const handleModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newMode: OrgSearchMode | null) => {
      if (newMode) setMode(newMode);
    },
    []
  );

  return (
    <div className={cx('person-org-structure', 'component', props.className)}>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleModeChange}
        size="small"
        className={cx('person-org-structure__mode-toggle')}
        aria-label="Search mode"
      >
        <ToggleButton value="root">By Root Email</ToggleButton>
        <ToggleButton value="full-tree">Full Tree By Current User</ToggleButton>
      </ToggleButtonGroup>

      <form className={cx('person-org-structure__search')} onSubmit={handleSubmit}>
        <input
          type="email"
          className={cx('person-org-structure__input')}
          placeholder={session?.user?.email || 'Enter email address'}
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          aria-label="Email address to look up"
        />
        <button
          type="submit"
          className={cx('person-org-structure__search-btn')}
          aria-label="Search"
        >
          <MaterialIcon name="Search" />
        </button>
        <button
          type="button"
          className={cx('person-org-structure__refresh-btn')}
          onClick={() => refresh()}
          aria-label="Refresh org tree"
        >
          <MaterialIcon name="Refresh" />
        </button>
      </form>

      {loading && (
        <div className={cx('person-org-structure__loading')}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={48} />
          ))}
        </div>
      )}

      {error && (
        <div className={cx('person-org-structure__error')}>
          <MaterialIcon name="ErrorOutline" />
          <span>{error.message || 'Failed to load org structure'}</span>
        </div>
      )}

      {data?.tree && !loading && (
        <div
          className={cx('person-org-structure__tree')}
          role="tree"
          aria-label="Organization structure"
        >
          <div className={cx('person-org-structure__count')}>
            {data.totalNodes} {data.totalNodes === 1 ? 'person' : 'people'} in tree
          </div>
          <OrgNode node={data.tree} depth={0} highlightEmail={data.highlightEmail} />
        </div>
      )}

      {!loading && !error && !data?.tree && effectiveEmail && (
        <div className={cx('person-org-structure__empty')}>No org structure data found.</div>
      )}
    </div>
  );
};

export default PersonOrgStructure;
