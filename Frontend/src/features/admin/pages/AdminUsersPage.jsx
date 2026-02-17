import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, MoreVertical, Eye, Ban, CheckCircle2,
  Mail, Calendar, Trophy, TrendingUp, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';

const MOCK_USERS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', college: 'IIT Delhi', role: 'SDE', streak: 28, tasksCompleted: 156, productivity: 78, status: 'active', joinDate: '2024-10-15', lastActive: '2025-02-03' },
  { id: 2, name: 'Priya Patel', email: 'priya@example.com', college: 'NIT Trichy', role: 'Data Engineer', streak: 45, tasksCompleted: 234, productivity: 92, status: 'active', joinDate: '2024-09-20', lastActive: '2025-02-03' },
  { id: 3, name: 'Amit Kumar', email: 'amit@example.com', college: 'BITS Pilani', role: 'Full Stack', streak: 12, tasksCompleted: 89, productivity: 65, status: 'active', joinDate: '2024-11-05', lastActive: '2025-02-02' },
  { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', college: 'IIIT Hyderabad', role: 'AI/ML', streak: 32, tasksCompleted: 178, productivity: 85, status: 'banned', joinDate: '2024-08-12', lastActive: '2025-01-15' },
  { id: 5, name: 'Vikash Singh', email: 'vikash@example.com', college: 'VIT Vellore', role: 'DevOps', streak: 19, tasksCompleted: 112, productivity: 72, status: 'active', joinDate: '2024-10-28', lastActive: '2025-02-01' },
  { id: 6, name: 'Ananya Gupta', email: 'ananya@example.com', college: 'DTU', role: 'Cloud Engineer', streak: 8, tasksCompleted: 45, productivity: 58, status: 'active', joinDate: '2024-12-01', lastActive: '2025-01-25' },
  { id: 7, name: 'Karthik Iyer', email: 'karthik@example.com', college: 'COEP', role: 'Backend', streak: 55, tasksCompleted: 298, productivity: 95, status: 'active', joinDate: '2024-07-18', lastActive: '2025-02-03' },
  { id: 8, name: 'Neha Joshi', email: 'neha@example.com', college: 'NSUT', role: 'Frontend', streak: 0, tasksCompleted: 23, productivity: 42, status: 'active', joinDate: '2024-11-20', lastActive: '2024-12-15' },
];

function UserDetailsModal({ user, onClose, onToggleBan }) {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {user.name.charAt(0)}
            </div>
            <div>
              <p>{user.name}</p>
              <p className="text-sm font-normal text-muted-foreground">{user.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm font-medium">Account Status</span>
            <Badge variant={user.status === 'active' ? 'default' : user.status === 'banned' ? 'destructive' : 'secondary'}>
              {user.status}
            </Badge>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">College</p>
              <p className="font-medium text-sm">{user.college}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Target Role</p>
              <p className="font-medium text-sm">{user.role}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="font-medium text-sm">{new Date(user.joinDate).toLocaleDateString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="font-medium text-sm">🔥 {user.streak} days</p>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasks Completed</span>
              <span className="font-bold">{user.tasksCompleted}</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Avg. Productivity</span>
                <span className="font-bold">{user.productivity}%</span>
              </div>
              <Progress value={user.productivity} className="h-2" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              variant={user.status === 'banned' ? 'default' : 'destructive'}
              className="flex-1"
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
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.college.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleToggleBan = (user) => {
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' }
        : u
    ));
    setSelectedUser(null);
    toast.success(user.status === 'banned' ? 'User unbanned' : 'User banned');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage all registered users</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {users.length} Total Users
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            {users.filter(u => u.status === 'active').length} Active
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">College</th>
                <th className="text-left p-4 font-medium">Target Role</th>
                <th className="text-center p-4 font-medium">Streak</th>
                <th className="text-center p-4 font-medium">Productivity</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="text-center p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  variants={itemVariants}
                  custom={idx}
                  className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{user.college}</td>
                  <td className="p-4">
                    <Badge variant="secondary">{user.role}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-medium">🔥 {user.streak}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Progress value={user.productivity} className="w-16 h-2" />
                      <span className="text-sm font-medium">{user.productivity}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge
                      variant={
                        user.status === 'active' ? 'default' :
                        user.status === 'banned' ? 'destructive' : 'secondary'
                      }
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleBan(user)}>
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
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleBan={handleToggleBan}
      />
    </motion.div>
  );
}
