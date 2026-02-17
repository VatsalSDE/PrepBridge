import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, ArrowRight, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP } from '@/components/ui/input-otp';
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [showResetScreen, setShowResetScreen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onSubmitEmail = async (data) => {
    setIsLoading(true);
    
    try {
      // Simulate sending OTP to email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResetEmail(data.email);
      setShowOtpScreen(true);
      setCanResendOtp(false);
      setResendTimer(60);
      
      toast.success('Password reset OTP sent to your email!');
      
      // Start resend timer
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('OTP verified! Set your new password.');
      setShowOtpScreen(false);
      setShowResetScreen(true);
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCanResendOtp(false);
      setResendTimer(60);
      setOtp('');
      toast.success('OTP resent to your email!');
      
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  const onSubmitNewPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (data.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Password reset successful! 🎉');
      setResetSuccess(true);
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
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
        {!showOtpScreen && !showResetScreen && !resetSuccess && (
          <>
            {/* Email Input Screen */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Reset password</h1>
              <p className="text-muted-foreground">
                Enter your email and we'll send you an OTP to reset your password
              </p>
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
                  <span className="font-medium text-foreground">💡 Note:</span> If this email is registered with us, you'll receive a 6-digit OTP.
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
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
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

        {showOtpScreen && (
          <>
            {/* OTP Verification Screen */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setShowOtpScreen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5 text-muted-foreground" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Verify OTP</h1>
              </div>
              <p className="text-muted-foreground">
                We've sent a 6-digit OTP to <span className="font-medium text-foreground">{resetEmail}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-3">
                <Label htmlFor="otp">Enter verification code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    render={({ slots }) => (
                      <div className="flex gap-2">
                        {slots.map((slot, index) => (
                          <div key={index} className="relative h-12 w-12">
                            <input
                              {...slot}
                              placeholder="0"
                              type="text"
                              inputMode="numeric"
                              className="absolute inset-0 text-center text-2xl font-semibold border-2 border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">💡 Tip:</span> Check your spam folder if you don't see the email
                </p>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{' '}
                  {canResendOtp ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary hover:underline font-medium"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-primary font-medium">
                      Resend in {resendTimer}s
                    </span>
                  )}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={otpLoading || otp.length !== 6}
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}

        {showResetScreen && (
          <>
            {/* New Password Screen */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Set new password</h1>
              <p className="text-muted-foreground">
                Create a strong password for your account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitNewPassword)} className="space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('newPassword', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                />
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
