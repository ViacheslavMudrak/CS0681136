import { CheckIcon } from "../shared/icons";

interface CheckmarkCellProps {
  hasPermission: boolean;
}
export default function CheckmarkCellComponent({ hasPermission }: CheckmarkCellProps) {
  if (!hasPermission) {
    return <div className='text-center' aria-label='Permission not granted' />;
  }

  return (
    <div
      className='text-center'
      aria-label='Permission granted'
      role='img'
      aria-hidden='false'
    >
      <span className='text-[#222] text-lg font-normal'>
        <CheckIcon />
      </span>
    </div>
  );
}
