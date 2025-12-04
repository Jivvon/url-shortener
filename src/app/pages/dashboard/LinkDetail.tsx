import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLinkStore } from '../../stores/linkStore';
import { Card, CardContent, CardTitle, Button, Input, Modal, ModalFooter } from '../../components/ui';
import QRCodeGenerator from '../../components/shared/QRCodeGenerator';

export default function LinkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentLink,
    currentStats,
    fetchLink,
    fetchLinkStats,
    updateLink,
    deleteLink,
    clearCurrentLink,
    isLoading,
  } = useLinkStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', is_active: true });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('7d');

  useEffect(() => {
    if (id) {
      fetchLink(id);
      fetchLinkStats(id, statsPeriod);
    }
    return () => clearCurrentLink();
  }, [id, fetchLink, fetchLinkStats, clearCurrentLink, statsPeriod]);

  useEffect(() => {
    if (currentLink) {
      setEditForm({
        title: currentLink.title || '',
        is_active: currentLink.is_active,
      });
    }
  }, [currentLink]);

  const handleSave = async () => {
    if (id) {
      const success = await updateLink(id, editForm);
      if (success) {
        setIsEditing(false);
      }
    }
  };

  const handleDelete = async () => {
    if (id) {
      const success = await deleteLink(id);
      if (success) {
        navigate('/dashboard/links');
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (isLoading && !currentLink) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!currentLink) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Link not found</h2>
        <p className="text-gray-600 mt-2">The link you're looking for doesn't exist.</p>
        <Link to="/dashboard/links" className="mt-4 inline-block">
          <Button>Back to Links</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/dashboard/links"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Links
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentLink.title || currentLink.short_code}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Link Details Card */}
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Short URL
                  </label>
                  <div className="flex items-center gap-2">
                    <a
                      href={currentLink.short_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-blue-600 hover:underline"
                    >
                      {currentLink.short_url}
                    </a>
                    <button
                      onClick={() => copyToClipboard(currentLink.short_url)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Original URL
                  </label>
                  <a
                    href={currentLink.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-blue-600 break-all"
                  >
                    {currentLink.original_url}
                  </a>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        currentLink.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {currentLink.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Total Clicks
                    </label>
                    <span className="text-lg font-semibold text-gray-900">
                      {currentLink.total_clicks}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Created
                    </label>
                    <span className="text-gray-900">
                      {new Date(currentLink.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <CardTitle>Analytics</CardTitle>
              <select
                value={statsPeriod}
                onChange={(e) => setStatsPeriod(e.target.value as typeof statsPeriod)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            <CardContent>
              {currentStats ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {currentStats.summary.total_clicks}
                      </p>
                      <p className="text-sm text-gray-500">Total Clicks</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {currentStats.summary.unique_visitors}
                      </p>
                      <p className="text-sm text-gray-500">Unique Visitors</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {currentStats.summary.avg_daily_clicks}
                      </p>
                      <p className="text-sm text-gray-500">Avg Daily</p>
                    </div>
                  </div>

                  {/* Top Locations */}
                  {Object.keys(currentStats.countries).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Top Countries</h4>
                      <div className="space-y-2">
                        {Object.entries(currentStats.countries)
                          .slice(0, 5)
                          .map(([country, count]) => (
                            <div key={country} className="flex items-center justify-between">
                              <span className="text-gray-600">{country}</span>
                              <span className="font-medium text-gray-900">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Devices */}
                  {Object.keys(currentStats.devices).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Devices</h4>
                      <div className="space-y-2">
                        {Object.entries(currentStats.devices).map(([device, count]) => (
                          <div key={device} className="flex items-center justify-between">
                            <span className="text-gray-600 capitalize">{device}</span>
                            <span className="font-medium text-gray-900">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No analytics data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - QR Code */}
        <div>
          <Card>
            <CardContent>
              <h3 className="font-medium text-gray-900 mb-4">QR Code</h3>
              <QRCodeGenerator url={currentLink.short_url} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Link">
        <div className="space-y-4">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="My link title"
          />

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Link is active</span>
            </label>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isLoading}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Link"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this link? This action cannot be undone.
        </p>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Delete Link
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
