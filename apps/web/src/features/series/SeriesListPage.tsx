import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, Users, Play, Clock, Star } from 'lucide-react';
import { SeriesCard } from './SeriesCard';

interface Series {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  creatorId: {
    _id: string;
    username: string;
    avatar?: string;
  };
  category: string;
  episodeCount: number;
  totalDuration: number;
  followerCount: number;
  rating: {
    average: number;
    count: number;
  };
  isVerified: boolean;
  status: 'ongoing' | 'completed' | 'hiatus';
  createdAt: string;
}

const CATEGORIES = [
  { value: 'all', label: 'Toutes', color: '#6B7280' },
  { value: 'education', label: 'Éducation', color: '#3B82F6' },
  { value: 'entertainment', label: 'Divertissement', color: '#8B5CF6' },
  { value: 'news', label: 'Actualités', color: '#EF4444' },
  { value: 'culture', label: 'Culture', color: '#F59E0B' },
  { value: 'technology', label: 'Technologie', color: '#10B981' },
  { value: 'business', label: 'Business', color: '#6366F1' },
  { value: 'health', label: 'Santé', color: '#EC4899' },
  { value: 'sports', label: 'Sports', color: '#F97316' },
  { value: 'other', label: 'Autre', color: '#6B7280' }
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Les plus populaires' },
  { value: 'recent', label: 'Les plus récents' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'episodes', label: 'Plus d\'épisodes' }
];

const SeriesListPage: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [totalSeries, setTotalSeries] = useState(0);

  useEffect(() => {
    fetchSeries();
  }, [page, selectedCategory, sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        handleSearch();
      } else {
        setPage(1);
        fetchSeries();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      let url = `/api/series?page=${page}&limit=20`;
      
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      
      if (sortBy === 'popular') {
        url = `/api/series/popular?page=${page}&limit=20`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSeries(data.data.series);
        setTotalPages(Math.ceil(data.data.total / 20));
        setTotalSeries(data.data.total);
      }
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/series/search?q=${encodeURIComponent(searchQuery)}&page=1&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setSeries(data.data.series);
        setTotalPages(Math.ceil(data.data.total / 20));
        setTotalSeries(data.data.total);
      }
    } catch (error) {
      console.error('Error searching series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setSearchQuery('');
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Découvrir les séries</h1>
              {!loading && totalSeries > 0 && (
                <span className="text-sm text-gray-400">
                  ({totalSeries} séries)
                </span>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des séries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-80 pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filtres</span>
                {selectedCategory !== 'all' && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORIES.find(c => c.value === selectedCategory)?.color }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          {showFilters && (
            <div className="mt-4 pb-4 border-t border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4 pt-4">
                {/* Categories */}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Catégories</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryChange(category.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedCategory === category.value
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                        style={{
                          backgroundColor: selectedCategory === category.value ? category.color : 'transparent'
                        }}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="lg:w-64">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Trier par</h3>
                  <div className="space-y-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          sortBy === option.value
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'Aucune série trouvée' : 'Aucune série disponible'}
              </h2>
              <p className="text-gray-400 mb-6">
                {searchQuery 
                  ? `Aucun résultat pour "${searchQuery}". Essayez d'autres termes de recherche.`
                  : 'Soyez le premier à créer une série !'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                    fetchSeries();
                  }}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {totalSeries}
                  </span>
                </div>
                <div className="text-sm text-gray-400">Total séries</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {series.reduce((sum, s) => sum + s.followerCount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-400">Total abonnés</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <Play className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {series.reduce((sum, s) => sum + s.episodeCount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-400">Total épisodes</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {formatDuration(Math.floor(series.reduce((sum, s) => sum + s.totalDuration, 0) / series.length))}
                  </span>
                </div>
                <div className="text-sm text-gray-400">Durée moyenne</div>
              </div>
            </div>

            {/* Series Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {series.map((seriesItem) => (
                <SeriesCard 
                  key={seriesItem._id} 
                  series={seriesItem}
                  variant="default"
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                >
                  Précédent
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = pageNum === page;
                    const isNearCurrent = Math.abs(pageNum - page) <= 2;
                    
                    if (!isNearCurrent && pageNum > 1 && pageNum < totalPages) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    
                    if (pageNum === 1 || pageNum === totalPages || isNearCurrent) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                            isCurrentPage
                              ? 'bg-orange-500 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
