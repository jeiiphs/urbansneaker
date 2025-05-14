import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import SneakerForm from '../components/SneakerForm';
import type { Sneaker } from '../types/sneaker';

const BRANDS = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Reebok', 'Under Armour'];
const STYLES = ['Running', 'Basketball', 'Lifestyle', 'Training', 'Skateboarding', 'Tennis'];

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSneaker, setEditingSneaker] = useState<Sneaker | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    fetchSneakers();
  }, [user, navigate]);

  useEffect(() => {
    if (id) {
      fetchSneaker(id);
      setShowForm(true);
    }
  }, [id]);

  const fetchSneakers = async () => {
    try {
      const response = await api.get('/api/sneakers');
      setSneakers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sneakers:', err);
      setError('Failed to load sneakers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSneaker = async (sneakerId: string) => {
    try {
      const response = await api.get(`/api/sneakers/${sneakerId}`);
      setEditingSneaker(response.data);
    } catch (err) {
      console.error('Error fetching sneaker:', err);
      setError('Failed to load sneaker details');
    }
  };

  const handleSneakerSubmit = async (data: Partial<Sneaker>) => {
    try {
      setError(null);
      if (editingSneaker) {
        await api.put(`/api/sneakers/${editingSneaker.id}`, data);
      } else {
        await api.post('/api/sneakers', data);
      }
      await fetchSneakers();
      setShowForm(false);
      setEditingSneaker(null);
      navigate('/admin');
    } catch (err) {
      console.error('Error saving sneaker:', err);
      setError('Failed to save sneaker');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sneaker?')) return;

    try {
      setError(null);
      await api.delete(`/api/sneakers/${id}`);
      await fetchSneakers();
    } catch (err) {
      console.error('Error deleting sneaker:', err);
      setError('Failed to delete sneaker');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={() => {
            setEditingSneaker(null);
            setShowForm(true);
            navigate('/admin/new');
          }}
          className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Sneaker
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {editingSneaker ? 'Edit Sneaker' : 'Add New Sneaker'}
          </h2>
          <SneakerForm
            brands={BRANDS}
            styles={STYLES}
            onSubmit={handleSneakerSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingSneaker(null);
              navigate('/admin');
            }}
            initialData={editingSneaker || undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sneaker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Style
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sizes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sneakers.map((sneaker) => (
                <tr key={sneaker.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded object-cover"
                          src={sneaker.image_url}
                          alt={sneaker.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {sneaker.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sneaker.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sneaker.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sneaker.style}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${sneaker.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sneaker.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {sneaker.sizes.map((size) => (
                        <span
                          key={size}
                          className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 rounded"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingSneaker(sneaker);
                        setShowForm(true);
                        navigate(`/admin/edit/${sneaker.id}`);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sneaker.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;