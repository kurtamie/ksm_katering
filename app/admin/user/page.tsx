"use client"
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Ban, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function page() {  
  const [selectedUser, setSelectedUser] = useState('current');
  const users = [
    'Pengguna Aktif', 'Diblokir', 'Tidak Aktif',
  ];

  return (
    <div className='bg-white w-full mx-auto'>
        <div className='border-b-1 py-4 px-4 max-w-7xl border-black w-full'>
            <h1 className='font-bold text-xl'>Manajemen Akun Internal</h1>
        </div>
        <div className="mb-6 p-4">
            <div className='gap-6 flex'>
                <Label>Status :</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>Status User</SelectLabel>
                    <SelectItem value="current">Pengguna Aktif</SelectItem>
                    {users.map((user, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                        {user}
                        </SelectItem>
                    ))}
                    </SelectGroup>
                </SelectContent>
                </Select>
            </div>
            <Table className='border mt-6 mb-8'>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-center'>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    <TableRow>
                      <TableCell className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        <span>Pak Matheus Cunha</span>
                      </TableCell>
                      <TableCell>admin123@gmail.com</TableCell>
                      <TableCell>Aktif</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            className='bg-white border border-gray-500 hover:bg-red-600 cursor-pointer hover:text-white' 
                            size="icon"
                          >
                            <Ban className="h-4 w-4 text-gray-500" />
                          </Button> 
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        <span>Pak Matheus Cunha</span>
                      </TableCell>
                      <TableCell>admin123@gmail.com</TableCell>
                      <TableCell>Aktif</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            className='bg-white border border-gray-500 hover:bg-red-600 cursor-pointer hover:text-white' 
                            size="icon"
                          >
                            <Ban className="h-4 w-4 text-gray-500" />
                          </Button> 
                        </div>
                      </TableCell>
                    </TableRow>
              </TableBody>
            </Table>

          <div className='flex justify-between mb-12'>
            <div className='flex justify-start'>
              <h1>Menampilkan: 2 - 2 Pengguna</h1>
            </div>
            <div className='flex justify-end'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
    </div>
  )
}
