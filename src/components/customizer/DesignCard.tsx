import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Trash2, Eye } from 'lucide-react';

// Simple time ago function
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

interface DesignCardProps {
  design: {
    id: number;
    customizableProductId: number;
    selectedSize: string;
    selectedPrintOption: string;
    frontThumbnailUrl?: string;
    backThumbnailUrl?: string;
    lastSavedAt: string;
    product: {
      name: string;
      category: string;
      base_color_name?: string;
      base_color_hex?: string;
      retail_price?: number;
    };
  };
  onLoad: (design: any) => void;
  onDelete: (designId: number) => void;
}

export function DesignCard({ design, onLoad, onDelete }: DesignCardProps) {
  const thumbnail = design.frontThumbnailUrl || design.backThumbnailUrl;
  const lastEdited = timeAgo(new Date(design.lastSavedAt));
  
  const printOptionLabel = {
    'none': 'No Print',
    'front': 'Front Print',
    'back': 'Back Print',
    'both': 'Both Sides'
  }[design.selectedPrintOption] || design.selectedPrintOption;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow border-2 hover:border-blue-400">
      <div className="relative aspect-square bg-gray-100">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={`${design.product.name} design`}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Eye className="size-16 opacity-30" />
            <span className="absolute bottom-4 text-sm">No Preview</span>
          </div>
        )}
        
        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => onLoad(design)}
          >
            <Eye className="size-4 mr-2" />
            Load Design
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this design? This action cannot be undone.')) {
                onDelete(design.id);
              }
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Product name */}
          <h3 className="font-semibold text-sm truncate">{design.product.name}</h3>
          
          {/* Product details */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {design.selectedSize}
            </Badge>
            {design.product.base_color_name && (
              <Badge variant="outline" className="text-xs">
                <div 
                  className="size-2 rounded-full mr-1.5 border border-gray-300"
                  style={{ backgroundColor: design.product.base_color_hex || '#666' }}
                />
                {design.product.base_color_name}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {printOptionLabel}
            </Badge>
          </div>
          
          {/* Category */}
          <p className="text-xs text-gray-500">
            {design.product.category}
          </p>
          
          {/* Last edited */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1 border-t">
            <Clock className="size-3" />
            <span>Edited {lastEdited}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
