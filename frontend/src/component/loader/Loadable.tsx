
import { Suspense } from 'react';
import Loader from './Loader';

const Loadable = (Component: any) => (props: any) => (
  <Suspense fallback={<Loader variant="page" />}>
    <Component {...props} />
  </Suspense>
);

export default Loadable;
