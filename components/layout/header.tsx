"use client"
import Link from 'next/link';
import React, { Fragment, useState } from 'react';
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
    <div className="shadow-md w-full sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50">
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

        {/* <form
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
        </form> */}

        <div className="flex items-center gap-4">
          {/* <div className="relative">
            <FiBell
              role="button"
              className="cursor-pointer rounded-full w-6 h-6"
            />
          </div> */}

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

                <DropdownMenuSeparator className="w-full h-1 bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuRadioItem value="logout" className="gap-3">
                  <LogoutButton onClick={() => setShowLogoutAlert(true)} />
                </DropdownMenuRadioItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Fragment>
        </div>
      </div>
    </div>
  )
}
