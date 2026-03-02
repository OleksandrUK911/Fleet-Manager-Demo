// context/SnackbarContext.js — Global toast notification system
//
// Usage:
//   const { showSuccess, showError, showInfo } = useSnackbar();
//   showSuccess('Vehicle created!');

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const show = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  }, []);

  const showSuccess = useCallback((msg) => show(msg, 'success'), [show]);
  const showError   = useCallback((msg) => show(msg, 'error'),   [show]);
  const showInfo    = useCallback((msg) => show(msg, 'info'),    [show]);
  const showWarning = useCallback((msg) => show(msg, 'warning'), [show]);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnack((s) => ({ ...s, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%', minWidth: 280 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used inside <SnackbarProvider>');
  return ctx;
}
