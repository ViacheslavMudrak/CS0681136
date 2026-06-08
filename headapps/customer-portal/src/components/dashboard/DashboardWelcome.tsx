"use client";

import { useIsIcreonUser } from "@/hooks/useIsIcreonUser";
import Heading from "@/components/ui/Heading";
import CheckIcon from "@/components/shared/icons/CheckIcon";
import PlusIcon from "@/components/shared/icons/PlusIcon";
import StackIcon from "@/components/shared/icons/StackIcon";

export default function DashboardWelcome() {
  const isIcreonUser = useIsIcreonUser();

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto">
        <Heading
          level={1}
          className="text-[#222] text-[32px] md:text-[24px] font-bold leading-[1.2] mb-[12px]"
        >
          Welcome to Your Dashboard
        </Heading>

        {!isIcreonUser ? (
          <>
            <p className="text-[#646467] text-[16px] md:text-[14px] leading-[1.5] mb-[32px]">
              Manage your orders, track shipments, access resources, and more
              from this central hub.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] md:gap-[16px] mt-[32px]">
              <div className="bg-white rounded-[8px] p-[24px] md:p-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] transition-shadow duration-150 hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="w-[48px] h-[48px] mb-[16px] flex items-center justify-center">
                  <CheckIcon
                    width={24}
                    height={24}
                    className="text-[#479ebc]"
                    decorative={true}
                  />
                </div>
                <Heading
                  level={3}
                  className="text-[#222] text-[18px] font-semibold leading-[1.3] mb-[8px]"
                >
                  View Orders
                </Heading>
                <p className="text-[#646467] text-[14px] leading-[1.5]">
                  Track and manage your orders
                </p>
              </div>
              <div className="bg-white rounded-[8px] p-[24px] md:p-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] transition-shadow duration-150 hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="w-[48px] h-[48px] mb-[16px] flex items-center justify-center">
                  <PlusIcon
                    width={24}
                    height={24}
                    className="text-[#479ebc]"
                    decorative={true}
                  />
                </div>
                <Heading
                  level={3}
                  className="text-[#222] text-[18px] font-semibold leading-[1.3] mb-[8px]"
                >
                  Quick Actions
                </Heading>
                <p className="text-[#646467] text-[14px] leading-[1.5]">
                  Access frequently used features
                </p>
              </div>
              <div className="bg-white rounded-[8px] p-[24px] md:p-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] transition-shadow duration-150 hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="w-[48px] h-[48px] mb-[16px] flex items-center justify-center">
                  <StackIcon
                    width={24}
                    height={24}
                    className="text-[#479ebc]"
                    decorative={true}
                  />
                </div>
                <Heading
                  level={3}
                  className="text-[#222] text-[18px] font-semibold leading-[1.3] mb-[8px]"
                >
                  Resources
                </Heading>
                <p className="text-[#646467] text-[14px] leading-[1.5]">
                  Find technical documents and tools
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] md:gap-[16px] mt-[32px]">
            <div className="bg-white rounded-[8px] p-[24px] md:p-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] transition-shadow duration-150 hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div className="w-[48px] h-[48px] mb-[16px] flex items-center justify-center">
                <StackIcon
                  width={24}
                  height={24}
                  className="text-[#bc4747]"
                  decorative={true}
                />
              </div>
              <Heading
                level={3}
                className="text-[#222] text-[18px] font-semibold leading-[1.3] mb-[8px]"
              >
                Verification Status
              </Heading>
              <p className="text-[#646467] text-[14px] leading-[1.5]">
                Your verification is pending.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
