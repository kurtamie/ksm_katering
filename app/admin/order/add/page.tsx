import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

export default function page() {
  return (
    <div className='w-full bg-[#F5F5F5]'>
        <div className='container w-full md:w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-14 py-6'>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className='text-gray-500'>
                        <BreadcrumbLink href="/admin/order">KSM Katering</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Form Pesanan</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className='bg-white mt-6 md:mt-8 flex flex-col px-4 md:px-8 rounded-lg'>
                <div className='flex flex-col py-4 md:py-6'>
                    <h1 className='font-bold text-lg md:text-xl text-[#F7A2A3]'>FORM PESANAN</h1>
                    <div className="w-full h-px bg-gray-200 my-4 md:my-6"></div>
                </div>
                <div className='w-full mb-6 md:mb-8'>
                    <div className='flex flex-col md:flex-row mb-6 md:mb-8 gap-4 md:gap-8'>
                        <div className="grid w-full max-w-full items-center gap-1.5">
                            <Label htmlFor="nama">Nomor Order *</Label>
                            <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                        </div>
                        <div className="grid w-full max-w-full items-center gap-1.5">
                            <Label htmlFor="nama">Customer ID</Label>
                            <Input type="text" name="nama" id="nama" placeholder="Nama belakang" required />
                        </div>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Kategori Produk *</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Nama Paket *</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <Button 
                        className='w-full md:w-auto bg-gray-400 text-white cursor-not-allowed'
                        disabled
                    >
                        SELANJUTNYA
                    </Button>
                </div>
            </div>
        </div>
    </div>
  )
}
