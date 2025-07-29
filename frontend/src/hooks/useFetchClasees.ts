import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_URL } from '../config/config';

export type SemesterType = {
  id: string;
  number: number;
  startDate: string;
  endDate: string;
  schemaId: string;
};

export type ClassType = {
  id: string;
  name: string;
  departmentId: string;
  semester: SemesterType[];
};

export default function useFetchClasses(departmentId: string, refresh?: boolean) {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await axios.get(`${API_URL}/v1/scheme/allCourses/${departmentId}`);
      const data: ClassType[] = res.data;
      setClasses(data);
      setLoading(false);
    }

    fetchData();
  }, [departmentId, refresh]);

  return { classes, loading };
}
