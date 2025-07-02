'use client';

import EditCourse from '../../../../../components/EditCourse';

export default function EditCoursePage({ params }: { params: { id: string } }) {
  return <EditCourse params={params} />;
}
