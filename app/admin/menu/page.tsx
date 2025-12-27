import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
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
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from '@/components/ui/button';
import { Check, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';

export default function page() {
  return (
    <div className='bg-white w-full mx-auto'>
        <div className='border-b-1 flex justify-between py-4 px-4 max-w-7xl border-black w-full'>
            <h1 className='font-bold text-xl'>Manajemen Menu</h1>
            <div className='ml-0 flex gap-2'>
                <Link href={"/admin/menu/add"}>
                    <Button className='cursor-pointer bg-gray-400'><FaPlus />Tambah Menu</Button>
                </Link>
            </div>
        </div>
        <Table className='border mt-6 mb-8'>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>No</TableHead>
                <TableHead className='text-center'>Nama Menu</TableHead>
                <TableHead className='text-center'>Harga</TableHead>
                <TableHead className='text-center'>Kategori</TableHead>
                <TableHead className='text-center'>Detail Menu</TableHead>
                <TableHead className='text-center'>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  <TableRow>
                    <TableCell className='text-center'>1</TableCell>
                    <TableCell className="flex items-center gap-3">
                      Nasi Kotak Paket A (Menu Ayam)
                    </TableCell>
                    <TableCell className='text-center'>Rp.25.000</TableCell>
                    <TableCell className='text-center'>Nasi Kotak
                    </TableCell>
                    <TableCell className='flex items-center justify-center'>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className='bg-white border border-gray-500 hover:bg-gray-600 cursor-pointer hover:text-white' size="icon">
                              <Eye className="h-4 w-4 text-gray-500" />
                            </Button> 
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
                            <AlertDialogHeader>
                              <AlertDialogTitle className='flex items-center justify-center font-bold'>Detail Barang</AlertDialogTitle>
                                <Carousel className="w-full max-w-xs mx-auto">
                                  <CarouselContent>
                                      <CarouselItem>
                                        <div className="p-1">
                                          <Card>
                                            <CardContent className="flex aspect-square items-center justify-center p-6">
                                              <Image
                                                src={"/asset/login.svg"}
                                                alt="barang"
                                                width={300}
                                                height={300}
                                                className="object-contain"
                                              />
                                            </CardContent>
                                          </Card>
                                        </div>
                                      </CarouselItem>
                                  </CarouselContent>
                                  <CarouselPrevious />
                                  <CarouselNext />
                                </Carousel>
                              <div className='flex flex-col space-y-4'>
                                <Badge className='text-[#EF3936] bg-[#FDECEC] mt-6 h-8'>Nasi Kotak</Badge>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-20'>
                                  <h1 className='font-bold break-words'>Lauk</h1>
                                  <h1 className='text-[#EF4444] font-bold'>Rp50.000</h1>
                                </div>

                                <h1 className='text-sm break-words'>Enak</h1>

                                <div>
                                  <h1 className='font-bold'>Deskripsi Detail</h1>
                                  <h1 className='text-sm break-words'>Enak</h1>
                                </div>
                              </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Tutup</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          className='bg-white border border-gray-500 hover:bg-gray-600 text-gray-500 cursor-pointer hover:text-white' 
                        >
                          <Label>Edit</Label>
                        </Button>
                        <Button 
                          className='bg-gray-500 hover:bg-gray-600 cursor-pointer hover:text-white'
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className='text-center'>2</TableCell>
                    <TableCell className="flex items-center gap-3">
                      Nasi Kotak Paket A (Menu Ayam)
                    </TableCell>
                    <TableCell className='text-center'>Rp.25.000</TableCell>
                    <TableCell className='text-center'>Nasi Kotak
                    </TableCell>
                    <TableCell className='flex items-center justify-center'>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className='bg-white border border-gray-500 hover:bg-gray-600 cursor-pointer hover:text-white' size="icon">
                              <Eye className="h-4 w-4 text-gray-500" />
                            </Button> 
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
                            <AlertDialogHeader>
                              <AlertDialogTitle className='flex items-center justify-center font-bold'>Detail Barang</AlertDialogTitle>
                                <Carousel className="w-full max-w-xs mx-auto">
                                  <CarouselContent>
                                      <CarouselItem>
                                        <div className="p-1">
                                          <Card>
                                            <CardContent className="flex aspect-square items-center justify-center p-6">
                                              <Image
                                                src={"/asset/login.svg"}
                                                alt="barang"
                                                width={300}
                                                height={300}
                                                className="object-contain"
                                              />
                                            </CardContent>
                                          </Card>
                                        </div>
                                      </CarouselItem>
                                  </CarouselContent>
                                  <CarouselPrevious />
                                  <CarouselNext />
                                </Carousel>
                              <div className='flex flex-col space-y-4'>
                                <Badge className='text-[#EF3936] bg-[#FDECEC] mt-6 h-8'>Nasi Kotak</Badge>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-20'>
                                  <h1 className='font-bold break-words'>Lauk</h1>
                                  <h1 className='text-[#EF4444] font-bold'>Rp50.000</h1>
                                </div>

                                <h1 className='text-sm break-words'>Enak</h1>

                                <div>
                                  <h1 className='font-bold'>Deskripsi Detail</h1>
                                  <h1 className='text-sm break-words'>Enak</h1>
                                </div>
                              </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Tutup</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          className='bg-white border border-gray-500 hover:bg-gray-600 text-gray-500 cursor-pointer hover:text-white' 
                        >
                          <Label>Edit</Label>
                        </Button>
                        <Button 
                          className='bg-gray-500 hover:bg-gray-600 cursor-pointer hover:text-white'
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
            </TableBody>
          </Table>

          <div className='flex justify-between mb-12'>
            <div className='flex justify-start'>
              <h1>Menampilkan: 2 - 2 Menu</h1>
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
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
    </div>
  )
}
