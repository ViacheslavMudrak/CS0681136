"use client";
import EditIcon from "@/components/shared/icons/EditIcon";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Link from "next/link";

interface RolesPageHeaderProps {
  onEditClick?: () => void;
}

export default function RolesPageHeader({ onEditClick }: RolesPageHeaderProps) {
  return (
    <div className='flex items-center justify-between mb-[32px] md:mb-[24px]'>
      <Heading
        level={1}
        className='text-[#222] text-[32px] md:text-[24px] lg:text-[30px] font-bold leading-[1.2]'
      >
        Manage Roles & Permissions
      </Heading>

      <div className='flex items-center gap-[16px]'>
        <Link
          href='/dashboard/audit-log'
          className='text-[#00287b] text-[14px] leading-[1.5] hover:underline flex items-center gap-1'
        >
          Audit Log
          <svg
            width='12'
            height='12'
            viewBox='0 0 12 12'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <path
              d='M4.5 9L7.5 6L4.5 3'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </Link>

        <Button
          variant='primary'
          onPress={onEditClick}
          className='flex items-center gap-2 px-4 py-2 h-auto rounded-[9999px]'
        >
          <EditIcon
            width={16}
            height={16}
            className='text-white'
            decorative={false}
            aria-label='Edit'
          />
          <span>Edit</span>
        </Button>
      </div>
    </div>
  );
}
