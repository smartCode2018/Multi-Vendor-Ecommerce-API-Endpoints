import Link from "next/link";
import React from "react";

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href: string;
}

function SidebarItem({ icon, title, isActive, href }: Props) {
  return (
    <Link href={href} className="my-2 block">
      <div
        className={`flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:bg-[#2b2f31]
            ${
              isActive &&
              "scale-[.98] bg-[#580f0f] fill-red-200 hover:!bg-[#580f0fd6]"
            } `}
      >
        {icon}
        <h5 className="text-slate-200 text-md">{title}</h5>
      </div>
    </Link>
  );
}

export default SidebarItem;
