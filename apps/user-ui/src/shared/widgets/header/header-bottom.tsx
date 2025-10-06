"use client";
import CartIcon from "@/assets/svgs/cart-icon";
import ProfileIcon from "@/assets/svgs/profile-icon";
import WishListIcon from "@/assets/svgs/wishlist-icon";
import { navItems } from "@/configs/constants";
import useUser from "@/hooks/useUser";
import { AlignLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function HeaderBottom() {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading } = useUser();

  //Track scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky ? "fixed top-0 left-0 z-100 bg-white shadow-lg" : "relative"
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        {/* All Dropdown */}
        <div
          className={`w-[260px] ${
            isSticky && "-mb-2"
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#C6223B]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" size={20} />
            <span className="text-white font-medium">All Categories</span>
          </div>
          <ChevronDown color="white" size={20} />
        </div>
        {/* Dropdown Menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? "top-[70px]" : "top-[50px]"
            } w-[260px] h-[400px] bg-[#f5f5f5]`}
          ></div>
        )}

        {/* Navigation Links */}
        <div className="flex items-center">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className="px-5 font-medium text-lg"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>

        <div>
          {isSticky && (
            <div className="flex items-center gap-8 pb-2">
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
                  <span className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
                    0
                  </span>
                </Link>
                <Link className="relative" href={"/cart"}>
                  <CartIcon />
                  <span className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
                    0
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeaderBottom;
