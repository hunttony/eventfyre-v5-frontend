import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { vendorApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import AvailabilityForm from './AvailabilityForm';

const ManageAvailability = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [initialData, setInitialData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchAvailability = async () => {
        try {
          const response = await vendorApi.getAvailabilityById(id);
          setInitialData(response.data);
        } catch (error) {
          console.error('Error fetching availability:', error);
          toast.error('Failed to load availability data');
          navigate('/vendor/availability');
        } finally {
          setLoading(false);
        }
      };
      fetchAvailability();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      let response;
      
      if (id) {
        response = await vendorApi.updateAvailability(id, formData);
      } else {
        response = await vendorApi.addAvailability(formData);
      }
      
      if (response.success) {
        toast.success(response.message || (id ? 'Availability updated successfully' : 'Availability added successfully'));
        navigate('/vendor/availability');
      } else {
        throw new Error(response.message || 'Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error(error.message || 'Failed to save availability');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/vendor/availability');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          Back to Availability
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Availability' : 'Add New Availability'}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {id 
            ? 'Update your availability details below.'
            : 'Set your available time slots for clients to book your services.'}
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <AvailabilityForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={submitting}
        />
      </Paper>
    </Container>
  );
};

export default ManageAvailability;
