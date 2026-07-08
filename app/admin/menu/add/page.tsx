"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import { createMenu } from '@/features/admin/create-menu'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useRouter } from 'next/navigation'
import { MenuFormValues } from "@/types/admin/menu"
import { toNullable } from "@/const/misc"

export default function page() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formValues, setFormValues] = React.useState<MenuFormValues>({
    packageName: '',
    subname: '',
    description: '',
    imageUrl: '',
    price: '',
    product: '',
  })

  const updateField = <K extends keyof MenuFormValues>(field: K, value: MenuFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    const requiredMap: Array<[keyof MenuFormValues, string]> = [
      ['packageName', 'Nama Paket'],
      ['price', 'Harga'],
      ['product', 'Layanan'],
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
        package_name: toNullable(formValues.packageName),
        subname: toNullable(formValues.subname),
        description: toNullable(formValues.description),
        image_url: toNullable(formValues.imageUrl),
        price: toNullable(formValues.price),
        product: toNullable(formValues.product),
      }

      const result = await createMenu(payload)

      if (!result.success) {
        throw new Error(result.error || 'Gagal menyimpan paket')
      }

      toast.success('Paket berhasil dibuat')
      router.push('/admin/menu')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan paket'
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
                <BreadcrumbLink href="/admin/menu">KSM Katering</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Form Menu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className='bg-white mt-6 md:mt-8 flex flex-col px-4 md:px-8 rounded-lg'>
              <div className='flex flex-col py-4 md:py-6'>
                  <h1 className='font-bold text-lg md:text-xl text-gray-600'>FORM MENU</h1>
                  <div className="w-full h-px bg-gray-200 my-4 md:my-6"></div>
              </div>
              <div className='w-full mb-6 md:mb-8'>
                  <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                      <Label htmlFor="package_name">Nama Paket *</Label>
                      <Input
                        type="text"
                        name="package_name"
                        id="package_name"
                        placeholder="Masukkan nama paket"
                        required
                        value={formValues.packageName}
                        onChange={(e) => updateField('packageName', e.target.value)}
                      />
                  </div>
                  <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                      <Label htmlFor="subname">Jenis Menu</Label>
                      <Input
                        type="text"
                        name="subname"
                        id="subname"
                        placeholder="Masukkan jenis menu"
                        value={formValues.subname}
                        onChange={(e) => updateField('subname', e.target.value)}
                      />
                  </div>
                  <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                      <Label htmlFor="product">Produk *</Label>
                      <Input
                        type="text"
                        name="product"
                        id="product"
                        placeholder="Masukkan kategori produk"
                        required
                        value={formValues.product}
                        onChange={(e) => updateField('product', e.target.value)}
                      />
                  </div>
                  <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                      <Label htmlFor="price">Harga *</Label>
                      <Input
                        type="text"
                        name="price"
                        id="price"
                        placeholder="Masukkan harga"
                        required
                        value={formValues.price}
                        onChange={(e) => updateField('price', e.target.value)}
                      />
                  </div>
                  <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                      <Label htmlFor="image_url">URL Gambar</Label>
                      <Input
                        type="text"
                        name="image_url"
                        id="image_url"
                        placeholder="https://"
                        value={formValues.imageUrl}
                        onChange={(e) => updateField('imageUrl', e.target.value)}
                      />
                  </div>
                  <div className="grid w-full max-w-full items-center gap-1.5 mb-6 md:mb-8">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        name="description"
                        id="description"
                        placeholder="Masukkan deskripsi paket"
                        value={formValues.description}
                        onChange={(e) => updateField('description', e.target.value)}
                      />
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
