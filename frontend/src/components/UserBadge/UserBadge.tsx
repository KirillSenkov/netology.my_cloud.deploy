import './UserBadge.css';

export type UserInfo = {
  id: number;
  username: string;
  fullName: string;
  email: string;
};

type UserBadgeProps = {
  user: UserInfo | null;
  onUsernameClick?: (id: number) => void;
};

export default function UserBadge({ user, onUsernameClick }: UserBadgeProps) {
  if (!user) return null;
  const { id, username, fullName, email } = user;

  const isClickable = Boolean(onUsernameClick);
  const UsernameTag = isClickable ? 'button' : 'div';

  return (
    <div className='userBadge'>
      <UsernameTag
        className={`userBadge__username ${isClickable ? 'userBadge__usernameBtn' : ''}`}
        type={isClickable ? 'button' : undefined}
        title='Открыть карточку пользователя (файлы, роль, удаление)'
        onClick={isClickable ? () => onUsernameClick?.(id) : undefined}
      >
        {username}
      </UsernameTag>

      <div className='userBadge__details' aria-label='Детали пользователя'>
        <span className='userBadge__paren' aria-hidden='true'>(</span>

        <span className='userBadge__inner'>
          <span className='userBadge__fullName'>{fullName}</span>
          {email ? (
              <a className='userBadge__email' href={`mailto:${email}`}>
                {email + ' ✉'}
              </a>
          ) : (
            <span className='userBadge__email userBadge__email--empty'>—</span>
          )}
        </span>

        <span className='userBadge__paren' aria-hidden='true'>)</span>
      </div>
    </div>
  );
}
