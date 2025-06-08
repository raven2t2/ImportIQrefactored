import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Search, Calculator, Clipboard, ArrowRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const iconMap = {
  Search,
  Calculator,
  Clipboard
};

interface ToolCategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
    tools: Array<{
      id: string;
      name: string;
      path: string;
      description: string;
      regions: string[];
    }>;
  };
  userRegion: string;
}

export function ToolCategoryCard({ category, userRegion }: ToolCategoryCardProps) {
  const [, setLocation] = useLocation();
  const IconComponent = iconMap[category.icon] || Search;

  const availableTools = category.tools.filter(tool => tool.regions.includes(userRegion));

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl">{category.name}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {availableTools.length} tools
            </Badge>
          </div>
        </div>
        <CardDescription>{category.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availableTools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{tool.name}</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{tool.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {tool.description}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setLocation(tool.path)}
                className="ml-2 shrink-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {availableTools.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No tools available for your region</p>
              <p className="text-xs mt-1">Check back soon for updates</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}