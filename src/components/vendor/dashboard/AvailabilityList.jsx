import { useState, useEffect } from 'react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { vendorApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import AvailabilityForm from './AvailabilityForm';

const AvailabilityList = ({ refreshKey, onRefresh }) => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchAvailabilities();
  }, [refreshKey]);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getAvailability();
      if (response.success) {
        setAvailabilities(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || 'Failed to load availabilities');
      }
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      toast.error(error.message || 'Failed to load availabilities');
      setAvailabilities([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (availability) => {
    setSelectedAvailability(availability);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (availability) => {
    setSelectedAvailability(availability);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAvailability) return;
    
    try {
      const response = await vendorApi.deleteAvailability(selectedAvailability._id);
      if (response.success) {
        toast.success(response.message || 'Availability deleted successfully');
        onRefresh?.();
      } else {
        throw new Error(response.message || 'Failed to delete availability');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error(error.message || 'Failed to delete availability');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAvailability(null);
    }
  };

  const handleMenuOpen = (event, availability) => {
    setAnchorEl(event.currentTarget);
    setSelectedAvailability(availability);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatTimeRange = (start, end) => {
    return `${format(parseISO(start), 'h:mm a')} - ${format(parseISO(end), 'h:mm a')}`;
  };

  const getStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (isPast(start) && (!end || isPast(end))) {
      return { label: 'Expired', color: 'default' };
    }
    
    if (isToday(start) || (start <= now && (!end || now <= end))) {
      return { label: 'Active', color: 'success' };
    }
    
    return { label: 'Upcoming', color: 'info' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading availabilities...</Typography>
      </Box>
    );
  }
  
  if (availabilities.length === 0) {
    return (
      <>
        <Box textAlign="center" p={4}>
          <CalendarIcon color="disabled" style={{ fontSize: 48 }} />
          <Typography variant="h6" gutterBottom>
            No availability slots found
          </Typography>
          <Typography color="textSecondary" paragraph>
            Get started by adding your first availability slot.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedAvailability(null);
              setIsFormOpen(true);
            }}
            startIcon={<CalendarIcon />}
          >
            Add Availability
          </Button>
        </Box>

        <Dialog
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedAvailability(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Availability</DialogTitle>
          <DialogContent dividers>
            <AvailabilityForm
              initialData={null}
              onSuccess={() => {
                setIsFormOpen(false);
                onRefresh?.();
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>Date / Day</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availabilities.map((avail) => {
              const status = getStatus(avail.startDate, avail.endDate);
              const isRecurring = avail.isRecurring && avail.recurringDays?.length > 0;
              
              return (
                <TableRow key={avail._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CalendarIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      <Box>
                        {isRecurring ? (
                          <>
                            <Typography variant="body2">
                              {avail.recurringDays.map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ')}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {format(parseISO(avail.startDate), 'MMM d, yyyy')} - {avail.endDate ? format(parseISO(avail.endDate), 'MMM d, yyyy') : 'No end date'}
                            </Typography>
                          </>
                        ) : (
                          format(parseISO(avail.startDate), 'EEEE, MMM d, yyyy')
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TimeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      {formatTimeRange(avail.startTime, avail.endTime)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={isRecurring ? 'Recurring' : 'One-time'}
                      color={isRecurring ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={status.label}
                      color={status.color}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, avail)}
                        aria-label="more"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedAvailability)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedAvailability)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Availability</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this availability slot? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedAvailability(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAvailability ? 'Edit Availability' : 'Add New Availability'}
        </DialogTitle>
        <DialogContent dividers>
          <AvailabilityForm
            initialData={selectedAvailability}
            onSuccess={() => {
              setIsFormOpen(false);
              onRefresh();
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvailabilityList;
