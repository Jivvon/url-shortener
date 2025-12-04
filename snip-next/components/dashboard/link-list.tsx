'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/hooks/use-debounce' // We need to create this hook
import { toast } from 'sonner'

interface LinkItem {
  id: string
  title: string | null
  original_url: string
  short_code: string
  total_clicks: number
  created_at: string
  is_active: boolean
  short_url: string
}

interface LinkListProps {
  initialLinks: LinkItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function LinkList({ initialLinks, pagination }: LinkListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  // Debounce search update
  const handleSearch = (term: string) => {
    setSearch(term)
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    params.set('page', '1') // Reset to page 1
    router.push(`?${params.toString()}`)
  }

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl)
    toast.success('Copied to clipboard!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const res = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('Link deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete link')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Search links..."
            className="pl-10"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Link href="/dashboard/links/new">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Link
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Link Info</TableHead>
              <TableHead className="text-center">Clicks</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  No links found. Create one to get started!
                </TableCell>
              </TableRow>
            ) : (
              initialLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="max-w-md">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900 truncate" title={link.title || ''}>
                        {link.title || 'Untitled'}
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <a
                          href={link.short_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {link.short_code}
                        </a>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 truncate max-w-[200px]" title={link.original_url}>
                          {link.original_url}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {link.total_clicks.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${link.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {link.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopy(link.short_url)}>
                          Copy Short Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/links/${link.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <a href={link.short_url + '?qr=1'} target="_blank" rel="noreferrer">
                            QR Code
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(link.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('page', String(pagination.page - 1))
              router.push(`?${params.toString()}`)
            }}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('page', String(pagination.page + 1))
              router.push(`?${params.toString()}`)
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
