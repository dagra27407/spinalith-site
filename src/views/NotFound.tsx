/**
 * NotFound (polished 404)
 *
 * Plain-English (2am-you): Friendly 404 page that guides users back to safety.
 * Uses our shared layout utilities and shadcn components. No business logic.
 *
 * Behavior
 *  - Primary action: Go to All Projects (/projects)
 *  - Secondary: Go Back (history -1)
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TriangleAlert } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="app-page space-y-6">
      <div className="flex items-center app-gap">
        <TriangleAlert className="w-5 h-5 text-destructive" aria-hidden />
        <h1 className="app-h1">Page not found</h1>
      </div>

      <Card className="app-card-radius p-6">
        <p className="text-muted-foreground">
          We couldn't find the page you were looking for. The link may be broken
          or the page may have moved.
        </p>
        <div className="flex items-center app-gap mt-4">
          <Button onClick={() => navigate('/')}>Go to All Projects</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Card>
    </div>
  );
}
