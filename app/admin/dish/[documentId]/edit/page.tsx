"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useRouter, useParams } from 'next/navigation'
import { fetchDishByDocumentId } from '@/features/get-dish'
import { updateDish } from '@/features/update-dish'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { dishTypeOptions } from '@/app/admin/dish/dish-constants'

type FormValues = {
  name: string
  type: string
}

const toNullable = (value: string) => {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export default function page() {
  const router = useRouter()
  const params = useParams()
  const documentId = params.documentId as string
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoadingDish, setIsLoadingDish] = React.useState(false)
  const [formValues, setFormValues] = React.useState<FormValues>({
    name: '',
    type: '',
  })

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  React.useEffect(() => {
    if (!documentId) {
      toast.error("Document ID tidak ditemukan")
      return
    }

    const loadDish = async () => {
      setIsLoadingDish(true)
      try {
        const dish = await fetchDishByDocumentId(documentId)
        if (!dish) {
          throw new Error('Data lauk tidak ditemukan')
        }
        setFormValues({
          name: dish.name || '',
          type: dish.type || '',
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal memuat data lauk"
        toast.error(message)
      } finally {
        setIsLoadingDish(false)
      }
    }

    loadDish()
  }, [documentId])

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (!documentId) {
      toast.error("Document ID tidak ditemukan")
      return
    }

    const requiredMap: Array<[keyof FormValues, string]> = [
      ['name', 'Nama Lauk'],
      ['type', 'Jenis'],
    ]

    const missingFields = requiredMap
      .filter(([key]) => !formValues[key].trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      toast.error(`Lengkapi field: ${missingFields.join(', ')}`)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: toNullable(formValues.name),
        type: toNullable(formValues.type),
      }

      const result = await updateDish(documentId, payload)

      if (!result.success) {
        throw new Error(result.error || 'Gagal memperbarui lauk')
      }

      toast.success('Lauk berhasil diperbarui')
      router.push('/admin/dish')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui lauk'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full bg-[#F5F5F5]'>
        <Toaster position="top-right" richColors />
        <div className='container w-full md:w-full mx-auto px-4 py-6'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="text-gray-500">
                <BreadcrumbLink href="/admin/dish">KSM Katering</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Lauk</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className='bg-white mt-6 md:mt-8 flex flex-col px-4 md:px-8 rounded-lg'>
              <div className='flex flex-col py-4 md:py-6'>
                  <h1 className='font-bold text-lg md:text-xl text-gray-600'>EDIT LAUK</h1>
                  <div className="w-full h-px bg-gray-200 my-4 md:my-6"></div>
              </div>
              <div className='w-full mb-6 md:mb-8'>
                  <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                      <Label htmlFor="dish_name">Nama Lauk *</Label>
                      <Input
                        type="text"
                        name="dish_name"
                        id="dish_name"
                        placeholder="Masukkan nama lauk"
                        required
                        value={formValues.name}
                        onChange={(e) => updateField('name', e.target.value)}
                      />
                  </div>
                  <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                      <Label htmlFor="dish_type">Jenis *</Label>
                      <Select value={formValues.type} onValueChange={(value) => updateField('type', value)}>
                        <SelectTrigger className="w-full" id="dish_type">
                          <SelectValue placeholder="Pilih jenis lauk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Jenis Lauk</SelectLabel>
                            {dishTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                  </div>
                  <Button
                      className='w-full md:w-auto bg-gray-400 text-white'
                      onClick={handleSubmit}
                      disabled={isSubmitting || isLoadingDish}
                  >
                      {isSubmitting ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
                  </Button>
              </div>
          </div>
        </div>
    </div>
  )
}
