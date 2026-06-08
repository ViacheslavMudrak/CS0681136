import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@brightcove/react-player-loader', () => ({
  default: (props: { accountId?: string; videoId?: string; attrs?: { className?: string } }) => (
    <div data-testid="bc-loader" data-account={props.accountId} data-video={props.videoId} className={props.attrs?.className} />
  ),
}));

import { BrightcoveModalPlayer } from 'components/shared/video/BrightcoveModalPlayer';

describe('BrightcoveModalPlayer', () => {
  const originalAccount = process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID;
  const originalPlayer = process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID;

  beforeEach(() => {
    delete process.env.GATSBY_BRIGHTCOVE_ACCOUNT_ID;
    delete process.env.GATSBY_BRIGHTCOVE_PLAYER_ID;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID = originalAccount;
    process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID = originalPlayer;
  });

  it('renders status message when account or player id is missing', () => {
    delete process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID;
    delete process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID;
    render(
      <BrightcoveModalPlayer
        videoId="v1"
        loop={false}
        autoplayOnLoad={false}
        playerNotConfigured="Player not set up"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Player not set up');
  });

  it('renders ReactPlayerLoader when env ids are present', () => {
    process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID = 'acc-1';
    process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID = 'pl-1';
    render(
      <BrightcoveModalPlayer
        videoId="vid-99"
        loop
        autoplayOnLoad
        playerClassName="custom-bc"
        playerNotConfigured="n/a"
      />,
    );
    const el = screen.getByTestId('bc-loader');
    expect(el).toHaveAttribute('data-account', 'acc-1');
    expect(el).toHaveAttribute('data-video', 'vid-99');
    expect(el).toHaveClass('custom-bc');
  });

  it('falls back to Gatsby env var names when Next public vars are unset', () => {
    delete process.env.NEXT_PUBLIC_BRIGHTCOVE_ACCOUNT_ID;
    delete process.env.NEXT_PUBLIC_BRIGHTCOVE_PLAYER_ID;
    process.env.GATSBY_BRIGHTCOVE_ACCOUNT_ID = 'g-acc';
    process.env.GATSBY_BRIGHTCOVE_PLAYER_ID = 'g-pl';
    render(
      <BrightcoveModalPlayer videoId="v2" loop={false} autoplayOnLoad={false} playerNotConfigured="x" />,
    );
    expect(screen.getByTestId('bc-loader')).toHaveAttribute('data-account', 'g-acc');
  });
});
