"use client";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, {useState} from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from 'lucide-react';
import MapCoordinatePicker from '@/components/custom/Coordinate-input';
import type { Coordinate } from '@/types/coordinate';

export default function page() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date>(new Date());
  const [selectedCustomer, setSelectedCustomer] = React.useState('current');
  const [month, setMonth] = React.useState(new Date());
  
  const customers = [
    '123 - Pak de', '234 - De Pak', '345 - Pak de Pak' 
  ];
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setOpen(false);
    }
  };

  return (
    <div className='w-full bg-[#F5F5F5]'>
        <div className='container w-full md:w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-2 py-6'>
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
                    <h1 className='font-bold text-lg md:text-xl text-gray-600'>FORM PESANAN</h1>
                    <div className="w-full h-px bg-gray-200 my-4 md:my-6"></div>
                </div>
                <div className='w-full mb-6 md:mb-8'>
                    <div className='flex flex-col md:flex-row mb-6 md:mb-8 gap-4 md:gap-8'>
                        <div className="grid w-full max-w-full items-center gap-1.5">
                            <Label htmlFor="nama">Nomor Order *</Label>
                            <Input type="text" name="nama" id="nama" placeholder="Nomor order" required />
                        </div>
                        <div className="grid w-full max-w-full items-center gap-1.5">
                            <Label htmlFor="nama">Customer ID</Label>
                            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    <SelectLabel>Customer ID</SelectLabel>
                                    {customers.map((customer, idx) => (
                                        <SelectItem key={idx} value={idx.toString()}>
                                        {customer}
                                        </SelectItem>
                                    ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="bulan">Bulan</Label>
                        <Input type="text" name="bulan" id="bulan" placeholder="Bulan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Golongan Customer </Label>
                        <ToggleGroup type='multiple' variant='outline' spacing={2} size='sm'>
                            <ToggleGroupItem value='pemerintah' className='data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-gray-500 data-[state=on]:*:[svg]:stroke-gray-500'>
                                Pemerintah
                            </ToggleGroupItem>
                            <ToggleGroupItem value='swasta' className='data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-gray-500 data-[state=on]:*:[svg]:stroke-gray-500'>
                                Swasta
                            </ToggleGroupItem>
                            <ToggleGroupItem value='personal' className='data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-gray-500 data-[state=on]:*:[svg]:stroke-gray-500'>
                                Personal
                            </ToggleGroupItem>
                            <ToggleGroupItem value='bumn' className='data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-gray-500 data-[state=on]:*:[svg]:stroke-gray-500'>
                                BUMN
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Golongan Customer </Label>
                        <ToggleGroup type='multiple' variant='outline' spacing={2} size='sm'>
                            <ToggleGroupItem value='pemerintah' className='data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-gray-500 data-[state=on]:*:[svg]:stroke-gray-500'>
                                Tim Kotak
                            </ToggleGroupItem>
                            <ToggleGroupItem value='swasta' className='data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-gray-500 data-[state=on]:*:[svg]:stroke-gray-500'>
                                Tim Eksekusi
                            </ToggleGroupItem>
                            <ToggleGroupItem value='personal' className='data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-gray-500 data-[state=on]:*:[svg]:stroke-gray-500'>
                                Tim Snack
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Supplier</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Customer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Customer ID</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Produk</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Customer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Customer ID</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Qty *</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Harga Jual (dlm ribuan)*</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Fee Jasa Broker</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Harga untuk KSM</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Harga jual minimal</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Jumlah</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Delivery Charga</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Jumlah Total</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Keterangan</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Keterangan</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama"> Nasi</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih nasi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Nasi</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Nasi putih, nasi padang</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Lauk Utama</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Tambahan</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Sayur</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Sambal</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Kerupuk</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Buah</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Air Mineral</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Kotak</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Puding</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Snack</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Label className='text-xs italic text-gray-500'>Recommend: Ayam bakar padang, Ayam goreng batuaji, Ayam gulai piayu</Label>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Tanggal Kirim*</Label>
                        <div className="relative flex gap-2">
                            <Input
                                id="date"
                                value={date.toLocaleDateString('id-ID', { 
                                    day: '2-digit',
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                                placeholder="Pilih tanggal"
                                className="bg-background pr-10"
                                readOnly
                            />
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date-picker"
                                        variant="ghost"
                                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                        >
                                        <CalendarIcon className="size-3.5" />
                                        <span className="sr-only">Select date</span>
                                    </Button>
                                </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    captionLayout="dropdown"
                                    month={month}
                                    onMonthChange={setMonth}
                                />
                            </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Jam Sampai</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Customer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Customer ID</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Berangkat</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required readOnly/>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Nama Penerima</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">no. HP Penerima</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Alamat Pengiriman</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama depan" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <MapCoordinatePicker/>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Driver</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih lauk utama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Lauk Utama</SelectLabel>
                                {customers.map((customer, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                    {customer}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">no. Surat Jalan</Label>
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
