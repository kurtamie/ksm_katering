import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

export default function page() {
  return (
    <div className='w-full bg-[#F5F5F5]'>
        <div className='border-b-1 py-4 px-4 max-w-7xl border-black w-full'>
            <h1 className='font-bold text-xl'>Informasi Menu</h1>
        </div>
        <div className='container w-full md:w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-14 py-6'>
            <div className='bg-white mt-6 md:mt-8 flex flex-col px-4 md:px-8 rounded-lg'>
                <div className='w-full mb-6 md:mb-8 py-4 md:py-6'>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Nama Menu *</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Harga</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama belakang" required />
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
