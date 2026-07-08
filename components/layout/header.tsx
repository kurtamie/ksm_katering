"use client"
import Link from 'next/link';
import React, { Fragment, useState } from 'react';
import Image from 'next/image';
import {
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import { AiOutlineUser } from 'react-icons/ai';
import { Label } from '../ui/label';
import Profile from "@/app/asset/profile.png"
import logo from "@/app/asset/logo.png";
import { LogoutButton } from '../custom/logout-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { logoutAction } from '@/app/data/actions/auth-actions';

export default function Header() {
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  return (
    <div className="shadow-md w-full sticky top-0 bg-[#8D0000] dark:bg-[#8D0000] backdrop-blur-md z-50">
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin ingin keluar?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda perlu masuk kembali untuk menggunakan layanan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <form action={logoutAction}>
              <AlertDialogAction asChild>
                <button type="submit" className="bg-red-600 w-full hover:bg-red-700">
                  Keluar
                </button>
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="w-full px-4 sm:px-6 lg:px-8 gap-6 py-3 flex items-center justify-between">
        {/* Desktop: Text */}
        <div className="hidden md:flex gap-2 items-start justify-items-start">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Label className='text-white text-xs sm:text-xl font-bold'>KSM Katering Batam</Label>
          </Link>
        </div>

        {/* Mobile: Logo (centered) */}
        <div className="flex md:hidden w-full items-center">
          <div className="flex-1 flex justify-center">
            <Link
              href="/dashboard"
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <Image
                src={logo}
                alt="KSM Katering"
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>
        </div>

        {/* Desktop: Profile Dropdown */}
        <div className="hidden md:flex items-center gap-4">
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
                  <ChevronDown className="text-sm text-white" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="my-4 min-w-0 w-fit bg-white dark:bg-gray-800 shadow-lg rounded-md">
                {/* <DropdownMenuRadioItem value="profile" className="gap-3">
                  <Link href="/admin/account" className="flex items-center gap-3">
                    <AiOutlineUser className="text-xl" /> Akun Saya
                  </Link>
                </DropdownMenuRadioItem> */}
{/* 
                <DropdownMenuSeparator className="w-full h-1 bg-gray-200 dark:bg-gray-700" /> */}
                <DropdownMenuItem value="logout" className="gap-3">
                  <LogoutButton onClick={() => setShowLogoutAlert(true)} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Fragment>
        </div>
      </div>
    </div>
  )
}