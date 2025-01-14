import FrontPageRouteCharts from '../ui/front-page-charts';
import { Suspense } from 'react';

import HomePageImage from '../ui/home-page-image';

export default async function Home() {
  return (
    <div>
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <HomePageImage />
      </Suspense>
      <div className="mb-10">
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <FrontPageRouteCharts />
        </Suspense>
      </div>
    </div>
  );
}
