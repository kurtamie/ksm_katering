"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createDish } from '@/features/admin/create-dish'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useRouter } from 'next/navigation'
import { DishFormValues } from '@/types/admin/dish'
import { dishTypeOptions,serviceOptions } from '@/const/admin/dish'
import { toNullable } from '@/const/misc'

export default function page() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formValues, setFormValues] = React.useState<DishFormValues>({
    name: '',
    type: '',
    service: '',
  })

  const updateField = <K extends keyof DishFormValues>(field: K, value: DishFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    const requiredMap: Array<[keyof DishFormValues, string]> = [
      ['name', 'Nama menu'],
      ['type', 'Jenis'],
    ]

    const missingFields = requiredMap
      .filter(([key]) => !formValues[key].trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      toast.error(`Lengkapi data: ${missingFields.join(', ')}`)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: toNullable(formValues.name),
        type: toNullable(formValues.type),
        service: toNullable(formValues.service),
      }

      const result = await createDish(payload)

      if (!result.success) {
        throw new Error(result.error || 'Gagal menyimpan menu')
      }

      toast.success('menu berhasil dibuat')
      router.push('/admin/dish')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan menu'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full bg-[#F5F5F5]'>
        <Toaster position="top-right" richColors />
        <div className='border-b-1 py-4 px-4 max-w-7xl border-black w-full'>
            <h1 className='font-bold text-xl'>Informasi menu</h1>
        </div>
        <div className='container w-full md:w-full mx-auto px-4 py-2'>
            <div className='bg-white mt-6 md:mt-8 flex flex-col px-4 md:px-8 rounded-lg'>
                <div className='w-full mb-6 md:mb-8 py-4 md:py-6'>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="dish_name">Nama menu <span className="text-red-500">*</span></Label>
                        <Input
                          type="text"
                          name="dish_name"
                          id="dish_name"
                          placeholder="Masukkan nama menu"
                          required
                          value={formValues.name}
                          onChange={(e) => updateField('name', e.target.value)}
                        />
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                        <Label htmlFor="dish_type">Jenis <span className="text-red-500">*</span></Label>
                        <Select value={formValues.type} onValueChange={(value) => updateField('type', value)}>
                          <SelectTrigger className="w-full" id="dish_type">
                            <SelectValue placeholder="Pilih jenis menu" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Jenis Menu</SelectLabel>
                              {dishTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                    <Label htmlFor="dish_service">Layanan</Label>
                    <Select value={formValues.service} onValueChange={(value) => updateField('service', value)}>
                      <SelectTrigger className="w-full" id="dish_service">
                        <SelectValue placeholder="Pilih layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Layanan</SelectLabel>
                          {serviceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                </div>
                    <Button 
                        className='w-full md:w-auto'
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Menyimpan...' : 'SIMPAN'}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  )
}
