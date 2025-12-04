import { CreateLinkForm } from '@/components/dashboard/create-link-form'

export default function NewLinkPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create New Link</h1>
        <p className="text-gray-600 mt-1">Shorten a long URL and track its performance</p>
      </div>

      <CreateLinkForm />
    </div>
  )
}
