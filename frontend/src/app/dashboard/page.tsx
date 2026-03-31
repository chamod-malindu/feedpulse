'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getAllFeedback,
  getFeedbackStats,
  getFeedbackSummary,
} from '@/lib/api';
import StatsBar from '@/components/StatsBar';
import FeedbackCard, { FeedbackItem } from '@/components/FeedbackCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  LogOut,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface Stats {
  totalFeedback: number;
  openItems: number;
  averagePriority: number;
  topTag: string;
}

interface Filters {
  category: string;
  status: string;
  sort: string;
  search: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats>({
    totalFeedback: 0,
    openItems: 0,
    averagePriority: 0,
    topTag: 'N/A',
  });
  const [statsError, setStatsError] = useState<boolean>(false);

  const [filters, setFilters] = useState<Filters>({
    category: '',
    status: '',
    sort: '-createdAt',
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');

  const [trendSummary, setTrendSummary] = useState<{
    summary: string;
    feedbackCount: number;
  } | null>(null);

  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Protected router to redirect unauthenticated users to login page
  useEffect(() => {
    const token = localStorage.getItem('feedpulse_token');
    if (!token) {
      router.push('/login?reason=auth_required');
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

  // Memoized to prevent recreation on every render which would retrigger the useEffect below
  const fetchFeedback = useCallback(async (page = 1) => {
      setIsLoadingFeedback(true);
      setFeedbackError(null);

      const result = await getAllFeedback({
        ...filters,
        page,
        limit: 10,
      });

      if (result.success) {
        const data = result.data as {
          feedbacks: FeedbackItem[];
          pagination: Pagination;
        };
        setFeedbacks(data.feedbacks);
        setPagination(data.pagination);

      }else{
        setFeedbackError(result.message || 'Failed to load feedback');
      }

      setIsLoadingFeedback(false);
    },
    [filters] // Recreate this function only when filters change
  );


  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);

    const result = await getFeedbackStats({
      category: filters.category,
      status: filters.status,
      search: filters.search,
    });

    if (result.success) {
      setStats(result.data as Stats);
    }else {
      setStatsError(true);
    }

    setIsLoadingStats(false);
  }, [filters]);

  // Every time 'filters' changes, fetchFeedback and fetchStats depend on filters via useCallback
  useEffect(() => {
    fetchFeedback(1); // Always go back to page 1 when filters change
    fetchStats();
  }, [fetchFeedback, fetchStats]);


  // HANDLERS 

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearFilters = () => {
    setFilters({ category: '', status: '', sort: '-createdAt', search: '' });
    setSearchInput('');
  };

  const hasActiveFilters = filters.category || filters.status || filters.search || filters.sort !== '-createdAt';

  const handleFetchSummary = async () => {
    setIsLoadingSummary(true);
    const result = await getFeedbackSummary();
    if (result.success) {
      setTrendSummary(
        result.data as { summary: string; feedbackCount: number }
      );
    }else {
      setSummaryError(result.message || 'Failed to fetch summary');
    }
    setIsLoadingSummary(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('feedpulse_token');
    router.push('/login');
  };


  const handleRefresh = () => {
    fetchFeedback(pagination.currentPage);
    fetchStats();
  };

  // Prevent rendering the dashboard until we confirm authentication status 
  if (isAuthChecking) {
    return (
      <div className="min-h-screen throughout-gradient 
        flex items-center justify-center">
        <Loader2 
          className="w-8 h-8 animate-spin" 
          style={{ color: '#0ba5ec' }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen throughout-gradient">

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              Feed<span style={{ color: '#0ba5ec' }}>Pulse</span>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm text-muted-foreground font-medium">
              Admin Dashboard
            </span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View Public Page
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* PAGE TITLE */}
        <div className="flex items-center justify-between">
          <div>
            <div className="throughout-label mb-2">
              <span>●</span>
              <span>Feedback Management</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Product Feedback
            </h1>
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingFeedback}
            className="border-border hover:text-white hover:bg-accent"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 ${isLoadingFeedback ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* STATS BAR */}
        <StatsBar
          totalFeedback={stats.totalFeedback}
          openItems={stats.openItems}
          averagePriority={stats.averagePriority}
          topTag={stats.topTag}
          isLoading={isLoadingStats}
          hasError={statsError}
        />

        {/* AI TREND SUMMARY */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="throughout-icon-bg w-8 h-8">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  AI Trend Summary
                </h2>
                <p className="text-xs text-muted-foreground">
                  Top 3 themes from the last 7 days
                </p>
              </div>
            </div>
            <Button
              onClick={handleFetchSummary}
              disabled={isLoadingSummary}
              size="sm"
              className="btn-gradient rounded-full text-xs"
            >
              {isLoadingSummary ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>

          {/* Summary result */}
          {trendSummary ? (
            <div className="bg-muted/40 rounded-xl p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Based on {trendSummary.feedbackCount} AI-processed items
              </p>
              <div className="text-sm text-foreground leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({children}) => (
                    <h1 className="text-base font-bold mb-2 mt-3">{children}</h1>
                  ),
                  h2: ({children}) => (
                    <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>
                  ),
                  h3: ({children}) => (
                    <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>
                  ),
                  strong: ({children}) => (
                    <strong className="font-semibold mr-1 block">{children}</strong>
                  ),
                  p: ({children}) => (
                    <p className="mb-2">{children}</p>
                  ),
                  ul: ({children}) => (
                    <ul className="list-disc ml-4 mb-2">{children}</ul>
                  ),
                  ol: ({children}) => (
                    <ol className="list-decimal ml-4 mb-2">{children}</ol>
                  ),
                  li: ({children}) => (
                    <li className="mb-1">{children}</li>
                  ),
                }}
              >
                {trendSummary.summary}
              </ReactMarkdown>
            </div>
            </div>
          ) : summaryError ? (
            <p className="text-sm text-destructive text-center py-4">
              {summaryError}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Click "Generate Summary" to see AI-powered insights from recent feedback.
            </p>
          )}
        </div>

        {/* FILTERS BAR */}
        <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-primary hover:text-sm cursor-pointer ml-auto"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

            {/* Search Input */}
            <div className="relative sm:col-span-2 lg:col-span-1 flex gap-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search title or summary..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 text-sm"
              />

              <Button
                size="sm"
                variant="outline"
                onClick={handleSearch}
                className="shrink-0 h-full hover:bg-accent hover:text-white"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Category Filter */}
            <Select
              value={filters.category || 'all'}
              onValueChange={val =>
                handleFilterChange('category', val === 'all' ? '' : val)
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Bug">🐛 Bug</SelectItem>
                <SelectItem value="Feature Request">✨ Feature Request</SelectItem>
                <SelectItem value="Improvement">🔧 Improvement</SelectItem>
                <SelectItem value="Other">📌 Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={val =>
                handleFilterChange('status', val === 'all' ? '' : val)
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={filters.sort}
              onValueChange={val => handleFilterChange('sort', val)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Newest First</SelectItem>
                <SelectItem value="createdAt">Oldest First</SelectItem>
                <SelectItem value="-ai_priority">Highest Priority</SelectItem>
                <SelectItem value="ai_priority">Lowest Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* FEEDBACK LIST */}
        <div>
          {/* List header with count */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {isLoadingFeedback
                ? 'Loading...'
                : `${pagination.totalItems} feedback item${pagination.totalItems !== 1 ? 's' : ''}`}
            </h2>
          </div>

          {isLoadingFeedback ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-border">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: '#0ba5ec' }}
              />
              <p className="text-sm text-muted-foreground">
                Loading feedback...
              </p>
            </div>
          ) : feedbackError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-border">
              <p className="text-sm text-destructive font-medium">
                {feedbackError}
              </p>
              <button
                onClick={() => fetchFeedback(1)}
                className="text-xs text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-border">
              <div className="throughout-icon-bg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No feedback found
              </p>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'No feedback has been submitted yet'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

          ) : (

            // Feedback Cards
            <div className="grid gap-4">
              {feedbacks.map(fb => (
                <FeedbackCard
                  key={fb._id}
                  feedback={fb}
                  onStatusChange={handleRefresh}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFeedback(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || isLoadingFeedback}
              className="border-border"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page{' '}
              <span className="font-semibold text-foreground">
                {pagination.currentPage}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-foreground">
                {pagination.totalPages}
              </span>
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFeedback(pagination.currentPage + 1)}
              disabled={
                pagination.currentPage >= pagination.totalPages || isLoadingFeedback
              }
              className="border-border"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

      </main>
    </div>
  );
}