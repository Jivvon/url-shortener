import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLinkStore } from '../../stores/linkStore';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardContent, Button, Input } from '../../components/ui';

export default function NewLink() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { createLink, isLoading, error, clearError } = useLinkStore();
  const { plan } = useAuthStore();

  const [formData, setFormData] = useState({
    url: searchParams.get('url') || '',
    title: '',
    custom_code: '',
    expires_at: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    if (!formData.url.trim()) {
      setFormErrors({ url: 'URL is required' });
      return;
    }

    const linkData: {
      url: string;
      title?: string;
      custom_code?: string;
      expires_at?: string;
    } = {
      url: formData.url,
    };

    if (formData.title.trim()) {
      linkData.title = formData.title.trim();
    }

    if (formData.custom_code.trim() && plan?.features.customAlias) {
      linkData.custom_code = formData.custom_code.trim();
    }

    if (formData.expires_at && plan?.features.expiration) {
      linkData.expires_at = formData.expires_at;
    }

    const link = await createLink(linkData);

    if (link) {
      navigate(`/dashboard/links/${link.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Link</h1>
        <p className="text-gray-600 mt-1">
          Shorten a URL and start tracking clicks
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <Input
              label="Long URL"
              name="url"
              type="url"
              placeholder="https://example.com/very-long-url-that-needs-shortening"
              value={formData.url}
              onChange={handleChange}
              error={formErrors.url || (error?.includes('URL') ? error : undefined)}
              required
            />

            {/* Title Input */}
            <Input
              label="Title (optional)"
              name="title"
              type="text"
              placeholder="My awesome link"
              value={formData.title}
              onChange={handleChange}
              helperText="A descriptive title helps you identify links later"
            />

            {/* Custom Alias */}
            <div>
              <Input
                label="Custom Alias (optional)"
                name="custom_code"
                type="text"
                placeholder="my-brand"
                value={formData.custom_code}
                onChange={handleChange}
                disabled={!plan?.features.customAlias}
                error={formErrors.custom_code}
                helperText={
                  plan?.features.customAlias
                    ? 'Choose a memorable short code (letters, numbers, hyphens)'
                    : 'Upgrade to Pro to use custom aliases'
                }
              />
            </div>

            {/* Expiration Date */}
            <div>
              <Input
                label="Expiration Date (optional)"
                name="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={handleChange}
                disabled={!plan?.features.expiration}
                min={new Date().toISOString().split('T')[0]}
                helperText={
                  plan?.features.expiration
                    ? 'The link will stop working after this date'
                    : 'Upgrade to Pro to set expiration dates'
                }
              />
            </div>

            {/* Error Message */}
            {error && !error.includes('URL') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/links')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Create Link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
