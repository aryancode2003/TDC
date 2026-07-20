import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  bool _isAuthenticated = false;
  bool _isLoading = false;
  bool _isInitialized = false;
  String _errorMessage = '';
  Map<String, dynamic>? _userProfile;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  String get errorMessage => _errorMessage;
  Map<String, dynamic>? get userProfile => _userProfile;

  AuthService() {
    _checkPersistedAuth();
  }

  Future<void> _checkPersistedAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token != null) {
      _isAuthenticated = true;
      // Load user profile details
      await fetchProfile();
    }
    _isInitialized = true;
    notifyListeners();
  }

  Future<bool> loginWithOtp(String phone, String code) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      // Mock OTP validation or backend response
      final response = await ApiService.post('/auth/verify-otp', {
        'phone': phone,
        'code': code,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final token = data['token'] ?? data['accessToken'] ?? 'mock_token_123';
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', token);
        
        _isAuthenticated = true;
        await fetchProfile();
        return true;
      } else {
        _errorMessage = 'Invalid OTP verification code.';
        return false;
      }
    } catch (e) {
      // For demo fallback if backend is offline
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', 'demo_token_xyz');
      _userProfile = {
        'id': 'cust-123',
        'name': 'Aryan Patel',
        'email': 'aryan@test.com',
        'phone': phone,
      };
      _isAuthenticated = true;
      return true;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchProfile() async {
    try {
      final response = await ApiService.get('/customers/profile');
      if (response.statusCode == 200) {
        _userProfile = jsonDecode(response.body);
      }
    } catch (e) {
      // Fallback
      _userProfile ??= {
        'id': 'cust-123',
        'name': 'Aryan Patel',
        'email': 'aryan@test.com',
        'phone': '+91 9876543210',
      };
    }
    notifyListeners();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    _isAuthenticated = false;
    _userProfile = null;
    notifyListeners();
  }
}
