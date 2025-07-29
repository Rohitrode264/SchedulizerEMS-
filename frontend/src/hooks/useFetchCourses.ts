import { useState, useEffect } from 'react';
import axios from 'axios';

export type CourseType = {
  id: string;
  name: string;
  code: string;
  credits: number;
  semesterId: string;
};

export default function useFetchCourses(semesterId: string) {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!semesterId) {
      setCourses([]);
      setError(null);
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:3000/api/v1/scheme/course/${semesterId}`)
      .then((res) => {
        console.log(res);
        setCourses(res.data);
      })
      .catch((error) => {
        console.error('Failed to fetch courses:', error);
        setError('Failed to fetch courses');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [semesterId]); 

  return { courses, Loading, error };
}
