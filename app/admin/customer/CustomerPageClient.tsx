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
import { Edit, Trash2, X } from 'lucide-react'
import { fetchCustomers, type Customer } from '@/features/admin/get-customer'
import { getCurrentUser } from '@/features/admin/create-order'
import { getPermissions } from '@/const/permissions'
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

// Harus tetap sinkron dengan opsi <SelectItem value="..."> di form
// tambah/edit pelanggan (mis. customer-form.tsx / [documentId]/edit/page.tsx).
// customer.gender yang tersimpan adalah kode (value), bukan label yang
// ditampilkan ke user, jadi perlu dipetakan dulu sebelum ditampilkan di sini.
const GENDER_LABELS: Record<string, string> = {
  kak: "Kak",
  bang: "Bang",
  bu: "Bu",
  bp: "Pak",
}

const getGenderLabel = (value: string) => {
  if (!value || value === "-") return "-"
  return GENDER_LABELS[value.toLowerCase()] ?? value
}

export default function CustomerPageClient() {
  const searchParams = useSearchParams()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [canManage, setCanManage] = React.useState(false)
  const documentIdParam = searchParams.get("documentId") ?? searchParams.get("customerId") ?? searchParams.get("id")
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

  React.useEffect(() => {
    let isMounted = true

    const loadCurrentUser = async () => {
      const user = await getCurrentUser()
      if (!isMounted) return
      setCanManage(
        getPermissions(user?.staff?.position ?? null, user?.staff?.department ?? null)
          .canManageCustomers
      )
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

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
      toast.success("Data pelanggan berhasil diperbarui")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui data pelanggan"
      toast.error(message)
    } finally {
      setIsRefreshing(false)
    }
  }

  const editTarget = selectedCustomer?.documentId ?? (selectedCustomer?.id ? String(selectedCustomer.id) : "")
  const hasEditTarget = Boolean(editTarget)

  return (
    <div className='bg-white w-full mx-auto'>
        <Toaster position="top-right" richColors />
        <div className='border-b-1 py-4 px-4 flex flex-col gap-2 md:flex-row md:justify-between max-w-7xl border-black w-full'>
            <div className="flex items-center gap-3">
              <h1 className='font-bold text-xl'>Manajemen Pelanggan</h1>
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
                {canManage && (
                  <Link href={"/admin/customer/add"}>
                      <Button className='cursor-pointer'><FaPlus />Tambah Pelanggan</Button>
                  </Link>
                )}
            </div>
        </div>
        <div className="mb-6 p-4">
          <Table className='border mt-2 mb-8'>
            <TableHeader>
              <TableRow>
                <TableHead>Sapaan Pelanggan</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis Pelanggan</TableHead>
                <TableHead></TableHead>
                {/* <TableHead className='text-center'>Nama Sales</TableHead> */}
                {canManage && <TableHead className='text-center'>Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    Belum ada data pelanggan
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => {
                  const phoneLink = normalizePhoneForLink(customer.phone_no)
                  const hasPhone = phoneLink.length > 0
                  const editTargetRow = customer.documentId ?? (customer.id ? String(customer.id) : "")
                  const hasEditTargetRow = Boolean(editTargetRow)
                  return (
                    <TableRow
                      key={customer.documentId ?? customer.id ?? customer.phone_no}
                      className="cursor-pointer"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <TableCell>{getGenderLabel(customer.gender)}</TableCell>
                      <TableCell>{getDisplayName(customer)}</TableCell>
                      <TableCell>{customer.company}</TableCell>
                      <TableCell className='flex items-center gap-4'>
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
                      {/* <TableCell className='text-center'>{customer.sales_name}</TableCell> */}
                                {canManage && (
            <TableCell>
              <div className="flex gap-2 justify-center">
                {hasEditTargetRow && (
                  <Link href={`/admin/customer/${editTargetRow}/edit`} onClick={(event) => event.stopPropagation()}>
                    <Button
                      className='bg-white border border-red-700 text-red-700 hover:bg-red-700 hover:text-white cursor-pointer'
                      size="icon"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className='cursor-pointer'
                      size="icon"
                      disabled={!hasEditTargetRow}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus pelanggan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {getDisplayName(customer)} akan dihapus. Tindakan ini tidak bisa dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction>
                        Ya, Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          <div className='flex justify-between mb-12'>
            <div className='flex justify-start'>
              <h1>Menampilkan: {customers.length === 0 ? 0 : 1} - {customers.length} Pelanggan</h1>
            </div>
          </div>
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-full w-full max-w-[100vw] md:max-w-3xl ml-auto">
            <DrawerHeader className="border-b px-4 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <DrawerTitle className="text-xl font-bold">
                  {selectedCustomer ? getDisplayName(selectedCustomer) : "Detail Pelanggan"}
                </DrawerTitle>
                  <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Tutup detail pelanggan">
                          <X className="h-5 w-5" />
                        </Button>
                      </DrawerClose>
                    </div>
                  </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
              {selectedCustomer && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* <DetailRow label="Nama Sales" value={selectedCustomer.sales_name} /> */}
                    <DetailRow label="Sapaan Pelanggan" value={getGenderLabel(selectedCustomer.gender)} />
                    <DetailRow label="Nama" value={selectedCustomer.name} />
                    <DetailRow label="Nama Instansi/Perusahaan" value={selectedCustomer.company_name} />
                    <DetailRow label="Nomor Telepon" value={selectedCustomer.phone_no} />
                    <DetailRow label="Instansi" value={selectedCustomer.company} />
                    <DetailRow label="Alamat" value={selectedCustomer.address} />
                    <DetailRow label="Lintang" value={selectedCustomer.latitude} />
                    <DetailRow label="Bujur" value={selectedCustomer.longitude} />
                    {/* <DetailRow label="User" value={selectedCustomer.user_id} /> */}
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