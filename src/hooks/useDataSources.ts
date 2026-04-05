import { useState, useEffect } from 'react';
import { fetchJson } from '../lib/api';
import { toast } from 'sonner';

export function useDataSources() {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);
  const [showAddSourceDialog, setShowAddSourceDialog] = useState(false);
  const [showEditSourceDialog, setShowEditSourceDialog] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', url: '', type: 'rss' });
  const [editingSource, setEditingSource] = useState<any>(null);

  const fetchSources = async () => {
    try {
      const data = await fetchJson('/api/v1/sources');
      if (data.success) {
        setDataSources(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (id: string) => {
    try {
      const res = await fetchJson('/api/v1/sync/test', {
        method: 'POST',
        body: JSON.stringify({ sourceId: id })
      });
      if (res.success) {
        toast.success(`Connection successful: ${res.message || 'Source is reachable'}`);
      } else {
        toast.error(`Connection failed: ${res.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connection test failed');
    }
  };

  const addSource = async () => {
    try {
      const res = await fetchJson('/api/v1/sources', {
        method: 'POST',
        body: JSON.stringify(newSource)
      });
      if (res.success) {
        toast.success('Source added successfully');
        setShowAddSourceDialog(false);
        setNewSource({ name: '', url: '', type: 'rss' });
        fetchSources();
      } else {
        toast.error(res.error || 'Failed to add source');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add source');
    }
  };

  const updateSource = async () => {
    if (!editingSource) return;
    try {
      const res = await fetchJson(`/api/v1/sources/${editingSource.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingSource)
      });
      if (res.success) {
        toast.success('Source updated successfully');
        setShowEditSourceDialog(false);
        setEditingSource(null);
        fetchSources();
      } else {
        toast.error(res.error || 'Failed to update source');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update source');
    }
  };

  const deleteSource = async () => {
    if (!sourceToDelete) return;
    try {
      const res = await fetchJson(`/api/v1/sources/${sourceToDelete}`, {
        method: 'DELETE'
      });
      if (res.success) {
        toast.success('Source deleted successfully');
        setSourceToDelete(null);
        fetchSources();
      } else {
        toast.error(res.error || 'Failed to delete source');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete source');
    }
  };

  const toggleSourceActive = async (id: string, currentStatus: boolean) => {
    try {
      const source = dataSources.find(s => s.id === id);
      if (!source) return;
      
      const res = await fetchJson(`/api/v1/sources/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...source, isActive: !currentStatus })
      });
      
      if (res.success) {
        toast.success(`Source ${!currentStatus ? 'enabled' : 'disabled'}`);
        fetchSources();
      } else {
        toast.error(res.error || 'Failed to update source status');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update source status');
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return {
    dataSources,
    loading,
    sourceToDelete,
    setSourceToDelete,
    showAddSourceDialog,
    setShowAddSourceDialog,
    showEditSourceDialog,
    setShowEditSourceDialog,
    newSource,
    setNewSource,
    editingSource,
    setEditingSource,
    refreshSources: fetchSources,
    testConnection,
    addSource,
    updateSource,
    deleteSource,
    toggleSourceActive
  };
}
