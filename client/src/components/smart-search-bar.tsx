import { useState } from 'react';
import { Search, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SmartSearchAI from './smart-search-ai';

interface SmartSearchBarProps {
  onNavigate?: (path: string) => void;
}

export default function SmartSearchBar({ onNavigate }: SmartSearchBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  return (
    <>
      {/* Quick Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleQuickSearch}
          placeholder="Search leads or ask AI..."
          className="pl-10 pr-20"
        />
        <Button
          onClick={() => setIsSearchOpen(true)}
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 text-blue-600 hover:bg-blue-50"
        >
          <Brain className="h-4 w-4 mr-1" />
          <Zap className="h-3 w-3" />
        </Button>
      </div>

      {/* AI Search Modal */}
      <SmartSearchAI
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
}