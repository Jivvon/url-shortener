import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, plans(*)')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user.email} disabled />
            <p className="text-sm text-gray-500">
              Your email address is managed by Google.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" defaultValue={profile?.name || ''} />
          </div>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </Card>

      {/* Plan Section */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">Subscription Plan</h2>
            <p className="text-gray-600 mt-1">
              You are currently on the <span className="font-bold capitalize">{profile?.plans?.name}</span> plan.
            </p>
          </div>
          <Link href="/pricing">
            <Button variant="outline">Upgrade Plan</Button>
          </Link>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly Usage</span>
            <span className="text-sm text-gray-500">
              {profile?.url_count_this_month} / {profile?.plans?.url_limit || '∞'} links
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{
                width: `${Math.min(
                  ((profile?.url_count_this_month || 0) / (profile?.plans?.url_limit || 1)) * 100,
                  100
                )}%`
              }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
        <p className="text-red-700 mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="destructive">Delete Account</Button>
      </Card>
    </div>
  )
}
