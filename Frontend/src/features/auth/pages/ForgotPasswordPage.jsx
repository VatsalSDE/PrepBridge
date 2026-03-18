import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, ArrowRight, Loader2, CheckCircle2, KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const resetPasswordWithToken = useAuthStore((state) => state.resetPasswordWithToken);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [showResetScreen, setShowResetScreen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onSubmitEmail = async (data) => {
    try {
      await requestPasswordReset(data.email);
      setResetEmail(data.email);
      setResetToken('');
      setShowResetScreen(true);
      toast.success('Reset OTP sent. Check your email and continue.');
    } catch (error) {
      toast.error(error.message || 'Failed to start password reset. Please try again.');
    }
  };

  const onSubmitNewPassword = async (data) => {
    if (!resetToken || resetToken.length !== 6) {
      toast.error('Please enter a valid 6-digit reset OTP');
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (data.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await resetPasswordWithToken(resetToken, data.newPassword);
      toast.success('Password reset successful! 🎉');
      setResetSuccess(true);
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <span className="font-bold text-2xl text-foreground">PrepBridge</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {!showResetScreen && !resetSuccess && (
          <>
            {/* Email Input Screen */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Reset password</h1>
              <p className="text-muted-foreground">Enter your email to receive reset instructions.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    autoComplete="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Note:</span> If this email is registered, a reset token or link will be sent.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending instructions...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Back to login
                </Link>
              </p>
            </div>
          </>
        )}

        {showResetScreen && (
          <>
            {/* New Password Screen */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Set new password</h1>
              <p className="text-muted-foreground">
                Enter the reset OTP from your email and create a new password for <span className="font-medium text-foreground">{resetEmail}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitNewPassword)} className="space-y-5">
              {/* Reset OTP */}
              <div className="space-y-2">
                <Label htmlFor="token">Reset OTP</Label>
                <div className="relative">
                  <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <div className="pl-6 flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={resetToken}
                      onChange={(value) => setResetToken(String(value || '').replace(/\D/g, ''))}
                      containerClassName="justify-center"
                      render={() => (
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} mask className="h-12 w-12 rounded-md border text-xl" />
                          <InputOTPSlot index={1} mask className="h-12 w-12 rounded-md border text-xl" />
                          <InputOTPSlot index={2} mask className="h-12 w-12 rounded-md border text-xl" />
                          <InputOTPSlot index={3} mask className="h-12 w-12 rounded-md border text-xl" />
                          <InputOTPSlot index={4} mask className="h-12 w-12 rounded-md border text-xl" />
                          <InputOTPSlot index={5} mask className="h-12 w-12 rounded-md border text-xl" />
                        </InputOTPGroup>
                      )}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to your email.</p>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register('newPassword', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                <p className="text-xs font-medium mb-2">Password must contain:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One number</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}

        {resetSuccess && (
          <>
            {/* Success Screen */}
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Password reset successful!</h1>
                <p className="text-muted-foreground">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Go to Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
