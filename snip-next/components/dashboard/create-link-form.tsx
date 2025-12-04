'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLinkSchema, type CreateLinkInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { toast } from 'sonner'

export function CreateLinkForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<CreateLinkInput>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      url: '',
      title: '',
      customCode: '',
    },
  })

  const onSubmit = async (data: CreateLinkInput) => {
    setLoading(true)
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create link')
      }

      toast.success('Link created successfully!')
      router.push('/dashboard/links')
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/long-url" {...field} />
                </FormControl>
                <FormDescription>
                  The long URL you want to shorten
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Link" {...field} />
                </FormControl>
                <FormDescription>
                  A friendly name to help you identify this link
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Alias (Optional)</FormLabel>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm bg-gray-50 px-3 py-2 border rounded-md">
                    {process.env.NEXT_PUBLIC_SHORT_DOMAIN}/
                  </span>
                  <FormControl>
                    <Input placeholder="my-custom-link" {...field} />
                  </FormControl>
                </div>
                <FormDescription>
                  Customize the back-half of the link (e.g. snip.ly/summer-sale)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Link'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
