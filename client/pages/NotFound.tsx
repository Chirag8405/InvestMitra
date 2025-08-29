import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center py-24">
      <Card className="max-w-xl w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Page not found</h1>
          <p className="text-muted-foreground">We couldn't find the page you're looking for. It may have been moved or deleted.</p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4" />
                <span>Go Home</span>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/trading">Open Trading</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Requested URL: {location.pathname}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
