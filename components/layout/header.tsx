import Link from 'next/link';
import React, { Fragment } from 'react';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { RiSearchLine } from "react-icons/ri";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FiBell } from 'react-icons/fi';
import { ChevronDown } from 'lucide-react';
import { AiOutlineUser } from 'react-icons/ai';
import { LuStore } from 'react-icons/lu';
import { RxReader } from 'react-icons/rx';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { Label } from '../ui/label';
import Profile from "@/app/asset/profile.png"

export default function Header() {
  return (
    <div className="shadow-md w-full sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50">
      <div className="w-full mx-auto max-w-7xl px-4 gap-6 py-3 flex items-center justify-between">
        <div className="flex gap-2 items-start justify-items-start">
          <SidebarTrigger />
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Label className='text-black text-xs sm:text-xl font-bold'>KSM Katering Batam</Label>
          </Link>
          {/* <Badge variant="secondary" className="bg-red-500/10 w-14 h-6 text-red-500 dark:bg-red-500/20 dark:text-red-300 font-semibold text-[10px] sm:text-sm">
            Beta
          </Badge> */}
        </div>

        <form
          className="flex items-center w-full max-w-xl"
        >
          <Input
            className="w-full"
            placeholder="Cari"
          />
          <Button
            type="submit"
            className="cursor-pointer bg-gray-500 hover:bg-gray-400 ml-2"
          >
            <RiSearchLine className="text-white" />
          </Button>
        </form>

        <div className="flex items-center gap-4">
          <div className="relative">
            <FiBell
              role="button"
              className="cursor-pointer rounded-full w-6 h-6"
            />
          </div>

          <Fragment>
            <DropdownMenu>
              <DropdownMenuTrigger role="button">
                <div className="flex items-center gap-1">
                  <Image
                    className="!cursor-pointer !rounded-full border-gray-200 border-2 !w-8 !h-8"
                    src={Profile}
                    alt="User avatar"
                    width={32}
                    height={32}
                  />
                  <ChevronDown className="text-sm" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="my-4 bg-white dark:bg-gray-800 shadow-lg rounded-md">
                <DropdownMenuRadioItem value="profile" className="gap-3">
                  <Link href="/profile" className="flex items-center gap-3">
                    <AiOutlineUser className="text-xl" /> Akun Saya
                  </Link>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="history" className="gap-3">
                  <button
                    className="flex items-center gap-3 w-full text-left cursor-pointer">
                    <LuStore className="text-xl" />
                    Beralih ke Pemilik Barang
                  </button>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="theme" className="gap-3">
                  <Link
                    href="/order/complete"
                    className="flex items-center gap-3"
                  >
                    <RxReader className="text-xl" /> Riwayat Sewa
                  </Link>
                </DropdownMenuRadioItem>
                
                <DropdownMenuRadioItem value="theme" className="gap-3">
                  <Link
                    href="/report"
                    className="flex items-center gap-3"
                  >
                    <IoAlertCircleOutline  className="text-xl" /> Laporkan Masalah
                  </Link>
                </DropdownMenuRadioItem>

                <DropdownMenuSeparator className="w-full h-1 bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuRadioItem value="logout" className="gap-3">
                    <Button>Keluar</Button>
                </DropdownMenuRadioItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Fragment>
        </div>
      </div>
    </div>
  )
}
