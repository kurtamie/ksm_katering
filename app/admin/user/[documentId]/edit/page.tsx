import StaffForm from "../../staff-form"
import { fetchStaffByDocumentId } from "@/features/admin/get-staff"

type PageProps = {
  params: Promise<{ documentId: string }>
}

export default async function Page({ params }: PageProps) {
  const { documentId } = await params
  const staff = await fetchStaffByDocumentId(documentId)

  return <StaffForm mode="edit" initialStaff={staff} />
}
