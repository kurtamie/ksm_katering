"use client"
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { FaPlus } from 'react-icons/fa'
import Link from 'next/link'
import { IoIosCall } from 'react-icons/io'
import { IoChatbox } from 'react-icons/io5'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Trash2, X } from 'lucide-react'
import { fetchCustomers, type Customer } from '@/features/admin/get-customer'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const dynamic = "force-dynamic"

const getDisplayName = (customer: Customer) => {
  if (customer.name !== "-") return customer.name
  if (customer.company_name !== "-") return customer.company_name
  return "-"
}

const normalizePhoneForLink = (value: string) => {
  const digits = value.replace(/\D+/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('8')) return `62${digits}`
  return digits
}

export default function page() {
  const searchParams = useSearchParams()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const documentIdParam = searchParams.get("documentId") ?? searchParams.get("customerId") ?? searchParams.get("id")

  React.useEffect(() => {
    let isMounted = true

    const loadCustomers = async () => {
      const data = await fetchCustomers()
      if (isMounted) {
        setCustomers(data)
      }
    }

    loadCustomers()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    if (!documentIdParam || customers.length === 0) return

    const matched = customers.find((customer) =>
      customer.documentId === documentIdParam || String(customer.id) === documentIdParam
    )

    if (matched) {
      setSelectedCustomer(matched)
      setDrawerOpen(true)
    }
  }, [documentIdParam, customers])

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDrawerOpen(true)
  }

  const handleRefreshCustomers = async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchCustomers()
      setCustomers(data)
      toast.success("Data customer berhasil diperbarui")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui data customer"
      toast.error(message)
    } finally {
      setIsRefreshing(false)
    }
  }

  const editTarget = selectedCustomer?.documentId ?? (selectedCustomer?.id ? String(selectedCustomer.id) : "")
  const canEdit = Boolean(editTarget)

  return (
    <div className='bg-white w-full mx-auto'>
        <Toaster position="top-right" richColors />
        <div className='border-b-1 py-4 px-4 flex flex-col gap-2 md:flex-row md:justify-between max-w-7xl border-black w-full'>
            <div className="flex items-center gap-3">
              <h1 className='font-bold text-xl'>Manajemen Customer</h1>
              {/* <Button
                variant="outline"
                size="sm"
                className='cursor-pointer'
                onClick={handleRefreshCustomers}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Memuat..." : "Refresh"}
              </Button> */}
            </div>
            <div className='ml-0 flex gap-2'>
                <Link href={"/admin/customer/add"}>
                    <Button className='cursor-pointer bg-gray-400'><FaPlus />Tambah Customer</Button>
                </Link>
            </div>
        </div>
        <div className="mb-6 p-4">
          <Table className='border mt-2 mb-8'>
            <TableHeader>
              <TableRow>
                <TableHead>Gender</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead></TableHead>
                <TableHead className='text-center'>Nama Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    Belum ada data customer
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => {
                  const phoneLink = normalizePhoneForLink(customer.phone_no)
                  const hasPhone = phoneLink.length > 0

                  return (
                    <TableRow
                      key={customer.documentId ?? customer.id ?? customer.phone_no}
                      className="cursor-pointer"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <TableCell>{customer.gender}</TableCell>
                      <TableCell>{getDisplayName(customer)}</TableCell>
                      <TableCell className='flex items-center gap-4'>
                        {hasPhone ? (
                          <Button
                            asChild
                            className='cursor-pointer border text-black bg-white hover:bg-black hover:text-white'
                            variant="outline"
                            size="icon"
                          >
                            <a href={`tel:${phoneLink}`} onClick={(event) => event.stopPropagation()}>
                              <IoIosCall />
                            </a>
                          </Button>
                        ) : (
                          <Button
                            className='cursor-pointer border text-black bg-white'
                            variant="outline"
                            size="icon"
                            disabled
                          >
                            <IoIosCall />
                          </Button>
                        )}
                        {hasPhone ? (
                          <Button
                            asChild
                            className='cursor-pointer border text-black bg-white hover:bg-black hover:text-white'
                            variant="outline"
                            size="icon"
                          >
                            <a href={`https://wa.me/${phoneLink}`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                              <IoChatbox />
                            </a>
                          </Button>
                        ) : (
                          <Button
                            className='cursor-pointer border text-black bg-white'
                            variant="outline"
                            size="icon"
                            disabled
                          >
                            <IoChatbox />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className='text-center'>{customer.sales_name}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          <div className='flex justify-between mb-12'>
            <div className='flex justify-start'>
              <h1>Menampilkan: {customers.length === 0 ? 0 : 1} - {customers.length} Customer</h1>
            </div>
          </div>
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-full w-full max-w-[100vw] md:max-w-3xl ml-auto">
            <DrawerHeader className="border-b px-4 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <DrawerTitle className="text-xl font-bold">
                  {selectedCustomer ? getDisplayName(selectedCustomer) : "Detail Customer"}
                </DrawerTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="cursor-pointer h-9 whitespace-nowrap"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus customer?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Customer ini akan dihapus
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction>
                          Ya Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {canEdit ? (
                    <Link href={`/admin/customer/${editTarget}/edit`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="cursor-pointer h-9 whitespace-nowrap"
                      >
                        Edit
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer h-9 whitespace-nowrap"
                      disabled
                    >
                      Edit
                    </Button>
                  )}
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Tutup detail customer">
                      <X className="h-5 w-5" />
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
              {selectedCustomer && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailRow label="Nama Sales" value={selectedCustomer.sales_name} />
                    <DetailRow label="Gender" value={selectedCustomer.gender} />
                    <DetailRow label="Nama" value={selectedCustomer.name} />
                    <DetailRow label="Nama Instansi/Perusahaan" value={selectedCustomer.company_name} />
                    <DetailRow label="No. HP" value={selectedCustomer.phone_no} />
                    <DetailRow label="Instansi" value={selectedCustomer.company} />
                    <DetailRow label="Alamat" value={selectedCustomer.address} />
                    <DetailRow label="Latitude" value={selectedCustomer.latitude} />
                    <DetailRow label="Longitude" value={selectedCustomer.longitude} />
                    <DetailRow label="User" value={selectedCustomer.user_id} />
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-base font-normal">{value}</div>
    </div>
  )
}
