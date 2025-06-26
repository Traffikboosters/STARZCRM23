import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  Stethoscope, 
  ShoppingCart, 
  Laptop, 
  Car, 
  Home, 
  Utensils, 
  GraduationCap,
  Briefcase,
  Factory,
  Plane,
  Heart,
  Search,
  Target
} from "lucide-react";

interface IndustryOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  leadValue: string;
  competition: 'Low' | 'Medium' | 'High';
  growthRate: string;
}

const industryOptions: IndustryOption[] = [
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    icon: <Stethoscope className="h-4 w-4" />,
    description: 'Hospitals, clinics, medical practices, dental offices',
    leadValue: '$8,000 - $25,000',
    competition: 'Medium',
    growthRate: '+12%'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce & Retail',
    icon: <ShoppingCart className="h-4 w-4" />,
    description: 'Online stores, retail chains, fashion, consumer goods',
    leadValue: '$3,500 - $15,000',
    competition: 'High',
    growthRate: '+18%'
  },
  {
    id: 'technology',
    name: 'Technology & Software',
    icon: <Laptop className="h-4 w-4" />,
    description: 'SaaS companies, startups, tech services, software development',
    leadValue: '$10,000 - $50,000',
    competition: 'High',
    growthRate: '+25%'
  },
  {
    id: 'automotive',
    name: 'Automotive',
    icon: <Car className="h-4 w-4" />,
    description: 'Car dealers, auto repair, automotive services',
    leadValue: '$4,000 - $12,000',
    competition: 'Medium',
    growthRate: '+8%'
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    icon: <Home className="h-4 w-4" />,
    description: 'Real estate agencies, property management, construction',
    leadValue: '$5,000 - $20,000',
    competition: 'Medium',
    growthRate: '+15%'
  },
  {
    id: 'restaurants',
    name: 'Food & Restaurants',
    icon: <Utensils className="h-4 w-4" />,
    description: 'Restaurants, food delivery, catering, hospitality',
    leadValue: '$2,500 - $8,000',
    competition: 'High',
    growthRate: '+10%'
  },
  {
    id: 'education',
    name: 'Education & Training',
    icon: <GraduationCap className="h-4 w-4" />,
    description: 'Schools, universities, online courses, training centers',
    leadValue: '$3,000 - $12,000',
    competition: 'Low',
    growthRate: '+14%'
  },
  {
    id: 'professional',
    name: 'Professional Services',
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Law firms, accounting, consulting, marketing agencies',
    leadValue: '$6,000 - $30,000',
    competition: 'Medium',
    growthRate: '+9%'
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: <Factory className="h-4 w-4" />,
    description: 'Manufacturing companies, industrial services, B2B suppliers',
    leadValue: '$8,000 - $40,000',
    competition: 'Low',
    growthRate: '+7%'
  },
  {
    id: 'travel',
    name: 'Travel & Tourism',
    icon: <Plane className="h-4 w-4" />,
    description: 'Travel agencies, hotels, tour operators, hospitality',
    leadValue: '$3,000 - $15,000',
    competition: 'Medium',
    growthRate: '+20%'
  },
  {
    id: 'fitness',
    name: 'Health & Fitness',
    icon: <Heart className="h-4 w-4" />,
    description: 'Gyms, personal trainers, wellness centers, nutrition',
    leadValue: '$2,000 - $8,000',
    competition: 'Medium',
    growthRate: '+16%'
  },
  {
    id: 'financial',
    name: 'Financial Services',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Banks, insurance, investment firms, financial advisors',
    leadValue: '$10,000 - $60,000',
    competition: 'High',
    growthRate: '+11%'
  }
];

interface IndustrySelectorProps {
  selectedIndustries: string[];
  onIndustryChange: (industries: string[]) => void;
  onSearch?: (industries: string[]) => void;
  title?: string;
  description?: string;
}

export default function IndustrySelector({ 
  selectedIndustries, 
  onIndustryChange, 
  onSearch,
  title = "Select Target Industries",
  description = "Choose the industries you want to focus on for lead generation and marketing campaigns"
}: IndustrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIndustries = industryOptions.filter(industry =>
    industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    industry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIndustryToggle = (industryId: string) => {
    const updated = selectedIndustries.includes(industryId)
      ? selectedIndustries.filter(id => id !== industryId)
      : [...selectedIndustries, industryId];
    
    onIndustryChange(updated);
  };

  const handleSelectAll = () => {
    onIndustryChange(filteredIndustries.map(industry => industry.id));
  };

  const handleClearAll = () => {
    onIndustryChange([]);
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Controls */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear
          </Button>
        </div>

        {/* Selected Industries Summary */}
        {selectedIndustries.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Selected Industries ({selectedIndustries.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {selectedIndustries.map(id => {
                const industry = industryOptions.find(i => i.id === id);
                return industry ? (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {industry.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Industry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIndustries.map((industry) => (
            <div
              key={industry.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedIndustries.includes(industry.id)
                  ? 'border-brand-primary bg-brand-lighter'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handleIndustryToggle(industry.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIndustries.includes(industry.id)}
                  onChange={() => handleIndustryToggle(industry.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {industry.icon}
                    <Label className="font-medium cursor-pointer">
                      {industry.name}
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {industry.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">
                      {industry.leadValue}
                    </Badge>
                    <Badge className={getCompetitionColor(industry.competition)}>
                      {industry.competition} Competition
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      {industry.growthRate} Growth
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Button */}
        {onSearch && selectedIndustries.length > 0 && (
          <div className="pt-4 border-t">
            <Button 
              onClick={() => onSearch(selectedIndustries)}
              className="w-full bg-brand-primary hover:bg-brand-secondary"
            >
              Search {selectedIndustries.length} Selected {selectedIndustries.length === 1 ? 'Industry' : 'Industries'}
            </Button>
          </div>
        )}

        {filteredIndustries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2" />
            <p>No industries found matching "{searchTerm}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { industryOptions, type IndustryOption };