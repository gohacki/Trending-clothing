// src/pages/admin/add-item.js

import { getSession } from 'next-auth/react';
import AdminAddItemPage from '../../components/AdminAddItemPage'; // Assuming you refactor the page component
// Or keep the component as defined earlier and use a higher-order component or server-side checks

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default AdminAddItemPage;