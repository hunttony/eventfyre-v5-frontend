import { useState, useEffect } from 'react';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { TimePicker, DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField, Button, Grid, FormControlLabel, Checkbox, Box, Typography, Divider } from '@mui/material';
import { vendorApi } from '../../../utils/api';
import { toast } from 'react-toastify';

const AvailabilityForm = ({ onSuccess, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    startDate: new Date(),
    startTime: new Date().setHours(9, 0, 0, 0),
    endTime: new Date().setHours(17, 0, 0, 0),
    isRecurring: false,
    recurringDays: [],
    endDate: addDays(new Date(), 30),
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
        endDate: initialData.endDate ? new Date(initialData.endDate) : addDays(new Date(), 30),
        startTime: initialData.startTime ? new Date(initialData.startTime) : new Date().setHours(9, 0, 0, 0),
        endTime: initialData.endTime ? new Date(initialData.endTime) : new Date().setHours(17, 0, 0, 0),
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    if (formData.isRecurring && !formData.endDate) {
      newErrors.endDate = 'End date is required for recurring availability';
    } else if (formData.isRecurring && isBefore(new Date(formData.endDate), new Date(formData.startDate))) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const payload = {
        ...formData,
        startTime: format(formData.startTime, "yyyy-MM-dd'T'HH:mm:ss'+00:00'"),
        endTime: format(formData.endTime, "yyyy-MM-dd'T'HH:mm:ss'+00:00'"),
        startDate: format(formData.startDate, 'yyyy-MM-dd'),
        endDate: formData.isRecurring ? format(formData.endDate, 'yyyy-MM-dd') : null,
        isRecurring: formData.isRecurring,
        recurringDays: formData.isRecurring ? formData.recurringDays : [],
      };
      
      if (initialData?._id) {
        await vendorApi.updateAvailability(initialData._id, payload);
        toast.success('Availability updated successfully');
      } else {
        await vendorApi.addAvailability(payload);
        toast.success('Availability added successfully');
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error(error.response?.data?.message || 'Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  const handleRecurringDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day],
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  color="primary"
                />
              }
              label="Recurring Availability"
            />
          </Grid>

          {!formData.isRecurring ? (
            <Grid item xs={12}>
              <DatePicker
                label="Date"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                  />
                )}
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Available on these days:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  {weekdays.map((day, index) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          checked={formData.recurringDays.includes(index)}
                          onChange={() => handleRecurringDayChange(index)}
                          color="primary"
                        />
                      }
                      label={day.substring(0, 3)}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  minDate={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.endDate}
                      helperText={errors.endDate || 'Leave empty for no end date'}
                    />
                  )}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Start Time"
              value={formData.startTime}
              onChange={(time) => setFormData({ ...formData, startTime: time })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!errors.startTime}
                  helperText={errors.startTime}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="End Time"
              value={formData.endTime}
              onChange={(time) => setFormData({ ...formData, endTime: time })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!errors.endTime}
                  helperText={errors.endTime}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Availability'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </LocalizationProvider>
  );
};

export default AvailabilityForm;
