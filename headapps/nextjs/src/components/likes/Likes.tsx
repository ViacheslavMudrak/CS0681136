import { JSX, useEffect, useState } from 'react';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import classNames from 'classnames/bind';
import { useUserLikes } from 'lib/firebase';
import { useSession } from 'next-auth/react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';

import styles from './Likes.module.scss';
const cx = classNames.bind(styles);

type LikesProps = {
  pageId: string;
  className?: string;
};

const Likes = ({ pageId, className }: LikesProps): JSX.Element => {
  const { page } = useSitecore();
  const { data: session } = useSession();

  const { users, isLoadingUsers, saveUserLike, deleteUserLike } = useUserLikes(pageId);

  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [isLikedByUser, setIsLikedByUser] = useState(false);

  useEffect(() => {
    if (page.mode.isEditing) {
      setLikesCount(0);
      return;
    }

    if (session?.user) {
      const id = session.user.id || '';
      setUserId(id);

      if (!isLoadingUsers) {
        setIsLikedByUser(users?.includes(id) ?? false);
        setLikesCount(users?.length || 0);
      }
    } else {
      if (!isLoadingUsers) {
        setLikesCount(users?.length || 0);
      }
    }
  }, [page.mode.isEditing, session, isLoadingUsers, users]);

  const handleLike = async () => {
    if (page.mode.isEditing || !userId) return;

    setIsLoading(true);

    const response = isLikedByUser ? await deleteUserLike() : await saveUserLike();

    if (response?.success) {
      setIsLoading(false);
    }
  };

  return (
    <span
      className={cx(
        'likes-button',
        'flex gap-2',
        isLoading && 'cursor-not-allowed opacity-50 pointer-events-none',
        className
      )}
      onClick={handleLike}
    >
      <MaterialIcon name={isLikedByUser ? 'ThumbUp' : 'ThumbUpOffAlt'} />
      {likesCount}
    </span>
  );
};

export default Likes;
