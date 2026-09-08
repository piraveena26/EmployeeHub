from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from authentication.models import User, UserRole


class AuthenticationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='test_hr',
            email='hr_test@employeehub.com',
            password='password123',
            first_name='Test',
            last_name='HR',
            role=UserRole.HR_MANAGER
        )

    def test_login_success(self):
        url = reverse('auth_login')
        response = self.client.post(url, {'email': 'hr_test@employeehub.com', 'password': 'password123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['role'], UserRole.HR_MANAGER)

    def test_login_invalid_password(self):
        url = reverse('auth_login')
        response = self.client.post(url, {'email': 'hr_test@employeehub.com', 'password': 'wrongpassword'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_profile(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('auth_me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'hr_test@employeehub.com')
        self.assertEqual(response.data['full_name'], 'Test HR')
