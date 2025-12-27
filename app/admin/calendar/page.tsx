"use client"

import { Label } from '@/components/ui/label';
import React, { useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Page() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState('current');
  const today = new Date();

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const weekDays = ['S', 'S', 'R', 'K', 'J', 'S', 'M']; // Senin s/d Minggu

  const events: Record<string, Array<{ title: string; color: string }>> = {
    '11': [{ title: 'Nasi Kotak', color: 'bg-gray-300' }, { title: 'Prasmanan', color: 'bg-gray-300' }],
    '16': [{ title: 'Nasi Kotak', color: 'bg-gray-300' }]
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    const isSameMonth = currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth();
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="border border-gray-200 min-h-[100px] bg-gray-50"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events[day.toString()] || [];
      const isToday = isSameMonth && day === today.getDate();
      
      days.push(
        <div
          key={day}
          className={cn(
            "border border-gray-200 min-h-[100px] p-2",
            isToday ? "bg-black/50" : "bg-white"
          )}
        >
          <div className={cn("mb-1 text-sm", isToday ? "text-white font-bold" : "text-gray-600")}>
            {day.toString().padStart(2, '0')}
          </div>
          <div className="space-y-1">
            {dayEvents.map((event, idx) => (
              <div
                key={idx}
                className={`${event.color} text-xs px-2 py-1 rounded text-gray-700`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white w-full mx-auto">
      <div className="border-b flex justify-between py-4 px-4 max-w-7xl border-gray-200 w-full mb-6">
        <h1 className="font-bold text-xl">Kalender Pesanan</h1>
      </div>

      <div className="gap-2 mb-6 flex items-center">
        <Label>Waktu</Label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-600">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0">
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="text-center py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center gap-0">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
}
