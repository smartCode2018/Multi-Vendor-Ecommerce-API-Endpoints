"use client";
import Link from "next/link";
import React from "react";
import { Search } from "lucide-react";
import ProfileIcon from "@/assets/svgs/profile-icon";
import WishListIcon from "@/assets/svgs/wishlist-icon";
import CartIcon from "@/assets/svgs/cart-icon";
import HeaderBottom from "./header-bottom";

import useUser from "@/hooks/useUser";

function Header() {
  const { user, isLoading } = useUser();
  return (
    <div className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-2xl font-[500]">E-Shop</span>
          </Link>
        </div>
        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search for products ..."
            className="w-full px-4 font-Poppins font-medium border-[2.0px] border-[#C6223B] outline-none h-[45px]"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[45px] bg-[#C6223B] absolute top-0 right-0">
            <Search color="#fff" />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            {!isLoading && user ? (
              <>
                <Link
                  className="border-2 w-[45px] h-[45px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                  href={"/profile"}
                >
                  <ProfileIcon />
                </Link>
                <Link href={"/profile"}>
                  <span className="block font-medium">Hello,</span>
                  <span className=" font-semibold">
                    {user?.name?.split(" ")[0]}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="border-2 w-[45px] h-[45px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                  href={"/login"}
                >
                  <ProfileIcon />
                </Link>
                <Link href={"/login"}>
                  <span className="block font-medium">Hello,</span>
                  <span className=" font-semibold">
                    {isLoading ? "..." : "Sign In"}
                  </span>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-5">
            <Link className="relative" href={"/wishlist"}>
              <WishListIcon />
              <span className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                0
              </span>
            </Link>
            <Link className="relative" href={"/cart"}>
              <CartIcon />
              <span className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-[#99999938]"></div>
      <HeaderBottom />
    </div>
  );
}

export default Header;
