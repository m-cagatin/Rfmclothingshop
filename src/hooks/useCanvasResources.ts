import { useState, useEffect } from 'react';
import { CanvasGraphic, CanvasPattern, GraphicCategory } from '../types/canvasResource';

const API_BASE = 'http://localhost:4000/api/canvas-resources';

export function useCanvasResources() {
  const [graphics, setGraphics] = useState<CanvasGraphic[]>([]);
  const [patterns, setPatterns] = useState<CanvasPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch graphics with optional category filter
  const fetchGraphics = async (category?: GraphicCategory) => {
    setLoading(true);
    setError(null);
    try {
      const url = category ? `${API_BASE}/graphics?category=${category}` : `${API_BASE}/graphics`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch graphics');
      const data = await response.json();
      setGraphics(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load graphics';
      setError(errorMsg);
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all patterns
  const fetchPatterns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/patterns`);
      if (!response.ok) throw new Error('Failed to fetch patterns');
      const data = await response.json();
      setPatterns(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load patterns';
      setError(errorMsg);
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load all resources on mount
  useEffect(() => {
    fetchGraphics();
    fetchPatterns();
  }, []);

  return {
    graphics,
    patterns,
    loading,
    error,
    fetchGraphics,
    fetchPatterns,
  };
}
