"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useRouter, useParams } from 'next/navigation'
import { fetchMenuForEdit, updateMenu } from '@/features/admin/update-menu'
import { MenuFormValues } from "@/types/admin/menu"
import { toNullable } from "@/const/misc"

export default function page() {
  const router = useRouter()
  const params = useParams()
  const documentId = params.documentId as string
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoadingMenu, setIsLoadingMenu] = React.useState(false)
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

  React.useEffect(() => {
    if (!documentId) {
      toast.error("Document ID tidak ditemukan")
      return
    }

    const loadMenu = async () => {
      setIsLoadingMenu(true)
      try {
        const menu = await fetchMenuForEdit(documentId)
        setFormValues({
          packageName: menu.package_name || '',
          subname: menu.subname || '',
          description: menu.description || '',
          imageUrl: menu.image_url || '',
          price: menu.price || '',
          product: menu.product || '',
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal memuat data paket"
        toast.error(message)
      } finally {
        setIsLoadingMenu(false)
      }
    }

    loadMenu()
  }, [documentId])

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (!documentId) {
      toast.error("Document ID tidak ditemukan")
      return
    }

    const requiredMap: Array<[keyof MenuFormValues, string]> = [
      ['packageName', 'Nama Paket'],
      ['price', 'Harga'],
      ['product', 'Produk'],
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
        package_name: toNullable(formValues.packageName),
        subname: toNullable(formValues.subname),
        description: toNullable(formValues.description),
        image_url: toNullable(formValues.imageUrl),
        price: toNullable(formValues.price),
        product: toNullable(formValues.product),
      }

      const result = await updateMenu(documentId, payload)

      if (!result.success) {
        throw new Error(result.error || 'Gagal memperbarui paket')
      }

      toast.success('Paket berhasil diperbarui')
      router.push('/admin/menu')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui paket'
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
                <BreadcrumbPage>Edit Menu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className='bg-white mt-6 md:mt-8 flex flex-col px-4 md:px-8 rounded-lg'>
              <div className='flex flex-col py-4 md:py-6'>
                  <h1 className='font-bold text-lg md:text-xl text-gray-600'>EDIT MENU</h1>
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
                      <Label htmlFor="subname">Subname</Label>
                      <Input
                        type="text"
                        name="subname"
                        id="subname"
                        placeholder="Masukkan subname"
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
                      className='w-full md:w-auto bg-gray-400 text-white'
                      onClick={handleSubmit}
                      disabled={isSubmitting || isLoadingMenu}
                  >
                      {isSubmitting ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
                  </Button>
              </div>
          </div>
        </div>
    </div>
  )
}
