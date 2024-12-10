export function useComments(type: 'nominee' | 'institution', id: number) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
  
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments?${type}Id=${id}&page=${page}`);
        const data = await res.json();
        setComments(prev => [...prev, ...data.data]);
        setHasMore(data.currentPage < data.pages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    const loadMore = () => {
      if (!loading && hasMore) {
        setPage(p => p + 1);
      }
    };
  
    useEffect(() => {
      fetchComments();
    }, [page, type, id]);
  
    return { comments, loading, hasMore, loadMore };
  }