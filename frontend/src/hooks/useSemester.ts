import { useEffect, useState } from 'react';
import axios from 'axios';
export type Semester={
  id:string,
  number:number
}
export default function useFetchSemester(schemeId: string) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schemeId) {
      setSemesters([]);
      return;
    }

    setLoading(true);
    axios.get(`http://localhost:3000/api/v1/scheme/semester/${schemeId}`)
      .then((res) => {
        setSemesters(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch semesters:', err);
        setError('Failed to fetch semesters');
        setSemesters([]);
      })
      .finally(() => setLoading(false));
  }, [schemeId]);

  return { semesters, loading, error };
}
