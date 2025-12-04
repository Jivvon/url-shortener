import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLinkStore } from '../../stores/linkStore';
import { QRCodeGenerator } from '../../components/shared/QRCodeGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function LinkDetail() {
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

  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    if (id) {
      fetchLink(id);
      fetchLinkStats(id, period);
    }
    return () => clearCurrentLink();
  }, [id, period, fetchLink, fetchLinkStats, clearCurrentLink]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      if (id) {
        const success = await deleteLink(id);
        if (success) {
          navigate('/dashboard/links');
        }
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !currentLink) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      title: formData.get('title') as string,
      is_active: formData.get('is_active') === 'on',
    };

    const success = await updateLink(id, updates);
    if (success) {
      alert('Link updated successfully');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading || !currentLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading link details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentLink.title || 'Untitled Link'}
                </h1>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${currentLink.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}
                >
                  {currentLink.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <a
                  href={currentLink.short_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  {currentLink.short_url}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={() => copyToClipboard(currentLink.short_url)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Copy
                </button>
                <span className="text-gray-300">|</span>
                <span className="truncate max-w-md" title={currentLink.original_url}>
                  {currentLink.original_url}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Clicks</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {currentStats?.summary.total_clicks || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Unique Visitors</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {currentStats?.summary.unique_visitors || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Avg. Daily Clicks</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {currentStats?.summary.avg_daily_clicks.toFixed(1) || 0}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Clicks Over Time */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Clicks Over Time</h3>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 3 Months</option>
                  </select>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentStats?.daily || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(str) => new Date(str).toLocaleDateString()}
                      />
                      <Bar dataKey="click_count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Device & Browser Stats */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Devices</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(currentStats?.devices || {}).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.entries(currentStats?.devices || {}).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {Object.entries(currentStats?.devices || {}).map(([name, value], index) => (
                    <div key={name} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="capitalize">{name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-gray-900 mb-6 w-full text-left">QR Code</h3>
                <QRCodeGenerator url={currentLink.short_url} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Link Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your link configuration</p>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    defaultValue={currentLink.title || ''}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Link Status</h3>
                    <p className="text-sm text-gray-500">Enable or disable this link</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={currentLink.is_active}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete Link
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
