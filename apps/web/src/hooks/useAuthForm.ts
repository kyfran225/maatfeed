import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../stores';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  type RegisterFormData,
  type LoginFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
  type ChangePasswordFormData,
} from '../lib/validations/auth';

// Hook pour le formulaire d'inscription
export const useRegisterForm = () => {
  const { setLoading } = useAuthStore();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      // Appeler le service d'inscription
      await useAuthStore.getState().register(data.email, data.username, data.password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};

// Hook pour le formulaire de connexion
export const useLoginForm = () => {
  const { setLoading } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await useAuthStore.getState().login(data.email, data.password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};

// Hook pour le formulaire de mot de passe oublié
export const useForgotPasswordForm = () => {
  const setLoading = (loading: boolean) => {
    // Utiliser un état local ou un store global pour le chargement
  };

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      // Appeler le service de mot de passe oublié
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
      }

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};

// Hook pour le formulaire de réinitialisation du mot de passe
export const useResetPasswordForm = () => {
  const setLoading = (loading: boolean) => {
    // Utiliser un état local ou un store global pour le chargement
  };

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      newPassword: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true);
      // Appeler le service de réinitialisation du mot de passe
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la réinitialisation du mot de passe');
      }

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};

// Hook pour le formulaire de changement de mot de passe
export const useChangePasswordForm = () => {
  const setLoading = (loading: boolean) => {
    // Utiliser un état local ou un store global pour le chargement
  };

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement de mot de passe');
      }

      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};
