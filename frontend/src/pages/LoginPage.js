// pages/LoginPage.js — Fleet Manager login screen

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // Where to redirect after login (defaults to /admin)
  const from = location.state?.from || '/admin';

  // Already authenticated → skip login screen
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Login failed. Check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u, p) => { setUsername(u); setPassword(p); setError(''); };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0d1b2a 0%, #1b2d45 100%)'
            : 'linear-gradient(135deg, #e3f0ff 0%, #f5f5f5 100%)',
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* ── Header band ── */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 4,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <DirectionsBusIcon sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Fleet Manager
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Sign in to continue
            </Typography>
          </Box>
        </Box>

        {/* ── Form ── */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ px: 4, pt: 3, pb: 4 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, color: 'text.secondary' }}>
            <LockOutlinedIcon fontSize="small" />
            <Typography variant="body2">Admin credentials required</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            autoFocus
            autoComplete="username"
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Password"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            autoComplete="current-password"
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPass((v) => !v)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2.5 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ borderRadius: 2, py: 1.25, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>

          {/* ── Demo credentials hint ── */}
          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="text.secondary">
              DEMO CREDENTIALS
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="admin / fleet2024"
              size="small"
              variant="outlined"
              color="primary"
              clickable
              onClick={() => fillDemo('admin', 'fleet2024')}
              sx={{ fontFamily: 'monospace', fontSize: 11 }}
            />
            <Chip
              label="viewer / viewer123"
              size="small"
              variant="outlined"
              clickable
              onClick={() => fillDemo('viewer', 'viewer123')}
              sx={{ fontFamily: 'monospace', fontSize: 11 }}
            />
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 1.5, fontSize: 10.5, lineHeight: 1.5 }}
          >
            Click a credential chip to auto-fill, then press Sign In.
            Admin can create, edit and delete vehicles. Viewer has read-only access.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
