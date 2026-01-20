"use client"
import React, { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const chartConfig = {
  nasiKotak: { label: "Nasi Kotak", color: "#2563eb" },
  prasmanan: { label: "Prasmanan", color: "#16a34a" },
  snack: { label: "Snack", color: "#f97316" },
  bento: { label: "Bento", color: "#dc2626" },
  custom: { label: "Custom", color: "#4b5563" },
  aqiqah: { label: "Aqiqah", color: "#9333ea" },
  tumpeng: { label: "Tumpeng", color: "#ec4899" },
  weddingCatering: { label: "Wedding Catering", color: "#f59e0b" },
  kateringKorporat: { label: "Katering Korporat", color: "#4f46e5" },
} satisfies Record<string, { label: string; color: string }>

type ChartKey = keyof typeof chartConfig

const chartLegendItems: { key: ChartKey; label: string }[] = [
  { key: "nasiKotak", label: "Nasi Kotak" },
  { key: "prasmanan", label: "Prasmanan" },
  { key: "snack", label: "Snack" },
  { key: "bento", label: "Bento" },
  { key: "custom", label: "Custom" },
  { key: "aqiqah", label: "Aqiqah" },
  { key: "tumpeng", label: "Tumpeng" },
  { key: "weddingCatering", label: "Wedding Catering" },
  { key: "kateringKorporat", label: "Katering Korporat" },
]

const chartData = [
  { month: "Jan", nasiKotak: 320, prasmanan: 140, snack: 90, bento: 70, custom: 60, aqiqah: 40, tumpeng: 30, weddingCatering: 50, kateringKorporat: 80 },
  { month: "Feb", nasiKotak: 240, prasmanan: 180, snack: 120, bento: 60, custom: 50, aqiqah: 35, tumpeng: 25, weddingCatering: 40, kateringKorporat: 70 },
  { month: "Mar", nasiKotak: 150, prasmanan: 90, snack: 60, bento: 40, custom: 45, aqiqah: 30, tumpeng: 20, weddingCatering: 35, kateringKorporat: 55 },
  { month: "Apr", nasiKotak: 320, prasmanan: 220, snack: 140, bento: 90, custom: 70, aqiqah: 50, tumpeng: 35, weddingCatering: 60, kateringKorporat: 95 },
  { month: "Mei", nasiKotak: 80, prasmanan: 210, snack: 110, bento: 60, custom: 55, aqiqah: 40, tumpeng: 30, weddingCatering: 45, kateringKorporat: 70 },
  { month: "Jun", nasiKotak: 320, prasmanan: 180, snack: 100, bento: 70, custom: 65, aqiqah: 45, tumpeng: 30, weddingCatering: 55, kateringKorporat: 85 },
  { month: "Jul", nasiKotak: 320, prasmanan: 140, snack: 80, bento: 60, custom: 55, aqiqah: 40, tumpeng: 30, weddingCatering: 50, kateringKorporat: 75 },
  { month: "Agu", nasiKotak: 240, prasmanan: 170, snack: 110, bento: 70, custom: 60, aqiqah: 45, tumpeng: 30, weddingCatering: 55, kateringKorporat: 80 },
  { month: "Sep", nasiKotak: 150, prasmanan: 90, snack: 70, bento: 50, custom: 45, aqiqah: 30, tumpeng: 20, weddingCatering: 40, kateringKorporat: 60 },
  { month: "Okt", nasiKotak: 320, prasmanan: 240, snack: 140, bento: 90, custom: 70, aqiqah: 50, tumpeng: 35, weddingCatering: 60, kateringKorporat: 95 },
  { month: "Nov", nasiKotak: 80, prasmanan: 210, snack: 120, bento: 70, custom: 60, aqiqah: 45, tumpeng: 30, weddingCatering: 55, kateringKorporat: 85 },
  { month: "Des", nasiKotak: 320, prasmanan: 180, snack: 110, bento: 80, custom: 65, aqiqah: 45, tumpeng: 30, weddingCatering: 60, kateringKorporat: 90 },
]

const handleMonthChange = (value: string) => {
  console.log(value);
};

function page() {
    const [selectedMonth, setSelectedMonth] = useState('current');
  
  return (
    <div className="bg-white w-full mx-auto relative">
        <div className="border-b border-black w-full">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Grafik</h1>
            </div>
          </div>
        </div>
        <div className='px-6 py-4 flex flex-col'>
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Bulan</SelectLabel>
                <SelectItem value="current">Bulan Ini</SelectItem>
                {months.map((month, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className='mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='bg-gray-300 p-4 gap-6 flex flex-col rounded-xl'>
              <h1 className='text-sm'>Pengguna Aktif</h1>
              <h1 className='text-lg font-semibold'>17</h1>
            </div>
            <div className='bg-gray-300 p-4 gap-6 flex flex-col rounded-xl'>
              <h1 className='text-sm'>Total Pesanan Bulan Ini</h1>
              <h1 className='text-lg font-semibold'>200</h1>
            </div>
            <div className='bg-gray-300 p-4 gap-6 flex flex-col rounded-xl'>
              <h1 className='text-sm'>Top Layanan Bulan Ini</h1>
              <h1 className='text-lg font-semibold'>Nasi Kotak</h1>
            </div>
            <div className='bg-gray-300 p-4 gap-6 flex flex-col rounded-xl'>
              <h1 className='text-sm'>Top Menu Masakan Bulan Ini</h1>
              <h1 className='text-lg font-semibold'>Nasi Kotak Paket A</h1>
            </div>
          </div>

          <div className='mt-4'>
            <div className='bg-gray-300 p-4 gap-4 rounded-xl flex flex-col'>
              <h1 className='text-lg'>Pesanan Masuk</h1>
              <div className='grid grid-cols-2 gap-4 mt-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9'>
                {chartLegendItems.map((item) => (
                  <div key={item.key} className='flex gap-4 items-center justify-center'>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: chartConfig[item.key].color }}
                    />
                    <h1 className='text-sm text-gray-600'>{item.label}</h1>
                  </div>
                ))}
              </div>
              <ChartContainer config={chartConfig} className="mt-6 h-[320px] w-full">
                <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="nasiKotak" stackId="total" fill="var(--color-nasiKotak)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="prasmanan" stackId="total" fill="var(--color-prasmanan)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="snack" stackId="total" fill="var(--color-snack)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bento" stackId="total" fill="var(--color-bento)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="custom" stackId="total" fill="var(--color-custom)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aqiqah" stackId="total" fill="var(--color-aqiqah)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tumpeng" stackId="total" fill="var(--color-tumpeng)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="weddingCatering" stackId="total" fill="var(--color-weddingCatering)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kateringKorporat" stackId="total" fill="var(--color-kateringKorporat)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
    </div>
  )
}

export default page
