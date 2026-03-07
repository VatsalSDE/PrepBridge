import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { containerVariants, itemVariants } from '@/utils/animations';
import useAdminStore from '@/store/adminStore';
import { toast } from 'sonner';

const UserDetailsModal = ({ user, onClose, onToggleBan }) => {
  if (!user) return null;

  return (
    <Dialog open={Boolean(user)} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={user.status === 'banned' ? 'destructive' : 'default'}>{user.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-muted-foreground">Joined</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-muted-foreground">College</p>
              <p className="font-medium">{user.college || '-'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-muted-foreground">Target Role</p>
              <p className="font-medium">{user.targetRole || '-'}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              className="flex-1"
              variant={user.status === 'banned' ? 'default' : 'destructive'}
              onClick={() => onToggleBan(user)}
            >
              {user.status === 'banned' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Unban User
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Ban User
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function AdminUsersPage() {
  const fetchUsers = useAdminStore((state) => state.fetchUsers);
  const banUser = useAdminStore((state) => state.banUser);
  const unbanUser = useAdminStore((state) => state.unbanUser);
  const users = useAdminStore((state) => state.users);
  const usersPagination = useAdminStore((state) => state.usersPagination);
  const isLoading = useAdminStore((state) => state.isLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const page = usersPagination?.page || 1;
  const limit = usersPagination?.limit || 20;

  useEffect(() => {
    fetchUsers(page, limit).catch((error) => {
      toast.error(error.message || 'Failed to load users');
    });
  }, [fetchUsers, page, limit]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const haystack = `${user.name || ''} ${user.email || ''} ${user.college || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [users, searchQuery]);

  const total = usersPagination?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const changePage = (nextPage) => {
    fetchUsers(nextPage, limit).catch((error) => {
      toast.error(error.message || 'Failed to change page');
    });
  };

  const handleToggleBan = async (user) => {
    const userId = user._id || user.id;
    try {
      if (user.status === 'banned') {
        await unbanUser(userId);
        toast.success('User unbanned');
      } else {
        await banUser(userId);
        toast.success('User banned');
      }
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">Single admin account manages all users</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{total} total users</Badge>
          <Badge variant="secondary">{users.filter((user) => user.status === 'active').length} active on page</Badge>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name/email/college"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">College</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="text-center p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user._id || user.id}
                  variants={itemVariants}
                  custom={index}
                  className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {(user.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{user.college || '-'}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="capitalize">{user.role || 'student'}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={user.status === 'banned' ? 'destructive' : 'default'}>{user.status}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {user.role === 'admin' ? (
                        <Button variant="ghost" size="icon" title="Single admin account cannot be banned" disabled>
                          <Shield className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleToggleBan(user)}>
                          {user.status === 'banned' ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={page <= 1 || isLoading} onClick={() => changePage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={page >= totalPages || isLoading} onClick={() => changePage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} onToggleBan={handleToggleBan} />
    </motion.div>
  );
}
