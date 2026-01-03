"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from 'lucide-react';

export default function page() {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date>(new Date());
    const [month, setMonth] = React.useState(new Date());

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDate(selectedDate);
            setOpen(false);
        }
    };
  return (
    <div className='w-full bg-[#F5F5F5]'>
        <div className='border-b-1 py-4 px-4 max-w-7xl border-black w-full'>
            <h1 className='font-bold text-xl'>Tambah Customer</h1>
        </div>
        <div className='container w-full md:w-full mx-auto px-4 py-2'>
            <div className='bg-white mt-6 md:mt-8 flex flex-col px-4 md:px-8 rounded-lg'>
                <div className='w-full mb-6 md:mb-8 py-4 md:py-6'>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="id">ID*</Label>
                        <Input type="text" name="id" id="id" placeholder="Masukkan ID" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Nama Sales</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama belakang" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Kategori Produk *</Label>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Gender</SelectLabel>
                                    <SelectItem value="kak">Kak</SelectItem>
                                    <SelectItem value="bang">Bang</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Nama Instansi/Perusahaan</Label>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Gender</SelectLabel>
                                    <SelectItem value="kak">Kak</SelectItem>
                                    <SelectItem value="bang">Bang</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">no. HP*</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama belakang" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Instansi</Label>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Gender</SelectLabel>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="bumn">BUMN</SelectItem>
                                    <SelectItem value="swasta">Swasta</SelectItem>
                                    <SelectItem value="pariwisata">Pariwisata</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">Alamat</Label>
                        <Input type="text" name="nama" id="nama" placeholder="Nama belakang" required />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="nama">1st order date</Label>
                        <div className="relative flex gap-2">
                            <Input
                                id="date"
                                value={date.toLocaleDateString('id-ID', { 
                                    day: '2-digit',
                                    month: 'numeric', 
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
